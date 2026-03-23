import { z } from 'zod';

const attachmentSchema = z.object({
  url: z.string().url(),
  name: z.string().min(1),
  type: z.string().min(1),
});

export const eventSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(['visit', 'diagnosis', 'medication', 'test', 'vaccine']),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional().nullable(),
  providerName: z.string().max(200).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  isPrivate: z.boolean().optional().default(true),
  attachments: z.array(attachmentSchema).optional(),
});

export type EventInput = z.infer<typeof eventSchema>;
