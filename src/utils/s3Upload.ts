import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, S3_BUCKET_NAME } from '../config/s3';
import crypto from 'crypto';

export interface FileMetadata {
  url: string;
  key: string;
  fileName: string;
  mimeType?: string;
  size?: number;
}

export async function uploadToS3(
  file: Express.Multer.File,
  folder = 'acervo'
): Promise<FileMetadata> {
  const extension = file.originalname.split('.').pop();
  const fileKey = `${folder}/${crypto.randomUUID()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  const endpoint = (process.env.S3_ENDPOINT || 'http://localhost:3900').replace(/\/$/, '');
  const url = `${endpoint}/${S3_BUCKET_NAME}/${fileKey}`;

  return {
    url,
    key: fileKey,
    fileName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
  };
}

export async function deleteFromS3(fileKey: string): Promise<void> {
  if (!fileKey) return;
  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: fileKey,
  });
  await s3Client.send(command);
}
