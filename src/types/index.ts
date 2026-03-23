export type EventType = 'visit' | 'diagnosis' | 'medication' | 'test' | 'vaccine' | 'note';

export type Attachment = {
  url: string;
  name: string;
  type: string;
};

export type Event = {
  id: string;
  user_id: string;
  date: string;
  type: EventType;
  title: string;
  description: string | null;
  provider_name: string | null;
  location: string | null;
  tags: string[];
  is_private: boolean;
  attachments: Attachment[];
  created_at: string;
  updated_at: string;
};

export type AISummary = {
  summary: string;
  questions: string[];
};

export type HealthSource = 'apple_health' | 'health_connect';

export type HealthMetricType = 'steps' | 'heart_rate' | 'blood_pressure' | 'sleep';

export type ImportedHealthMetric = {
  source: HealthSource;
  metricType: HealthMetricType;
  occurredAt: string;
  value: number | string;
  unit?: string;
  metadata?: Record<string, unknown>;
};

export type Medication = {
  id: string;
  user_id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  reminder_time: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AppointmentStatus = 'scheduled' | 'cancelled' | 'completed';

export type Appointment = {
  id: string;
  user_id: string;
  title: string;
  date_time: string;
  provider_name: string | null;
  location: string | null;
  notes: string | null;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
};

export type QuestionSource = 'manual' | 'ai';

export type Question = {
  id: string;
  user_id: string;
  text: string;
  source: QuestionSource;
  appointment_id: string | null;
  is_answered: boolean;
  answer: string | null;
  created_at: string;
  updated_at: string;
};
