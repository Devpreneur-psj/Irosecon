import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private rooms = new Map<string, any>();
  private participants = new Map<string, any[]>();
  private messages = new Map<string, any[]>();
  private isConnected = true;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    console.log('📦 Redis Service initialized (in-memory mode)');
  }

  async onModuleDestroy() {
    this.rooms.clear();
    this.participants.clear();
    this.messages.clear();
  }

  // 룸 관리
  async createRoom(roomId: string, roomData: any, ttlSeconds = 900): Promise<void> {
    const data = {
      ...roomData,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
      status: 'active',
    };
    
    this.rooms.set(roomId, data);
    this.participants.set(roomId, []);
    this.messages.set(roomId, []);
    
    // TTL 타이머 설정
    setTimeout(() => {
      this.deleteRoom(roomId);
    }, ttlSeconds * 1000);
  }

  async getRoom(roomId: string): Promise<any | null> {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    
    return {
      ...room,
      createdAt: new Date(room.createdAt),
      expiresAt: new Date(room.expiresAt),
    };
  }

  async updateRoom(roomId: string, updates: any): Promise<void> {
    const existing = this.rooms.get(roomId);
    if (!existing) return;
    
    const updated = { ...existing, ...updates };
    this.rooms.set(roomId, updated);
  }

  async extendRoom(roomId: string, additionalSeconds: number): Promise<void> {
    const room = this.rooms.get(roomId);
    if (!room) return;
    
    const newExpiresAt = new Date(Date.now() + additionalSeconds * 1000);
    await this.updateRoom(roomId, { expiresAt: newExpiresAt });
  }

  async deleteRoom(roomId: string): Promise<void> {
    this.rooms.delete(roomId);
    this.participants.delete(roomId);
    this.messages.delete(roomId);
  }

  // 참여자 관리
  async addParticipant(roomId: string, participant: any): Promise<void> {
    const participants = this.participants.get(roomId) || [];
    participants.push(participant);
    this.participants.set(roomId, participants);
  }

  async removeParticipant(roomId: string, participantId: string): Promise<void> {
    const participants = this.participants.get(roomId) || [];
    const filtered = participants.filter(p => p.id !== participantId);
    this.participants.set(roomId, filtered);
  }

  async getParticipants(roomId: string): Promise<any[]> {
    return this.participants.get(roomId) || [];
  }

  // 메시지 관리
  async addMessage(roomId: string, messageId: string, messageData: any): Promise<void> {
    const messages = this.messages.get(roomId) || [];
    messages.push({ id: messageId, ...messageData });
    this.messages.set(roomId, messages);
  }

  async getMessages(roomId: string): Promise<any[]> {
    return this.messages.get(roomId) || [];
  }

  async clearMessages(roomId: string): Promise<void> {
    this.messages.set(roomId, []);
  }

  // 세션 관리
  async setSession(sessionId: string, data: any, ttlSeconds = 3600): Promise<void> {
    // 간단한 메모리 세션 관리
    console.log(`Session set: ${sessionId}`);
  }

  async getSession(sessionId: string): Promise<any | null> {
    return null; // 간단한 구현
  }

  async deleteSession(sessionId: string): Promise<void> {
    console.log(`Session deleted: ${sessionId}`);
  }

  // 룸 정리
  async cleanupExpiredRooms(): Promise<string[]> {
    const expiredRooms: string[] = [];
    
    for (const [roomId, room] of this.rooms.entries()) {
      if (new Date(room.expiresAt) < new Date()) {
        expiredRooms.push(roomId);
        await this.deleteRoom(roomId);
      }
    }
    
    return expiredRooms;
  }

  async cleanupRoom(roomId: string): Promise<void> {
    await this.deleteRoom(roomId);
  }

  isRedisConnected(): boolean {
    return this.isConnected;
  }

  async getRoomTTL(roomId: string): Promise<number> {
    const room = this.rooms.get(roomId);
    if (!room) return 0;
    
    const remaining = new Date(room.expiresAt).getTime() - Date.now();
    return Math.max(0, Math.floor(remaining / 1000));
  }
}