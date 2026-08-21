import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import * as schema from './db/schema';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 8080;

const trustedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://localhost:8080',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'https://www.mermasdigitais.com.br',
  'https://mermasdigitais.com.br',
  'https://mdapi.fabitz.com.br',
];

if (process.env.CLIENT_URL) {
  const extraOrigins = process.env.CLIENT_URL.split(',').map((url) => url.trim());
  trustedOrigins.push(...extraOrigins);
}

export const auth = betterAuth({
  basePath: '/api/v1/auth',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || `http://localhost:${port}`,
  trustedOrigins,
});
