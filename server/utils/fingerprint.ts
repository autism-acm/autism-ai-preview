import crypto from "crypto";
import type { Request } from "express";

export function generateFingerprint(req: Request): string {
  const ip = req.ip || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';
  const acceptLanguage = req.headers['accept-language'] || '';
  
  const fingerprintData = `${ip}|${userAgent}|${acceptLanguage}`;
  return crypto.createHash('sha256').update(fingerprintData).digest('hex');
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateCookieToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  return passwordHash === hash;
}
