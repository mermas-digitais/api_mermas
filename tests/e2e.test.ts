import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/server';
import { db } from '../src/db';
import { user, acervo } from '../src/db/schema';
import { eq } from 'drizzle-orm';

describe('Suíte E2E: Fluxo Completo de Usuário e Acervo', () => {
  const testUser = {
    name: 'Usuário Teste E2E',
    email: `e2e_${Date.now()}@mermas.com`,
    password: 'passwordSegura123',
  };

  let authCookie = '';
  const createdAcervoIds: string[] = [];

  beforeAll(async () => {
    const registerRes = await request(app)
      .post('/api/v1/auth/sign-up/email')
      .send(testUser);

    if (registerRes.headers['set-cookie']) {
      const cookies = registerRes.headers['set-cookie'];
      authCookie = Array.isArray(cookies) ? cookies.join('; ') : cookies;
    }

    if (!authCookie) {
      const loginRes = await request(app)
        .post('/api/v1/auth/sign-in/email')
        .send({ email: testUser.email, password: testUser.password });

      if (loginRes.headers['set-cookie']) {
        const cookies = loginRes.headers['set-cookie'];
        authCookie = Array.isArray(cookies) ? cookies.join('; ') : cookies;
      }
    }
  });

  afterAll(async () => {
    try {
      for (const id of createdAcervoIds) {
        await db.delete(acervo).where(eq(acervo.id, id));
      }
      await db.delete(user).where(eq(user.email, testUser.email));
    } catch (err) {
      console.warn('Limpeza final do banco no teste E2E:', err);
    }
  });

  it('1. Deve criar um item no acervo do tipo "jogo"', async () => {
    const res = await request(app)
      .post('/api/v1/acervo')
      .set('Cookie', authCookie)
      .field('title', 'Jogo E2E Teste')
      .field('description', 'Descrição do jogo de teste')
      .field('type', 'jogo');

    expect([201, 200]).toContain(res.status);
    if (res.body?.id) {
      createdAcervoIds.push(res.body.id);
    }
  });

  it('2. Deve criar um item no acervo do tipo "artigo"', async () => {
    const res = await request(app)
      .post('/api/v1/acervo')
      .set('Cookie', authCookie)
      .field('title', 'Artigo E2E Teste')
      .field('type', 'artigo')
      .field('subType', 'resumo expandido')
      .field('publicationPlace', 'Revista E2E')
      .field('doi', '10.1234/e2etest')
      .field('authors', 'Autor E2E 1, Autor E2E 2')
      .field('externalUrl', 'https://exemplo.com/artigo.pdf');

    expect([201, 200]).toContain(res.status);
    if (res.body?.id) {
      createdAcervoIds.push(res.body.id);
    }
  });

  it('3. Deve criar um item no acervo do tipo "material"', async () => {
    const res = await request(app)
      .post('/api/v1/acervo')
      .set('Cookie', authCookie)
      .field('title', 'Material de Aula E2E')
      .field('description', 'Apostila de aula')
      .field('type', 'material');

    expect([201, 200]).toContain(res.status);
    if (res.body?.id) {
      createdAcervoIds.push(res.body.id);
    }
  });

  it('4. Deve criar um item no acervo do tipo "certificado"', async () => {
    const res = await request(app)
      .post('/api/v1/acervo')
      .set('Cookie', authCookie)
      .field('title', 'Certificado E2E')
      .field('description', 'Certificado de conclusão de curso')
      .field('type', 'certificado');

    expect([201, 200]).toContain(res.status);
    if (res.body?.id) {
      createdAcervoIds.push(res.body.id);
    }
  });

  it('5. Deve listar itens do acervo com paginação', async () => {
    const res = await request(app).get('/api/v1/acervo?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(10);
    expect(typeof res.body.pagination.total).toBe('number');
    expect(typeof res.body.pagination.totalPages).toBe('number');
    expect(typeof res.body.pagination.hasNext).toBe('boolean');
    expect(typeof res.body.pagination.hasPrev).toBe('boolean');
  });

  it('6. Deve filtrar itens por tipo', async () => {
    const res = await request(app).get('/api/v1/acervo?type=jogo');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.pagination).toBeDefined();
  });

  it('7. Deve ordenar itens por título asc', async () => {
    const res = await request(app).get('/api/v1/acervo?sortBy=title&order=asc');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.pagination).toBeDefined();
  });

  it('8. Deve filtrar por período de data', async () => {
    const res = await request(app).get('/api/v1/acervo?from=2026-01-01&to=2026-12-31');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.pagination).toBeDefined();
  });

  it('9. Deve buscar metadados de artigo via DOI', async () => {
    const res = await request(app).get('/api/v1/doi?doi=10.1038/nature12373');
    expect(res.status).toBe(200);
    expect(res.body.doi).toBe('10.1038/nature12373');
    expect(res.body.source).toBe('crossref');
  });
});
