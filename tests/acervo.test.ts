import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../src/server';

vi.mock('../src/db', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          orderBy: () =>
            Promise.resolve([
              {
                id: 'test-uuid-1',
                title: 'Artigo Científico de Exemplo',
                type: 'artigo',
                subType: 'resumo expandido',
                publicationPlace: 'Revista de TI',
                doi: '10.1000/182',
                authors: ['Autor A', 'Autor B'],
                images: [],
                attachment: null,
                createdAt: new Date().toISOString(),
              },
            ]),
        }),
        orderBy: () =>
          Promise.resolve([
            {
              id: 'test-uuid-1',
              title: 'Artigo Científico de Exemplo',
              type: 'artigo',
              subType: 'resumo expandido',
              publicationPlace: 'Revista de TI',
              doi: '10.1000/182',
              authors: ['Autor A', 'Autor B'],
              images: [],
              attachment: null,
              createdAt: new Date().toISOString(),
            },
          ]),
      }),
    }),
  },
}));

describe('Acervo Endpoints', () => {
  it('GET /api/v1/acervo deve retornar 200 e lista de itens', async () => {
    const res = await request(app).get('/api/v1/acervo');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].title).toBe('Artigo Científico de Exemplo');
  });

  it('POST /api/v1/acervo sem autenticação deve retornar 401 Não autorizado', async () => {
    const res = await request(app)
      .post('/api/v1/acervo')
      .send({ title: 'Novo Jogo', type: 'jogo' });
    expect(res.status).toBe(401);
  });

  it('PUT /api/v1/acervo/:id sem autenticação deve retornar 401 Não autorizado', async () => {
    const res = await request(app)
      .put('/api/v1/acervo/test-uuid-1')
      .send({ title: 'Jogo Alterado' });
    expect(res.status).toBe(401);
  });

  it('DELETE /api/v1/acervo/:id sem autenticação deve retornar 401 Não autorizado', async () => {
    const res = await request(app).delete('/api/v1/acervo/test-uuid-1');
    expect(res.status).toBe(401);
  });
});
