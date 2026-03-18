import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
};

export interface AuthRequest extends Request {
  user?: AuthUser;
}

function extractToken(req: Request): string | null {
  // Prefer HttpOnly cookie; fall back to Authorization header (for tests/tools)
  if (req.cookies?.access_token) {
    return req.cookies.access_token as string;
  }
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({ message: 'Authentifizierung erforderlich' });
    }

    const secret = process.env.JWT_SECRET || 'default-secret';
    const decoded = jwt.verify(token, secret) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Benutzer nicht gefunden' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Ungültiger Token' });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = extractToken(req);

    if (token) {
      const secret = process.env.JWT_SECRET || 'default-secret';
      const decoded = jwt.verify(token, secret) as { userId: string };

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true },
      });

      if (user) {
        req.user = user;
      }
    }
    next();
  } catch {
    // Token invalid, but that's okay for optional auth
    next();
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== Role.ADMIN) {
    return res.status(403).json({ message: 'Admin-Berechtigung erforderlich' });
  }
  next();
};
