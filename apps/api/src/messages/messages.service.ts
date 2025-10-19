import { Injectable } from '@nestjs/common';
import { RedisService } from '../common/redis/redis.service';

@Injectable()
export class MessagesService {
  constructor(private readonly redisService: RedisService) {}

  async getRoomMessages(roomId: string) {
    return this.redisService.getMessages(roomId);
  }
}
