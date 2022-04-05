import * as _ from 'lodash';
import { Injectable } from '@nestjs/common';
import * as short from 'short-uuid';
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  // S3 Client
  private readonly client: S3Client;

  constructor(private readonly cfg: ConfigService) {
    this.client = new S3Client({
      endpoint: cfg.get<string>('s3.endpoint'),
      region: cfg.get<string>('s3.region'),
      credentials: {
        accessKeyId: cfg.get<string>('s3.key'),
        secretAccessKey: cfg.get<string>('s3.secret'),
      },
    });
  }

  getFileURL(name: string) {
    return this.cfg.get<string>('s3.endpoint') + '/lookmenu/uploads/' + name;
  }

  async putObject(file: Express.Multer.File) {
    // Get file's extension
    const ext = _.last(file.originalname.split('.'));

    // Generate filename
    const fileName = short.generate() + '.' + ext;

    // Prepare for upload
    const input: PutObjectCommandInput = {
      Bucket: 'lookmenu',
      Key: 'uploads/' + fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    // Upload
    await this.client.send(new PutObjectCommand(input));

    // Return url
    return this.getFileURL(fileName);
  }
}
