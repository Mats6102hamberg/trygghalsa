export interface TimelineEvent {
  id: string;
  date: string;
  type: 'visit' | 'diagnosis' | 'medication' | 'test' | 'vaccine';
  title: string;
  description?: string | null;
  providerName?: string | null;
  location?: string | null;
  tags: string[];
  isPrivate: boolean;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  url: string;
  name: string;
  type: string;
}

export interface AISummary {
  summary: string;
  questions: string[];
}
