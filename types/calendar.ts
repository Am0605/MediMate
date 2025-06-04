export type Appointment = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  location?: string;
  doctorName?: string;
  doctorSpecialty?: string;
  notes?: string;
};