import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.MESSAGE_ENCRYPTION_KEY;

if (!SECRET_KEY || SECRET_KEY.length !== 64) {
  throw new Error('MESSAGE_ENCRYPTION_KEY must be a 32-byte (64 hex chars) secret');
}
const KEY = Buffer.from(SECRET_KEY, 'hex');

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12); // GCM recommended 12 bytes
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(payload: string): string {
  const [ivHex, authTagHex, encrypted] = payload.split(':');
  if (!ivHex || !authTagHex || !encrypted) throw new Error('Invalid encrypted payload');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}