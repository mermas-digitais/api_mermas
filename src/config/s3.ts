import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

export const s3Client = new S3Client({
  region: 'garage',
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:3900',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
  forcePathStyle: true,
});

export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'md-website';
