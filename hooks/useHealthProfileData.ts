import { useState, useEffect, useCallback } from 'react';
import { HealthProfileData, HealthStats, HealthEntry } from '@/types/healthProfile';

// Mock data
const mockHealthProfile: HealthProfileData = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1985-06-15',
  gender: 'Male',
  height: '5\'10"',
  weight: '175 lbs',
  bloodType: 'O+',
  conditions: ['Hypertension', 'Type 2 Diabetes'],
  allergies: ['Penicillin', 'Shellfish'],
  emergencyContact: {
    name: 'Jane Doe',
    phone: '+1 (555) 987-6543',
    relationship: 'Spouse'
  }
};

const mockHealthStats: HealthStats = {
  totalMedications: 5,
  adherenceRate: 85,
  nextAppointment: 'June 15, 2025',
  healthScore: 78,
  lastCheckup: '2025-05-15',
};

const mockHealthEntries: HealthEntry[] = [
  {
    id: '1',
    type: 'voice',
    title: 'Daily Wellness Check',
    description: 'Feeling good today, energy levels are high. Took morning medications on time.',
    createdAt: '2025-06-04T08:30:00Z',
  },
  {
    id: '2',
    type: 'document',
    title: 'Lab Results - Blood Work',
    description: 'Complete blood count and lipid panel results from Dr. Smith\'s office.',
    createdAt: '2025-06-03T14:20:00Z',
  },
  {
    id: '3',
    type: 'symptom_checker',
    title: 'Headache Assessment',
    description: 'AI analyzed symptoms: likely tension headache. Recommended rest and hydration.',
    createdAt: '2025-06-02T16:45:00Z',
  },
  {
    id: '4',
    type: 'med_simplify',
    title: 'Metformin Explanation',
    description: 'AI simplified: "This medication helps control blood sugar levels by improving how your body uses insulin."',
    createdAt: '2025-06-01T10:15:00Z',
  },
];

export function useHealthProfileData() {
  const [healthProfile, setHealthProfile] = useState<HealthProfileData>(mockHealthProfile);
  const [healthStats, setHealthStats] = useState<HealthStats>(mockHealthStats);
  const [healthEntries, setHealthEntries] = useState<HealthEntry[]>(mockHealthEntries);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchHealthProfile = useCallback(async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHealthProfile(mockHealthProfile);
      setHealthStats(mockHealthStats);
      setHealthEntries(mockHealthEntries);
      setError(null);
    } catch (err) {
      setError('Failed to fetch health profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchHealthProfile();
  }, [fetchHealthProfile]);
  
  return {
    healthProfile,
    healthStats,
    healthEntries,
    loading,
    error,
    fetchHealthProfile,
  };
}