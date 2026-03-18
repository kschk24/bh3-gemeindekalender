import { PrismaClient, Prisma, Role } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { CreateEventInput, UpdateEventInput, EventFiltersInput, RegistrationInput } from '../validators/events.validators';

const prisma = new PrismaClient();

export class EventsService {
  async getAll(filters: EventFiltersInput) {
    const { search, categoryId, startDate, endDate, page, limit, ...accessibilityFilters } = filters;

    const where: Prisma.EventWhereInput = {};

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Date filters
    if (startDate) {
      where.startDate = { gte: new Date(startDate) };
    }

    if (endDate) {
      where.endDate = { lte: new Date(endDate) };
    }

    // Accessibility filters
    const accessibilityWhere: Prisma.AccessibilityInfoWhereInput = {};
    let hasAccessibilityFilter = false;

    if (accessibilityFilters.wheelchairAccessible) {
      accessibilityWhere.wheelchairAccessible = true;
      hasAccessibilityFilter = true;
    }
    if (accessibilityFilters.hearingLoop) {
      accessibilityWhere.hearingLoop = true;
      hasAccessibilityFilter = true;
    }
    if (accessibilityFilters.signLanguage) {
      accessibilityWhere.signLanguage = true;
      hasAccessibilityFilter = true;
    }
    if (accessibilityFilters.easyLanguage) {
      accessibilityWhere.easyLanguage = true;
      hasAccessibilityFilter = true;
    }

    if (hasAccessibilityFilter) {
      where.accessibility = accessibilityWhere;
    }

    // Pagination
    const skip = (page - 1) * limit;
    const take = limit;

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take,
        orderBy: { startDate: 'asc' },
        include: {
          category: true,
          accessibility: true,
          _count: {
            select: { registrations: true, comments: true },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);

    return {
      data: events,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        category: true,
        accessibility: true,
        _count: {
          select: { registrations: true, comments: true },
        },
      },
    });

    if (!event) {
      throw new AppError('Veranstaltung nicht gefunden', 404);
    }

    return event;
  }

  async create(data: CreateEventInput, userId: string) {
    const { accessibility, ...eventData } = data;

    const event = await prisma.event.create({
      data: {
        ...eventData,
        startDate: new Date(eventData.startDate),
        endDate: new Date(eventData.endDate),
        createdBy: userId,
        accessibility: accessibility
          ? { create: accessibility }
          : undefined,
      },
      include: {
        category: true,
        accessibility: true,
      },
    });

    return event;
  }

  async update(id: string, data: UpdateEventInput, requester?: { id: string; role: Role }) {
    const existing = await prisma.event.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError('Veranstaltung nicht gefunden', 404);
    }

    if (requester?.role === Role.EVENT_MANAGER && existing.createdBy !== requester.id) {
      throw new AppError('Keine Berechtigung', 403);
    }

    const { accessibility, ...eventData } = data;

    const updateData: Prisma.EventUpdateInput = {
      ...eventData,
      startDate: eventData.startDate ? new Date(eventData.startDate) : undefined,
      endDate: eventData.endDate ? new Date(eventData.endDate) : undefined,
    };

    if (accessibility) {
      updateData.accessibility = {
        upsert: {
          create: accessibility,
          update: accessibility,
        },
      };
    }

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        accessibility: true,
      },
    });

    return event;
  }

  async delete(id: string, requester?: { id: string; role: Role }) {
    const existing = await prisma.event.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError('Veranstaltung nicht gefunden', 404);
    }

    if (requester?.role === Role.EVENT_MANAGER && existing.createdBy !== requester.id) {
      throw new AppError('Keine Berechtigung', 403);
    }

    await prisma.event.delete({ where: { id } });
  }

  async registerForEvent(eventId: string, userId: string | undefined, data: RegistrationInput) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: { select: { registrations: true } },
      },
    });

    if (!event) {
      throw new AppError('Veranstaltung nicht gefunden', 404);
    }

    // Check if account is required
    if (event.requiresAccount && !userId) {
      throw new AppError('Anmeldung nur mit Benutzerkonto möglich', 401);
    }

    // Check guest data if no user
    if (!userId && (!data.guestName || !data.guestEmail)) {
      throw new AppError('Name und E-Mail erforderlich für Gastanmeldung', 400);
    }

    // Check max participants
    if (event.maxParticipants && event._count.registrations >= event.maxParticipants) {
      throw new AppError('Veranstaltung ist ausgebucht', 400);
    }

    // Check for duplicate registration
    if (userId) {
      const existingReg = await prisma.registration.findFirst({
        where: { eventId, userId },
      });
      if (existingReg) {
        throw new AppError('Sie sind bereits angemeldet', 409);
      }
    }

    const registration = await prisma.registration.create({
      data: {
        eventId,
        userId,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
      },
    });

    return registration;
  }

  async getRegistrations(eventId: string) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    
    if (!event) {
      throw new AppError('Veranstaltung nicht gefunden', 404);
    }

    const registrations = await prisma.registration.findMany({
      where: { eventId },
      include: {
        user: {
          select: { id: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return registrations;
  }
}
