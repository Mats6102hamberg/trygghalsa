import type { NormalizedHealthMetric } from '@/types';

export function normalizeAppleData(raw: Record<string, unknown[]>): NormalizedHealthMetric[] {
  const normalized: NormalizedHealthMetric[] = [];

  for (const step of (raw.steps ?? []) as Record<string, unknown>[]) {
    normalized.push({
      source: 'apple_health',
      metricType: 'steps',
      occurredAt: step.startDate as string,
      value: Number(step.value ?? 0),
      unit: 'count',
      metadata: { endDate: step.endDate },
    });
  }

  for (const hr of (raw.heartRate ?? []) as Record<string, unknown>[]) {
    normalized.push({
      source: 'apple_health',
      metricType: 'heart_rate',
      occurredAt: hr.startDate as string,
      value: Number(hr.value ?? 0),
      unit: (hr.unit as string) ?? 'bpm',
      metadata: { endDate: hr.endDate },
    });
  }

  for (const bp of (raw.bloodPressure ?? []) as Record<string, unknown>[]) {
    normalized.push({
      source: 'apple_health',
      metricType: 'blood_pressure',
      occurredAt: bp.startDate as string,
      value: `${bp.systolic}/${bp.diastolic}`,
      unit: 'mmHg',
      metadata: {
        systolic: Number(bp.systolic ?? 0),
        diastolic: Number(bp.diastolic ?? 0),
        endDate: bp.endDate,
      },
    });
  }

  for (const sleep of (raw.sleep ?? []) as Record<string, unknown>[]) {
    normalized.push({
      source: 'apple_health',
      metricType: 'sleep',
      occurredAt: sleep.startDate as string,
      value: Number(sleep.minutes ?? 0),
      unit: 'minutes',
      metadata: { endDate: sleep.endDate, category: sleep.value },
    });
  }

  for (const w of (raw.weight ?? []) as Record<string, unknown>[]) {
    normalized.push({
      source: 'apple_health',
      metricType: 'weight',
      occurredAt: w.startDate as string,
      value: Number(w.value ?? 0),
      unit: (w.unit as string) ?? 'kg',
    });
  }

  for (const h of (raw.height ?? []) as Record<string, unknown>[]) {
    normalized.push({
      source: 'apple_health',
      metricType: 'height',
      occurredAt: h.startDate as string,
      value: Number(h.value ?? 0),
      unit: (h.unit as string) ?? 'cm',
    });
  }

  return normalized;
}

export function normalizeHealthConnectData(raw: { entries?: Record<string, unknown>[] }): NormalizedHealthMetric[] {
  return (raw.entries ?? []).map((item) => ({
    source: 'health_connect' as const,
    metricType: item.metricType as NormalizedHealthMetric['metricType'],
    occurredAt: item.occurredAt as string,
    value: item.value as number | string,
    unit: item.unit as string | undefined,
    metadata: (item.metadata as Record<string, unknown>) ?? {},
  }));
}
