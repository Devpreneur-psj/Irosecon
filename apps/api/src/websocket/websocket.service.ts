import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../common/redis/redis.service';

@Injectable()
export class WebSocketService {
  private readonly logger = new Logger(WebSocketService.name);

  constructor(private readonly redisService: RedisService) {}

  async getActiveRooms(): Promise<any[]> {
    try {
      // 간단한 구현 - 실제로는 Redis에서 활성 룸들 조회
      return [];
    } catch (error) {
      this.logger.error('Error getting active rooms:', error);
      return [];
    }
  }

  async getRoomParticipants(roomId: string): Promise<any[]> {
    try {
      return await this.redisService.getParticipants(roomId);
    } catch (error) {
      this.logger.error('Error getting room participants:', error);
      return [];
    }
  }

  async getRoomTimeRemaining(roomId: string): Promise<number> {
    try {
      const ttl = await this.redisService.getRoomTTL(roomId);
      return ttl > 0 ? ttl : 0;
    } catch (error) {
      this.logger.error('Error getting room time remaining:', error);
      return 0;
    }
  }

  async isRoomActive(roomId: string): Promise<boolean> {
    try {
      const room = await this.redisService.getRoom(roomId);
      return room ? room.status === 'active' : false;
    } catch (error) {
      this.logger.error('Error checking room status:', error);
      return false;
    }
  }

  async getAdminRoomInfo(roomId: string): Promise<any> {
    try {
      const room = await this.redisService.getRoom(roomId);
      if (!room) return null;

      const participants = await this.redisService.getParticipants(roomId);
      const timeRemaining = await this.getRoomTimeRemaining(roomId);

      return {
        ...room,
        participants,
        timeRemaining,
        participantCount: participants.length,
      };
    } catch (error) {
      this.logger.error('Error getting admin room info:', error);
      return null;
    }
  }
}