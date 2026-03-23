import { z } from 'zod';

export const medicationSchema = z.object({
  name: z.string().min(1).max(200),
  dosage: z.string().max(200).optional().nullable(),
  frequency: z.string().max(200).optional().nullable(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  reminderTime: z.string().max(100).optional().nullable(),
});

export type MedicationInput = z.infer<typeof medicationSchema>;
