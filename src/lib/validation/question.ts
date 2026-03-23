import { z } from 'zod';

export const questionSchema = z.object({
  text: z.string().min(1).max(1000),
  appointmentId: z.string().optional().nullable(),
  source: z.enum(['manual', 'ai']).optional().default('manual'),
});

export type QuestionInput = z.infer<typeof questionSchema>;
