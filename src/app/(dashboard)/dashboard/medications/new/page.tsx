import { MedicationForm } from '@/components/MedicationForm';

export default function NewMedicationPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Lägg till medicin</h1>
      <MedicationForm />
    </div>
  );
}
