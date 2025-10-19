import { Injectable } from '@nestjs/common';
import { S3Service } from '../common/s3/s3.service';

@Injectable()
export class FilesService {
  constructor(private readonly s3Service: S3Service) {}

  async generateUploadSignedUrl(
    roomId: string,
    fileName: string,
    fileSize: number,
    mimeType: string,
  ) {
    // 파일 타입 검증
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(mimeType)) {
      throw new Error('Unsupported file type');
    }

    // 파일 크기 검증 (10MB 제한)
    if (!this.s3Service.validateFileSize(fileSize, 10 * 1024 * 1024)) {
      throw new Error('File too large');
    }

    // 안전한 파일명 생성
    const safeFileName = this.s3Service.sanitizeFileName(fileName);

    return this.s3Service.generateUploadSignedUrl(
      roomId,
      safeFileName,
      mimeType,
    );
  }

  async generateDownloadSignedUrl(
    roomId: string,
    fileId: string,
    fileName: string,
  ) {
    const safeFileName = this.s3Service.sanitizeFileName(fileName);
    
    return this.s3Service.generateDownloadSignedUrl(
      roomId,
      fileId,
      safeFileName,
    );
  }

  async deleteFile(
    roomId: string,
    fileId: string,
    fileName: string,
  ) {
    const safeFileName = this.s3Service.sanitizeFileName(fileName);
    
    return this.s3Service.deleteFile(roomId, fileId, safeFileName);
  }
}
