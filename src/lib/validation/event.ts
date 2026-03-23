import { z } from 'zod';

export const attachmentSchema = z.object({
  url: z.string().url(),
  name: z.string().min(1),
  type: z.string().min(1),
});

export const eventTypeSchema = z.enum([
  'visit',
  'diagnosis',
  'medication',
  'test',
  'vaccine',
  'note',
]);

export const eventSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: eventTypeSchema,
  title: z.string().min(1).max(200),
  description: z.string().max(5000).nullable().optional(),
  providerName: z.string().max(200).nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  tags: z.array(z.string().min(1).max(50)).optional().default([]),
  isPrivate: z.boolean().optional().default(true),
  attachments: z.array(attachmentSchema).optional(),
});

export const updateEventSchema = eventSchema.partial();

export type EventInput = z.infer<typeof eventSchema>;
