import { Request, Response, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth';
import { db } from '../db';
import { session, user } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface AuthenticatedRequest extends Request {
  user?: any;
  session?: any;
}

async function getSessionFromBearer(token: string): Promise<{ user: any; session: any } | null> {
  try {
    const [foundSession] = await db
      .select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (!foundSession) return null;

    if (new Date(foundSession.expiresAt) < new Date()) return null;

    const [foundUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, foundSession.userId))
      .limit(1);

    if (!foundUser) return null;

    return { user: foundUser, session: foundSession };
  } catch {
    return null;
  }
}

export async function verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const result = await getSessionFromBearer(token);
      if (result) {
        req.user = result.user;
        req.session = result.session;
        return next();
      }
    }

    const sessionResult = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!sessionResult) {
      return res.status(401).json({ message: 'Não autorizado. Faça login para continuar.' });
    }

    req.user = sessionResult.user;
    req.session = sessionResult.session;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Sessão inválida ou expirada.' });
  }
}

export default verifyToken;
