import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  async getActiveRooms() {
    return this.roomsService.getActiveRooms();
  }

  @Get(':id')
  async getRoom(@Param('id') id: string) {
    return this.roomsService.getRoom(id);
  }

  @Post(':id/extend')
  async extendRoom(
    @Param('id') id: string,
    @Body() body: { additionalMinutes: number },
  ) {
    return this.roomsService.extendRoom(id, body.additionalMinutes);
  }
}
