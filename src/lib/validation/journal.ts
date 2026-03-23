import { z } from 'zod';

export const journalDraftEventSchema = z.object({
  date: z.string().nullable(),
  type: z.enum(['visit', 'diagnosis', 'medication', 'test', 'vaccine', 'note']),
  title: z.string(),
  description: z.string().nullable().optional(),
  confidence: z.enum(['high', 'medium', 'low']),
  source_excerpt: z.string(),
});

export const approvedJournalImportSchema = z.object({
  approvedEvents: z.array(
    z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      type: z.enum(['visit', 'diagnosis', 'medication', 'test', 'vaccine', 'note']),
      title: z.string().min(1).max(200),
      description: z.string().nullable().optional(),
    })
  ),
});

export type JournalDraftEvent = z.infer<typeof journalDraftEventSchema>;
export type ApprovedJournalImport = z.infer<typeof approvedJournalImportSchema>;
