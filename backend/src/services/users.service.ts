import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class UsersService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            favorites: true,
            registrations: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Benutzer nicht gefunden', 404);
    }

    return user;
  }

  async getFavorites(userId: string) {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            category: true,
            accessibility: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((f) => f.event);
  }

  async addFavorite(userId: string, eventId: string) {
    // Check if event exists
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new AppError('Veranstaltung nicht gefunden', 404);
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_eventId: { userId, eventId },
      },
    });

    if (existing) {
      throw new AppError('Bereits als Favorit gespeichert', 409);
    }

    const favorite = await prisma.favorite.create({
      data: { userId, eventId },
      include: {
        event: {
          include: {
            category: true,
            accessibility: true,
          },
        },
      },
    });

    return favorite;
  }

  async removeFavorite(userId: string, eventId: string) {
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_eventId: { userId, eventId },
      },
    });

    if (!existing) {
      throw new AppError('Favorit nicht gefunden', 404);
    }

    await prisma.favorite.delete({
      where: { id: existing.id },
    });
  }
}
