import { useState, useEffect, useCallback, useMemo } from 'react';
import { Appointment } from '@/types/calendar';

// Mock data
const initialAppointments: Appointment[] = [
  {
    id: '1',
    title: 'Dr. Johnson - Annual Checkup',
    date: '2025-06-05',
    time: '09:30',
    location: 'City Medical Center',
    doctorName: 'Dr. Sarah Johnson',
    doctorSpecialty: 'Primary Care Physician',
    notes: 'Bring insurance card and list of current medications'
  },
  {
    id: '2',
    title: 'Dr. Lee - Dental Cleaning',
    date: '2025-06-10',
    time: '14:00',
    location: 'Smile Dental Clinic',
    doctorName: 'Dr. Michael Lee',
    doctorSpecialty: 'Dentist',
    notes: 'Schedule six-month follow-up appointment'
  },
  {
    id: '3',
    title: 'Dr. Patel - Eye Exam',
    date: '2025-06-15',
    time: '11:15',
    location: 'Clear Vision Eye Care',
    doctorName: 'Dr. Anita Patel',
    doctorSpecialty: 'Optometrist',
    notes: 'Bring current glasses/contacts'
  }
];

export function useCalendarData() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get appointments for the selected date
  const appointmentsForSelectedDate = useMemo(() => {
    return appointments
      .filter(appointment => appointment.date === selectedDate)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, selectedDate]);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAppointments(initialAppointments);
      setError(null);
    } catch (err) {
      setError('Failed to fetch appointments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addAppointment = useCallback((appointmentData: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      ...appointmentData,
    };
    setAppointments(prev => [...prev, newAppointment]);
    
    // Update selected date to the new appointment's date
    setSelectedDate(appointmentData.date);
  }, []);

  const updateAppointment = useCallback((id: string, appointmentData: Omit<Appointment, 'id'>) => {
    setAppointments(prev => 
      prev.map(appointment => 
        appointment.id === id 
          ? { ...appointment, ...appointmentData }
          : appointment
      )
    );
    
    // Update selected date to the updated appointment's date
    setSelectedDate(appointmentData.date);
  }, []);

  const deleteAppointment = useCallback((id: string) => {
    setAppointments(prev => prev.filter(appointment => appointment.id !== id));
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    selectedDate,
    setSelectedDate,
    appointments,
    appointmentsForSelectedDate,
    loading,
    error,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    fetchAppointments,
  };
}