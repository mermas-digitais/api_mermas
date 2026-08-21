import { describe, it, expect } from 'vitest';
import { FileMetadata } from '../src/utils/s3Upload';

describe('S3 Utility Types & Helper Specs', () => {
  it('deve formatar corretamente a estrutura FileMetadata', () => {
    const meta: FileMetadata = {
      url: 'http://localhost:3900/mermas-acervo/acervo/test.png',
      key: 'acervo/test.png',
      fileName: 'test.png',
      mimeType: 'image/png',
      size: 2048,
    };
    expect(meta.url).toContain('http');
    expect(meta.key).toBe('acervo/test.png');
    expect(meta.fileName).toBe('test.png');
  });
});
