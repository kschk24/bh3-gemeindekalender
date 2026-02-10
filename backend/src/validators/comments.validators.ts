import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Kommentar darf nicht leer sein').max(2000, 'Kommentar darf maximal 2000 Zeichen haben'),
  guestName: z.string().min(1, 'Name erforderlich').max(100).optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
