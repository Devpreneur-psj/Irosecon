import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload/sign')
  async generateUploadSignedUrl(
    @Body() body: {
      roomId: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
    },
  ) {
    return this.filesService.generateUploadSignedUrl(
      body.roomId,
      body.fileName,
      body.fileSize,
      body.mimeType,
    );
  }

  @Post('download/sign')
  async generateDownloadSignedUrl(
    @Body() body: {
      roomId: string;
      fileId: string;
      fileName: string;
    },
  ) {
    const downloadUrl = await this.filesService.generateDownloadSignedUrl(
      body.roomId,
      body.fileId,
      body.fileName,
    );
    return { downloadUrl };
  }
}
