import { EventForm } from '@/components/EventForm';

export default function NewEventPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ny händelse</h1>
      <EventForm />
    </div>
  );
}
