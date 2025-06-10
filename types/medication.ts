export type MedicationItem = {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  prescriber?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  reminder_times?: string[]; // Array of time strings
  created_at: string;
  updated_at: string;
};

export type MedicationLog = {
  id: string;
  user_id: string;
  medication_id: string;
  scheduled_time: string;
  taken_time?: string;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  notes?: string;
  created_at: string;
};

export type ReminderItem = {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  time: string;
  instructions?: string;
  color?: string;
  status?: 'pending' | 'taken' | 'missed' | 'skipped';
  logId?: string;
};

export type NotificationItem = {
  id: string;
  user_id: string;
  title: string;
  message?: string;
  type: 'medication_reminder' | 'appointment_reminder' | 'health_tip' | 'system' | 'emergency';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read: boolean;
  action_url?: string;
  metadata?: any;
  scheduled_for?: string;
  created_at: string;
  read_at?: string;
};