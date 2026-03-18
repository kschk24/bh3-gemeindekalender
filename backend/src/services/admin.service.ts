import { PrismaClient, Role } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class AdminService {
  async listUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          _count: { select: { comments: true, favorites: true } },
        },
      }),
      prisma.user.count(),
    ]);
    return {
      data: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async changeUserRole(userId: string, role: Role, requesterId: string) {
    if (userId === requesterId) {
      throw new AppError('Eigene Rolle kann nicht geändert werden', 400);
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('Benutzer nicht gefunden', 404);
    return prisma.user.update({ where: { id: userId }, data: { role }, select: { id: true, email: true, role: true } });
  }

  async deleteUser(userId: string, requesterId: string) {
    if (userId === requesterId) {
      throw new AppError('Eigenes Konto kann nicht gelöscht werden', 400);
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('Benutzer nicht gefunden', 404);
    await prisma.user.delete({ where: { id: userId } });
  }

  async listEvents(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          _count: { select: { registrations: true } },
        },
      }),
      prisma.event.count(),
    ]);
    return {
      data: events,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async deleteEvent(eventId: string) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError('Veranstaltung nicht gefunden', 404);
    await prisma.event.delete({ where: { id: eventId } });
  }
}
