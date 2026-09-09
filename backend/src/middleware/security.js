import rateLimit from 'express-rate-limit';
import db from '../db/index.js';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: 'Too many login attempts, please try again in 15 minutes.' }
});

export async function logAudit(userId, action, ipAddress, details = '') {
  try {
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : details;
    await db.run(
      'INSERT INTO audit_logs (user_id, action, ip_address, details) VALUES (?, ?, ?, ?)',
      [userId || null, action, ipAddress || 'unknown', detailsStr]
    );
  } catch (err) {
    console.error('Failed to record audit log:', err);
  }
}

export function auditMiddleware(actionName) {
  return (req, res, next) => {
    const userId = req.user ? req.user.id : null;
    const ip = req.ip || req.connection.remoteAddress;
    logAudit(userId, actionName, ip, { method: req.method, url: req.originalUrl });
    next();
  };
}
