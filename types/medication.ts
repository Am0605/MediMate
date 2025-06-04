export type MedicationItem = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  color?: string;
  image?: string;
  instructions?: string;
  notes?: string;
  tags?: string[];
};

export type ReminderItem = {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  time: string;
  instructions: string;
  color?: string;
  taken?: boolean;
  takenAt?: string;
};