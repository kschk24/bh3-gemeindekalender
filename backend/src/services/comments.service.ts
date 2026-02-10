import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { CreateCommentInput } from '../validators/comments.validators';

const prisma = new PrismaClient();

export class CommentsService {
  async getByEventId(eventId: string) {
    // Check if event exists
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new AppError('Veranstaltung nicht gefunden', 404);
    }

    const comments = await prisma.comment.findMany({
      where: { eventId },
      include: {
        user: {
          select: { id: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return comments;
  }

  async create(eventId: string, userId: string | undefined, data: CreateCommentInput) {
    // Check if event exists
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new AppError('Veranstaltung nicht gefunden', 404);
    }

    // Require guest name if not authenticated
    if (!userId && !data.guestName) {
      throw new AppError('Name erforderlich für Gastkommentare', 400);
    }

    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        eventId,
        userId,
        guestName: userId ? undefined : data.guestName,
      },
      include: {
        user: {
          select: { id: true, email: true },
        },
      },
    });

    return comment;
  }

  async delete(commentId: string, userId: string, isAdmin: boolean) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new AppError('Kommentar nicht gefunden', 404);
    }

    // Only allow deletion if user is admin or comment owner
    if (!isAdmin && comment.userId !== userId) {
      throw new AppError('Keine Berechtigung zum Löschen dieses Kommentars', 403);
    }

    await prisma.comment.delete({ where: { id: commentId } });
  }

  async getById(commentId: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: { id: true, email: true },
        },
      },
    });

    if (!comment) {
      throw new AppError('Kommentar nicht gefunden', 404);
    }

    return comment;
  }
}
