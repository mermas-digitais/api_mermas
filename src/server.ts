import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth';
import acervoRouter from './routers/acervoRouter';
import { swaggerSpec } from './config/swagger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.set('trust proxy', true);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  const host = req.get('host') || '';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  const rawProto = req.headers['x-forwarded-proto'];
  const reqProto = Array.isArray(rawProto) ? rawProto[0] : rawProto || req.protocol;
  const protocol = isLocal ? reqProto : 'https';
  const baseUrl = `${protocol}://${host}`;

  res.json({
    name: 'API Mermas - Acervo Digital',
    version: '1.0.0',
    status: 'online',
    docs: `${baseUrl}/api/v1/docs`,
    openapi_json: `${baseUrl}/api/v1/openapi.json`,
    endpoints: {
      health: `${baseUrl}/api/v1/health`,
      docs: `${baseUrl}/api/v1/docs`,
      openapi_json: `${baseUrl}/api/v1/openapi.json`,
      auth: `${baseUrl}/api/v1/auth`,
      acervo: `${baseUrl}/api/v1/acervo`,
    },
  });
});

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', message: 'API Mermas Acervo v1 online' });
});

app.get('/api/v1/openapi.json', (_req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename="openapi.json"');
  res.json(swaggerSpec);
});

app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.all('/api/v1/auth/*', toNodeHandler(auth));

app.use('/api/v1/acervo', acervoRouter);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger Docs available at http://localhost:${PORT}/api/v1/docs`);
    console.log(`OpenAPI JSON available at http://localhost:${PORT}/api/v1/openapi.json`);
  });
}

export default app;
