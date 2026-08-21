import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../src/server';

const mockData = [
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
];

let selectCallCount = 0;

vi.mock('../src/db', () => {
  return {
    db: {
      select: (args?: any) => {
        selectCallCount++;
        if (selectCallCount === 1 || args?.total) {
          return {
            from: () => ({
              where: () => Promise.resolve([{ total: 1 }]),
            }),
          };
        }
        return {
          from: () => {
            const chain: any = {};
            chain.where = () => chain;
            chain.orderBy = () => chain;
            chain.limit = () => chain;
            chain.offset = () => Promise.resolve(mockData);
            return chain;
          },
        };
      },
    },
  };
});

describe('Acervo Endpoints', () => {
  it('GET /api/v1/acervo deve retornar 200 e resposta paginada', async () => {
    selectCallCount = 0;
    const res = await request(app).get('/api/v1/acervo');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBeDefined();
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(20);
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
