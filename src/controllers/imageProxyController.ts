import { Request, Response } from 'express';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, S3_BUCKET_NAME } from '../config/s3';

export const imageProxyController = {
  serveImage: async (req: Request, res: Response) => {
    try {
      const key = (req.params as any)[0];

      if (!key) {
        return res.status(400).json({ message: 'Chave do arquivo não informada' });
      }

      const command = new GetObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
      });

      const response = await s3Client.send(command);

      if (!response.Body) {
        return res.status(404).json({ message: 'Imagem não encontrada' });
      }

      res.setHeader('Content-Type', response.ContentType || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

      const stream = response.Body as NodeJS.ReadableStream;
      stream.pipe(res);
    } catch (error: any) {
      if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
        return res.status(404).json({ message: 'Imagem não encontrada' });
      }
      console.error('Erro ao servir imagem:', error);
      return res.status(500).json({ message: 'Erro ao acessar imagem' });
    }
  },
};

export default imageProxyController;
