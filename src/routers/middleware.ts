import { Request, Response, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth';

export interface AuthenticatedRequest extends Request {
  user?: any;
  session?: any;
}

export async function verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ message: 'Não autorizado. Faça login para continuar.' });
    }

    req.user = session.user;
    req.session = session.session;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Sessão inválida ou expirada.' });
  }
}

export default verifyToken;
