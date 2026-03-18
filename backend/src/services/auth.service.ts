import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AppError } from '../middleware/errorHandler';
import { RegisterInput, LoginInput } from '../validators/auth.validators';

const prisma = new PrismaClient();

const JWT_SECRET = () => process.env.JWT_SECRET || 'default-secret';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export class AuthService {
  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('E-Mail-Adresse bereits registriert', 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id);

    return { user, accessToken, refreshToken };
  }

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError('Ungültige Anmeldedaten', 401);
    }

    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError('Ungültige Anmeldedaten', 401);
    }

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(token: string) {
    const existing = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: { select: { id: true, email: true, role: true, createdAt: true } } },
    });

    if (!existing || existing.expiresAt < new Date()) {
      if (existing) {
        await prisma.refreshToken.delete({ where: { id: existing.id } });
      }
      throw new AppError('Ungültiger oder abgelaufener Refresh-Token', 401);
    }

    // Rotate: delete old, create new
    await prisma.refreshToken.delete({ where: { id: existing.id } });

    const accessToken = this.generateAccessToken(existing.userId);
    const refreshToken = await this.generateRefreshToken(existing.userId);

    return { user: existing.user, accessToken, refreshToken };
  }

  async logout(token: string) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }

  generateAccessToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET(), { expiresIn: ACCESS_TOKEN_EXPIRY } as jwt.SignOptions);
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await prisma.refreshToken.create({
      data: { token, userId, expiresAt },
    });

    return token;
  }
}
