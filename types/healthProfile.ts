export type HealthProfileData = {
  id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  email?: string;
  date_of_birth: string;
  gender: string;
  height: string;
  weight: string;
  blood_type: string;
  phone?: string;
  avatar_url?: string;
  conditions?: string[];
  allergies?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  created_at?: string;
  updated_at?: string;
};

export type HealthStats = {
  totalMedications: number;
  adherenceRate: number;
  nextAppointment?: string;
  healthScore: number;
  lastCheckup: string;
  missedDoses?: number;
  upcomingRefills?: number;
};

export type HealthEntry = {
  id: string;
  user_id: string;
  type: 'voice' | 'document' | 'symptom_checker' | 'med_simplify';
  title: string;
  description: string;
  content?: any;
  metadata?: any;
  created_at: string;
  updated_at?: string;
};

export type Medication = {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
};