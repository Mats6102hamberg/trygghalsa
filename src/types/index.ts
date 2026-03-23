export type EventType = 'visit' | 'diagnosis' | 'medication' | 'test' | 'vaccine';

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
