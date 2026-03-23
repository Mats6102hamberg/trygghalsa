interface EventForFormat {
  date: string;
  type: string;
  title: string;
  description?: string | null;
}

export function formatEventsTimeline(events: EventForFormat[]): string {
  return events
    .map(
      (e) =>
        `${e.date} | ${e.type}: ${e.title}${e.description ? ` – ${e.description}` : ''}`
    )
    .join('\n');
}
