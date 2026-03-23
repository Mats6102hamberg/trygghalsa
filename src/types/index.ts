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

export type AISummaryResponse = {
  summary: string;
  questions: string[];
};

export type HealthSource = 'apple_health' | 'health_connect';

export type HealthMetricType =
  | 'steps'
  | 'heart_rate'
  | 'blood_pressure'
  | 'weight'
  | 'sleep'
  | 'height'
  | 'bmi';

export type NormalizedHealthMetric = {
  source: HealthSource;
  metricType: HealthMetricType;
  occurredAt: string;
  value: number | string;
  unit?: string;
  metadata?: Record<string, unknown>;
};

export type HealthMetric = {
  id: string;
  user_id: string;
  source: HealthSource;
  metric_type: string;
  occurred_at: string;
  value_numeric: number | null;
  value_text: string | null;
  unit: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type JournalDraftEvent = {
  date: string | null;
  type: EventType;
  title: string;
  description: string | null;
  confidence: 'high' | 'medium' | 'low';
  source_excerpt: string;
};

export type Medication = {
  id: string;
  user_id: string;
  name: string;
  dosage: string | null;
  instructions: string | null;
  times: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type MedicationLog = {
  id: string;
  medication_id: string;
  user_id: string;
  taken_at: string;
  scheduled_time: string | null;
  created_at: string;
};

export type MedicationWithStatus = Medication & {
  takenTodayTimes: string[];
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

export type CareRelationshipStatus = 'pending' | 'active' | 'revoked';

export type CareRelationship = {
  id: string;
  user_id: string;
  caregiver_user_id: string;
  relationship_type: string;
  status: CareRelationshipStatus;
  can_customize_home: boolean;
  can_view_timeline: boolean;
  can_view_medications: boolean;
  can_view_appointments: boolean;
  created_at: string;
  updated_at: string;
};

export type HomeButtonKey =
  | 'medications'
  | 'health'
  | 'appointments'
  | 'help'
  | 'questions'
  | 'timeline'
  | 'contact_family';

export type SimplicityLevel = 'very_simple' | 'simple' | 'expanded';

export type HomeScreenButton = {
  id: string;
  user_id: string;
  button_key: HomeButtonKey;
  label: string;
  is_visible: boolean;
  sort_order: number;
  is_primary: boolean;
};

export type HomeScreenSettings = {
  id: string;
  user_id: string;
  simplicity_level: SimplicityLevel;
  today_message: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  buttons: HomeScreenButton[];
};
