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

app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /api/v1/health:
 *   get:
 *     summary: Healthcheck da API
 *     tags: [Geral]
 *     security: []
 *     responses:
 *       200:
 *         description: API online e operacional
 *
 * /api/v1/auth/sign-up/email:
 *   post:
 *     summary: Cadastrar novo usuário
 *     tags: [Autenticação]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Maria Silva
 *               email:
 *                 type: string
 *                 example: maria@mermas.com
 *               password:
 *                 type: string
 *                 example: senhaSegura123
 *     responses:
 *       200:
 *         description: Usuário cadastrado com sucesso
 *
 * /api/v1/auth/sign-in/email:
 *   post:
 *     summary: Autenticar usuário com e-mail e senha
 *     tags: [Autenticação]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: maria@mermas.com
 *               password:
 *                 type: string
 *                 example: senhaSegura123
 *     responses:
 *       200:
 *         description: Login bem-sucedido e sessão criada
 *
 * /api/v1/auth/get-session:
 *   get:
 *     summary: Obter dados da sessão do usuário autenticado
 *     tags: [Autenticação]
 *     responses:
 *       200:
 *         description: Dados do usuário e da sessão
 *
 * /api/v1/auth/sign-out:
 *   post:
 *     summary: Encerrar sessão do usuário (Logout)
 *     tags: [Autenticação]
 *     responses:
 *       200:
 *         description: Sessão encerrada com sucesso
 */

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
