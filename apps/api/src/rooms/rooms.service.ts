import { Injectable } from '@nestjs/common';
import { RedisService } from '../common/redis/redis.service';
import { WebSocketService } from '../websocket/websocket.service';

@Injectable()
export class RoomsService {
  constructor(
    private readonly redisService: RedisService,
    private readonly webSocketService: WebSocketService,
  ) {}

  async getActiveRooms() {
    return this.webSocketService.getActiveRooms();
  }

  async getRoom(id: string) {
    return this.redisService.getRoom(id);
  }

  async extendRoom(id: string, additionalMinutes: number) {
    const additionalSeconds = additionalMinutes * 60;
    await this.redisService.extendRoom(id, additionalSeconds);
    return { success: true, additionalMinutes };
  }
}
