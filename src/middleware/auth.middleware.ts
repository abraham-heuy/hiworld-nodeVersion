import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppDataSource } from '../database/data-source'; 
import { Session } from '../entities/session.entity';
import { User } from '../entities/user.entity';
import { UnauthorizedException } from '../exceptions/HttpExceptions';

declare global {
  namespace Express {
    interface Request {
      authenticatedUser?: User;
      sessionId?: string;
    }
  }
}

export async function protect(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.accessToken;
    if (!token) throw new UnauthorizedException('No token provided');

    const payload = verifyAccessToken(token);
    if (!payload) throw new UnauthorizedException('Invalid or expired token');

    // Use AppDataSource instead of global getRepository
    const sessionRepo = AppDataSource.getRepository(Session);
    const session = await sessionRepo.findOne({
      where: { sessionId: payload.sessionId, active: true }
    });
    if (!session) throw new UnauthorizedException('Session invalid or expired');

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: payload.userId, is_active: true } });
    if (!user) throw new UnauthorizedException('User not found or inactive');

    req.authenticatedUser = user;
    req.sessionId = payload.sessionId;

    session.lastActivity = new Date();
    await sessionRepo.save(session);

    next();
  } catch (error) {
    next(error);
  }
}

export function requireRank(minRank: number) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.authenticatedUser) throw new UnauthorizedException('Not authenticated');
    if (req.authenticatedUser.rank < minRank) {
      throw new UnauthorizedException('Insufficient permissions');
    }
    next();
  };
}