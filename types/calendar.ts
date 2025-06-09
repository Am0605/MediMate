export type Appointment = {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  appointment_type: 'doctor_visit' | 'lab_test' | 'procedure' | 'follow_up' | 'vaccination' | 'other';
  doctor_name?: string;
  location?: string;
  start_time: string; // timestamp with time zone
  end_time?: string; // timestamp with time zone
  status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  reminder_minutes?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
};

export type AppointmentFormData = Omit<Appointment, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

// Helper type for display purposes (to convert timestamps to date/time)
export type AppointmentDisplay = Appointment & {
  date: string; // YYYY-MM-DD extracted from start_time
  time: string; // HH:MM extracted from start_time
  doctorName?: string; // Mapped from doctor_name for UI compatibility
  doctorSpecialty?: string; // For UI compatibility
};