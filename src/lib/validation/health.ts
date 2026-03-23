import { z } from 'zod';

export const healthSources = ['apple_health', 'health_connect'] as const;
export const healthMetricTypes = ['steps', 'heart_rate', 'blood_pressure', 'weight', 'sleep', 'height', 'bmi'] as const;

export const healthEntrySchema = z.object({
  metricType: z.enum(healthMetricTypes),
  occurredAt: z.string().datetime(),
  value: z.union([z.string(), z.number()]),
  unit: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const healthImportSchema = z.object({
  source: z.enum(healthSources),
  entries: z.array(healthEntrySchema).min(1),
});

export type HealthEntry = z.infer<typeof healthEntrySchema>;
export type HealthImportInput = z.infer<typeof healthImportSchema>;
