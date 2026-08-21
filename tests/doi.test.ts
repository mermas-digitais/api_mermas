import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server';

describe('DOI Lookup Endpoint', () => {
  it('GET /api/v1/doi?doi=... deve retornar metadados de um artigo válido', async () => {
    const res = await request(app).get('/api/v1/doi?doi=10.1038/nature12373');
    expect(res.status).toBe(200);
    expect(res.body.doi).toBe('10.1038/nature12373');
    expect(res.body.title).toBeDefined();
    expect(Array.isArray(res.body.authors)).toBe(true);
    expect(res.body.source).toBe('crossref');
  });

  it('GET /api/v1/doi sem parâmetro deve retornar 400', async () => {
    const res = await request(app).get('/api/v1/doi');
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('obrigatório');
  });

  it('GET /api/v1/doi com DOI inexistente deve retornar 404', async () => {
    const res = await request(app).get('/api/v1/doi?doi=10.9999/naoexiste999');
    expect(res.status).toBe(404);
    expect(res.body.message).toContain('Nenhum artigo encontrado');
  });

  it('GET /api/v1/doi deve aceitar DOI no formato URL', async () => {
    const res = await request(app).get(
      '/api/v1/doi?doi=https://doi.org/10.1038/nature12373'
    );
    expect(res.status).toBe(200);
    expect(res.body.doi).toBe('10.1038/nature12373');
    expect(res.body.title).toBeDefined();
    expect(res.body.source).toBe('crossref');
  });
});
