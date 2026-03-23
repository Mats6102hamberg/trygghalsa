import { z } from 'zod';

export const appointmentSchema = z.object({
  title: z.string().min(1).max(200),
  dateTime: z.string().datetime(),
  providerName: z.string().max(200).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;
