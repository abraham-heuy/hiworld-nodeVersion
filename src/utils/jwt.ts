import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret-change-me';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-me';

export interface TokenPayload {
  userId: string;
  username: string;
  sessionId: string; // from sessions table
}

export function generateAccessToken(payload: Omit<TokenPayload, 'sessionId'> & { sessionId?: string }): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(payload: Omit<TokenPayload, 'sessionId'>): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): Omit<TokenPayload, 'sessionId'> | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as Omit<TokenPayload, 'sessionId'>;
  } catch {
    return null;
  }
}

export function generateSessionId(): string {
  return crypto.randomBytes(16).toString('hex');
}