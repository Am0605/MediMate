import { useState, useEffect, useCallback } from 'react';
import { MedicationItem, ReminderItem } from '@/types/medication';

// Mock data for testing
const mockMedications: MedicationItem[] = [
  {
    id: '1',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    startDate: '2025-05-15',
    color: '#4A90E2',
    instructions: 'Take with food',
    tags: ['Heart', 'Blood Pressure'],
  },
  {
    id: '2',
    name: 'Simvastatin',
    dosage: '20mg',
    frequency: 'Once daily, at bedtime',
    startDate: '2025-05-10',
    color: '#50E3C2',
    instructions: 'Take at night',
    tags: ['Cholesterol'],
  },
  {
    id: '3',
    name: 'Vitamin D3',
    dosage: '1000 IU',
    frequency: 'Once daily',
    startDate: '2025-04-01',
    color: '#F5A623',
    instructions: 'Take with meal',
    tags: ['Supplement'],
  },
];

const mockReminders: ReminderItem[] = [
  {
    id: '101',
    medicationId: '1',
    medicationName: 'Lisinopril',
    dosage: '10mg',
    time: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
    instructions: 'Take with food',
    color: '#4A90E2',
  },
  {
    id: '102',
    medicationId: '2',
    medicationName: 'Simvastatin',
    dosage: '20mg',
    time: new Date(new Date().setHours(22, 0, 0, 0)).toISOString(),
    instructions: 'Take at night',
    color: '#50E3C2',
  },
  {
    id: '103',
    medicationId: '3',
    medicationName: 'Vitamin D3',
    dosage: '1000 IU',
    time: new Date(new Date().setHours(13, 0, 0, 0)).toISOString(),
    instructions: 'Take with meal',
    color: '#F5A623',
  },
];

export function useMedicationData() {
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adherenceRate, setAdherenceRate] = useState(85);
  
  const fetchMedications = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // This would be replaced with actual API calls
      setMedications(mockMedications);
      setReminders(mockReminders);
      setError(null);
    } catch (err) {
      setError('Failed to fetch medications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);
  
  return {
    medications,
    reminders,
    loading,
    error,
    adherenceRate,
    fetchMedications,
  };
}