import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { S3Service } from '../common/s3/s3.service';

@Module({
  controllers: [FilesController],
  providers: [FilesService],
  imports: [],
})
export class FilesModule {}
