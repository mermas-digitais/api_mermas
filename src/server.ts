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

app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  const host = req.get('host');
  const protocol = req.protocol;
  const baseUrl = `${protocol}://${host}`;

  res.json({
    name: 'API Mermas - Acervo Digital',
    version: '1.0.0',
    status: 'online',
    docs: `${baseUrl}/api/v1/docs`,
    endpoints: {
      health: `${baseUrl}/api/v1/health`,
      docs: `${baseUrl}/api/v1/docs`,
      auth: `${baseUrl}/api/v1/auth`,
      acervo: `${baseUrl}/api/v1/acervo`,
    },
  });
});

app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', message: 'API Mermas Acervo v1 online' });
});

app.all('/api/v1/auth/*', toNodeHandler(auth));

app.use('/api/v1/acervo', acervoRouter);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger Docs available at http://localhost:${PORT}/api/v1/docs`);
  });
}

export default app;
