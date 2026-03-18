import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class GdprService {
  async exportUserData(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        registrations: {
          select: {
            id: true,
            eventId: true,
            guestName: true,
            guestEmail: true,
            createdAt: true,
          },
        },
        favorites: {
          select: {
            id: true,
            eventId: true,
            createdAt: true,
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
            eventId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Benutzer nicht gefunden', 404);
    }

    return {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      registrations: user.registrations,
      favorites: user.favorites,
      comments: user.comments,
    };
  }

  async deleteAccount(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('Benutzer nicht gefunden', 404);
    }
    // Cascade deletes handle related data (favorites, refreshTokens)
    await prisma.user.delete({ where: { id: userId } });
  }
}
