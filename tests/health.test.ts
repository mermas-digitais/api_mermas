import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server';

describe('Healthcheck Endpoint', () => {
  it('GET /api/v1/health deve retornar status 200 e mensagem de status ok', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'ok',
      message: 'API Mermas Acervo v1 online',
    });
  });
});
