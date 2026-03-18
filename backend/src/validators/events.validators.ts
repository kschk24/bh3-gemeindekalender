import { z } from 'zod';

export const accessibilitySchema = z.object({
  wheelchairAccessible: z.boolean().optional(),
  hearingLoop: z.boolean().optional(),
  signLanguage: z.boolean().optional(),
  easyLanguage: z.boolean().optional(),
});

export const createEventSchema = z.object({
  title: z.string().min(1, 'Titel erforderlich').max(200),
  description: z.string().min(1, 'Beschreibung erforderlich'),
  location: z.string().min(1, 'Ort erforderlich'),
  address: z.string().min(1, 'Adresse erforderlich'),
  startDate: z.string().datetime('Ungültiges Startdatum'),
  endDate: z.string().datetime('Ungültiges Enddatum'),
  categoryId: z.string().uuid('Ungültige Kategorie-ID'),
  imageUrl: z.string().url('Ungültige Bild-URL').optional(),
  requiresAccount: z.boolean().optional(),
  maxParticipants: z.number().int().positive().optional(),
  accessibility: accessibilitySchema.optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const eventFiltersSchema = z.object({
  search: z.string().optional(),
  categoryId: z.preprocess(
    (v) => (Array.isArray(v) ? v : v ? [v] : undefined),
    z.array(z.string().uuid()).optional(),
  ),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  wheelchairAccessible: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  hearingLoop: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  signLanguage: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  easyLanguage: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
});

export const registrationSchema = z.object({
  guestName: z.string().min(1, 'Name erforderlich').optional(),
  guestEmail: z.string().email('Ungültige E-Mail-Adresse').optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventFiltersInput = z.infer<typeof eventFiltersSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
