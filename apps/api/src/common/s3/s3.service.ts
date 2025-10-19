import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private files = new Map<string, any>();

  constructor(private configService: ConfigService) {}

  async generateUploadSignedUrl(
    roomId: string,
    fileName: string,
    contentType: string,
    expiresIn = 3600
  ): Promise<any> {
    const fileId = this.generateFileId();
    const uploadUrl = `http://localhost:3001/files/upload/${fileId}`;
    
    // 파일 메타데이터 저장
    this.files.set(fileId, {
      roomId,
      fileName,
      contentType,
      uploadedAt: new Date().toISOString(),
    });

    return {
      uploadUrl,
      fileId,
      expiresIn,
    };
  }

  async generateDownloadSignedUrl(
    roomId: string,
    fileId: string,
    fileName: string,
    expiresIn = 3600
  ): Promise<string> {
    return `http://localhost:3001/files/download/${fileId}`;
  }

  async deleteFile(roomId: string, fileId: string, fileName: string): Promise<void> {
    this.files.delete(fileId);
  }

  async deleteRoomFiles(roomId: string): Promise<void> {
    for (const [fileId, file] of this.files.entries()) {
      if (file.roomId === roomId) {
        this.files.delete(fileId);
      }
    }
  }

  private generateFileId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  validateFileType(fileName: string, allowedTypes: string[]): boolean {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension ? allowedTypes.includes(extension) : false;
  }

  validateFileSize(fileSize: number, maxSizeBytes = 10 * 1024 * 1024): boolean {
    return fileSize <= maxSizeBytes;
  }

  sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 255);
  }

  async getFileMetadata(roomId: string, fileId: string, fileName: string): Promise<any> {
    return this.files.get(fileId) || null;
  }

  async checkConnection(): Promise<boolean> {
    return true; // 간단한 구현
  }
}