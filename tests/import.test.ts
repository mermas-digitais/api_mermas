import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/server';

vi.mock('../src/db', () => ({
  db: {
    insert: () => ({
      values: () => Promise.resolve([]),
    }),
  },
}));

vi.mock('../src/routers/middleware', () => ({
  default: (req: any, _res: any, next: any) => {
    req.user = { id: 'test-user-id', email: 'test@test.com' };
    next();
  },
  verifyToken: (req: any, _res: any, next: any) => {
    req.user = { id: 'test-user-id', email: 'test@test.com' };
    next();
  },
}));

const validCsv = `title,type,description,publicationYear,authors
Jogo de Lógica,jogo,Jogo educativo para ensino de lógica,2024,Ana Silva; Carlos Souza
Artigo sobre IA,artigo,Resumo de inteligência artificial,2023,João Pereira
Material de Programação,material,Apostila de Python,2025,,
Certificado Python,certificado,Certificado de conclusão,2024,Maria Souza`;

const invalidTypeCsv = `title,type
Jogo Inválido,video`;

const missingTitleCsv = `type
artigo`;

describe('Acervo CSV Import Endpoint', () => {
  it('POST /api/v1/acervo/import deve importar CSV válido', async () => {
    const res = await request(app)
      .post('/api/v1/acervo/import')
      .attach('file', Buffer.from(validCsv, 'utf-8'), 'acervo.csv');

    expect(res.status).toBe(201);
    expect(res.body.imported).toBe(4);
    expect(res.body.totalRows).toBe(4);
    expect(res.body.errors).toEqual([]);
  });

  it('POST /api/v1/acervo/import deve retornar erros para tipo inválido', async () => {
    const res = await request(app)
      .post('/api/v1/acervo/import')
      .attach('file', Buffer.from(invalidTypeCsv, 'utf-8'), 'invalid.csv');

    expect(res.status).toBe(201);
    expect(res.body.imported).toBe(0);
    expect(res.body.errors.length).toBe(1);
    expect(res.body.errors[0].row).toBe(2);
    expect(res.body.errors[0].message).toContain('Tipo inválido');
  });

  it('POST /api/v1/acervo/import deve retornar erros para título ausente', async () => {
    const res = await request(app)
      .post('/api/v1/acervo/import')
      .attach('file', Buffer.from(missingTitleCsv, 'utf-8'), 'notitle.csv');

    expect(res.status).toBe(201);
    expect(res.body.imported).toBe(0);
    expect(res.body.errors.length).toBe(1);
    expect(res.body.errors[0].message).toContain('Título');
  });

  it('POST /api/v1/acervo/import sem arquivo deve retornar 400', async () => {
    const res = await request(app)
      .post('/api/v1/acervo/import');

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('não enviado');
  });
});
