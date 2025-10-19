import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../common/redis/redis.service';
import { S3Service } from '../common/s3/s3.service';

@Injectable()
@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
})
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGateway.name);
  private readonly connectedClients = new Map<string, Socket>();

  constructor(
    private readonly redisService: RedisService,
    private readonly s3Service: S3Service,
  ) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
    
    // 연결 해제 시 참여자 제거
    await this.handleParticipantDisconnect(client);
  }

  @SubscribeMessage('room:join')
  async handleJoinRoom(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { roomId, nickname, publicKey, supervisorConsent } = data;

      // 룸 존재 확인
      let room = await this.redisService.getRoom(roomId);
      if (!room) {
        // 새 룸 생성
        room = {
          id: roomId,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15분
          participants: [],
          supervisorConsent,
          status: 'active',
        };
        await this.redisService.createRoom(roomId, room, 900); // 15분 TTL
      }

      // 참여자 생성
      const participant = {
        id: client.id,
        nickname,
        publicKey,
        role: 'user',
        joinedAt: new Date(),
      };

      // 참여자 추가
      await this.redisService.addParticipant(roomId, participant);
      
      // 룸에 참여자 추가
      room.participants.push(participant);
      await this.redisService.updateRoom(roomId, { participants: room.participants });

      // 클라이언트를 룸에 조인
      await client.join(roomId);

      // 다른 참여자들에게 알림
      client.to(roomId).emit('system:participant-joined', {
        roomId,
        participant,
      });

      // 클라이언트에게 성공 응답
      client.emit('room:joined', {
        roomId,
        participant,
        room,
      });

      this.logger.log(`Participant ${nickname} joined room ${roomId}`);
    } catch (error) {
      this.logger.error('Error joining room:', error);
      client.emit('error', { message: 'Failed to join room' });
    }
  }

  @SubscribeMessage('room:leave')
  async handleLeaveRoom(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { roomId } = data;

      // 참여자 제거
      await this.redisService.removeParticipant(roomId, client.id);
      
      // 룸에서 참여자 제거
      const room = await this.redisService.getRoom(roomId);
      if (room) {
        room.participants = room.participants.filter(p => p.id !== client.id);
        await this.redisService.updateRoom(roomId, { participants: room.participants });
      }

      // 룸에서 나가기
      await client.leave(roomId);

      // 다른 참여자들에게 알림
      client.to(roomId).emit('system:participant-left', {
        roomId,
        participantId: client.id,
        leftAt: new Date(),
      });

      this.logger.log(`Participant ${client.id} left room ${roomId}`);
    } catch (error) {
      this.logger.error('Error leaving room:', error);
    }
  }

  @SubscribeMessage('room:extend')
  async handleExtendRoom(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { roomId, additionalMinutes = 15 } = data;

      // 룸 존재 확인
      const room = await this.redisService.getRoom(roomId);
      if (!room) {
        client.emit('error', { message: 'Room not found' });
        return;
      }

      // 세션 연장
      const additionalSeconds = additionalMinutes * 60;
      await this.redisService.extendRoom(roomId, additionalSeconds);

      // 모든 참여자에게 알림
      this.server.to(roomId).emit('room:extended', {
        roomId,
        additionalMinutes,
        newExpiresAt: new Date(Date.now() + additionalSeconds * 1000),
      });

      this.logger.log(`Room ${roomId} extended by ${additionalMinutes} minutes`);
    } catch (error) {
      this.logger.error('Error extending room:', error);
      client.emit('error', { message: 'Failed to extend room' });
    }
  }

  @SubscribeMessage('room:end')
  async handleEndRoom(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { roomId, reason } = data;

      // 룸 종료 처리
      await this.endRoom(roomId, reason);

      this.logger.log(`Room ${roomId} ended by ${client.id}, reason: ${reason}`);
    } catch (error) {
      this.logger.error('Error ending room:', error);
      client.emit('error', { message: 'Failed to end room' });
    }
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { roomId, content, metadata } = data;

      // 룸 존재 확인
      const room = await this.redisService.getRoom(roomId);
      if (!room) {
        client.emit('error', { message: 'Room not found' });
        return;
      }

      // 참여자 확인
      const participant = room.participants.find(p => p.id === client.id);
      if (!participant) {
        client.emit('error', { message: 'Not a participant of this room' });
        return;
      }

      // 메시지 생성
      const message = {
        id: this.generateMessageId(),
        roomId,
        senderId: client.id,
        senderNickname: participant.nickname,
        type: 'text',
        content, // 암호화된 내용
        metadata,
        timestamp: new Date(),
        encrypted: true,
      };

      // 메시지를 임시 버퍼에 저장
      await this.redisService.addMessage(roomId, message.id, message);

      // 모든 참여자에게 메시지 전송
      this.server.to(roomId).emit('message:received', message);

      this.logger.log(`Message sent in room ${roomId} by ${participant.nickname}`);
    } catch (error) {
      this.logger.error('Error sending message:', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('message:typing')
  async handleTyping(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { roomId, isTyping } = data;

      // 다른 참여자들에게 타이핑 상태 전송
      client.to(roomId).emit('message:typing', {
        roomId,
        participantId: client.id,
        isTyping,
      });
    } catch (error) {
      this.logger.error('Error handling typing:', error);
    }
  }

  @SubscribeMessage('file:upload')
  async handleFileUpload(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { roomId, fileName, fileSize, mimeType } = data;

      // 파일 타입 및 크기 검증
      if (!this.s3Service.validateFileSize(fileSize)) {
        client.emit('error', { message: 'File too large' });
        return;
      }

      // Pre-signed URL 생성
      const uploadResponse = await this.s3Service.generateUploadSignedUrl(
        roomId,
        fileName,
        mimeType,
      );

      client.emit('file:upload-url', uploadResponse);
    } catch (error) {
      this.logger.error('Error handling file upload:', error);
      client.emit('error', { message: 'Failed to generate upload URL' });
    }
  }

  // 룸 종료 처리
  private async endRoom(roomId: string, reason: string) {
    try {
      // 룸 상태 업데이트
      await this.redisService.updateRoom(roomId, { status: 'ended' });

      // 모든 참여자에게 룸 종료 알림
      this.server.to(roomId).emit('system:room-ended', {
        roomId,
        reason,
        endedAt: new Date(),
      });

      // 룸 정리 (비동기)
      setTimeout(async () => {
        await this.cleanupRoom(roomId);
      }, 5000); // 5초 후 정리

    } catch (error) {
      this.logger.error('Error ending room:', error);
    }
  }

  // 룸 정리
  private async cleanupRoom(roomId: string) {
    try {
      // Redis에서 룸 데이터 삭제
      await this.redisService.cleanupRoom(roomId);

      // S3에서 룸 파일들 삭제
      await this.s3Service.deleteRoomFiles(roomId);

      this.logger.log(`Room ${roomId} cleaned up`);
    } catch (error) {
      this.logger.error('Error cleaning up room:', error);
    }
  }

  // 참여자 연결 해제 처리
  private async handleParticipantDisconnect(client: Socket) {
    // 모든 룸에서 참여자 제거
    const expiredRooms = await this.redisService.cleanupExpiredRooms();
    
    for (const roomId of expiredRooms) {
      await this.redisService.removeParticipant(roomId, client.id);
      
      // 다른 참여자들에게 알림
      client.to(roomId).emit('system:participant-left', {
        roomId,
        participantId: client.id,
        leftAt: new Date(),
      });
    }
  }

  // 메시지 ID 생성
  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // 만료된 룸들 정리 (주기적 실행)
  async cleanupExpiredRooms() {
    try {
      const expiredRooms = await this.redisService.cleanupExpiredRooms();
      
      for (const roomId of expiredRooms) {
        // 모든 참여자에게 룸 만료 알림
        this.server.to(roomId).emit('system:room-expired', {
          roomId,
          expiredAt: new Date(),
        });

        // 룸 정리
        await this.cleanupRoom(roomId);
      }

      if (expiredRooms.length > 0) {
        this.logger.log(`Cleaned up ${expiredRooms.length} expired rooms`);
      }
    } catch (error) {
      this.logger.error('Error cleaning up expired rooms:', error);
    }
  }
}