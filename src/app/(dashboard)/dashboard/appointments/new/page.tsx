import { AppointmentForm } from '@/components/AppointmentForm';

export default function NewAppointmentPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Boka ny tid</h1>
      <AppointmentForm />
    </div>
  );
}
