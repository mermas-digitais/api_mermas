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

export function getProxiedUrl(key: string, baseUrl?: string): string {
  const host = baseUrl || 'https://mdapi.fabitz.com.br';
  return `${host}/api/v1/images/${key}`;
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

  const url = getProxiedUrl(fileKey);

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
