import { z } from 'zod';

export const medicationSchema = z.object({
  name: z.string().min(1).max(200),
  dosage: z.string().max(100).nullable().optional(),
  instructions: z.string().max(500).nullable().optional(),
  times: z.array(z.string().regex(/^\d{2}:\d{2}$/)).max(10).optional(),
  is_active: z.boolean().optional(),
});

export const medicationLogSchema = z.object({
  medication_id: z.string(),
  scheduled_time: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
});

export type MedicationInput = z.infer<typeof medicationSchema>;
export type MedicationLogInput = z.infer<typeof medicationLogSchema>;
