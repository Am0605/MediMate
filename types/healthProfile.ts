export type HealthProfileData = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  height: string;
  weight: string;
  bloodType: string;
  conditions?: string[];
  allergies?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
};

export type HealthStats = {
  totalMedications: number;
  adherenceRate: number;
  nextAppointment?: string;
  healthScore: number;
  lastCheckup: string;
};

export type HealthEntry = {
  id: string;
  type: 'voice' | 'document' | 'symptom_checker' | 'med_simplify';
  title: string;
  description: string;
  createdAt: string;
  content?: any; // Store the actual content/response
};