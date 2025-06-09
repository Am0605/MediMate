import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/config/supabase';
import { Appointment, AppointmentFormData, AppointmentDisplay } from '@/types/calendar';

export function useCalendarData() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // More explicit timezone handling
  const extractDateFromTimestamp = (timestamp: string): string => {
    try {
      // Create date object from timestamp
      const d = new Date(timestamp);
      
      // Manually format to avoid timezone issues
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      
      const formatted = `${year}-${month}-${day}`;
      console.log(`🕐 Extracting date: ${timestamp} -> ${formatted}`);
      return formatted;
    } catch (error) {
      console.error('Date extraction error:', error);
      return '';
    }
  };

  // Helper function to convert timestamp to time (in local time)
  const extractTimeFromTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    
    // Use local time, not UTC
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${hours}:${minutes}`;
  };

  // Convert appointments to display format
  const convertToDisplayFormat = (appointment: Appointment): AppointmentDisplay => {
    console.log('🔍 Converting appointment:', appointment);
    console.log('🕐 Raw start_time:', appointment.start_time);
    
    // Parse the timestamp but ignore the timezone offset
    // Treat it as local time by removing the timezone part
    const timestampWithoutTZ = appointment.start_time.replace(/\+\d{2}:\d{2}$/, '');
    console.log('🕐 Timestamp without TZ:', timestampWithoutTZ);
    
    // Parse as local time
    const startTime = new Date(timestampWithoutTZ);
    console.log('📅 Parsed as local time:', startTime.toString());
    
    // Extract date in YYYY-MM-DD format
    const year = startTime.getFullYear();
    const month = String(startTime.getMonth() + 1).padStart(2, '0');
    const day = String(startTime.getDate()).padStart(2, '0');
    const date = `${year}-${month}-${day}`;
    
    // Extract time in HH:MM format
    const hours = String(startTime.getHours()).padStart(2, '0');
    const minutes = String(startTime.getMinutes()).padStart(2, '0');
    const time = `${hours}:${minutes}`;
    
    console.log('📅 Extracted date (local):', date);
    console.log('🕐 Extracted time (local):', time);
    
    return {
      ...appointment,
      date,
      time,
      doctorName: appointment.doctor_name,
    };
  };

  const appointmentsDisplay = useMemo((): AppointmentDisplay[] => {
    return appointments.map(convertToDisplayFormat);
  }, [appointments]);

  // Get appointments for the selected date
  const appointmentsForSelectedDate = useMemo(() => {
    return appointmentsDisplay
      .filter(appointment => appointment.date === selectedDate)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointmentsDisplay, selectedDate]);

  // Get upcoming appointments (next 7 days)
  const upcomingAppointments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return appointmentsDisplay
      .filter(appointment => 
        appointment.date >= today && 
        appointment.date <= nextWeek &&
        appointment.status === 'scheduled'
      )
      .sort((a, b) => {
        if (a.date === b.date) {
          return a.time.localeCompare(b.time);
        }
        return a.date.localeCompare(b.date);
      });
  }, [appointmentsDisplay]);

  // Get appointments by month for calendar display
  const getAppointmentsByMonth = useCallback((year: number, month: number) => {
    const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const monthEnd = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
    
    return appointmentsDisplay.filter(appointment => 
      appointment.date >= monthStart && appointment.date < monthEnd
    );
  }, [appointmentsDisplay]);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error('Authentication error: ' + userError.message);
      }
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      console.log('🔍 Fetching appointments for user:', user.id);

      // Fetch appointments from Supabase with correct field names
      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      if (fetchError) {
        console.error('Appointments fetch error:', fetchError);
        throw new Error('Failed to fetch appointments: ' + fetchError.message);
      }

      console.log('✅ Appointments loaded:', data?.length || 0);
      setAppointments(data || []);
      
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setError(err.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fix the addAppointment function - make it consistent
  const addAppointment = useCallback(async (appointmentData: any) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Authentication required');

      console.log('➕ Adding appointment:', appointmentData);

      // Create the appointment record with start_time
      const appointmentToInsert = {
        user_id: user.id,
        title: appointmentData.title,
        description: appointmentData.description || null,
        appointment_type: appointmentData.appointment_type || 'doctor_visit',
        doctor_name: appointmentData.doctor_name,
        location: appointmentData.location,
        start_time: appointmentData.start_time, // Use the ISO timestamp directly
        end_time: appointmentData.end_time || null,
        status: appointmentData.status || 'scheduled',
        reminder_minutes: appointmentData.reminder_minutes || 60,
        notes: appointmentData.notes,
      };

      console.log('📋 Inserting to database:', appointmentToInsert);

      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentToInsert])
        .select()
        .single();

      if (error) {
        console.error('❌ Database error:', error);
        throw new Error('Failed to add appointment: ' + error.message);
      }

      console.log('✅ Appointment created:', data);

      // Update local state
      setAppointments(prev => [...prev, data]);
      
      // Extract date for UI navigation
      const newDate = extractDateFromTimestamp(data.start_time);
      setSelectedDate(newDate);
      
      return data;
      
    } catch (err: any) {
      console.error('❌ Error adding appointment:', err);
      setError(err.message || 'Failed to add appointment');
      throw err;
    }
  }, []);

  const updateAppointment = useCallback(async (id: string, appointmentData: any) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Authentication required');

      console.log('📝 Updating appointment:', id, appointmentData);

      // Use the data as-is since it's already in the correct format
      const updateData = {
        title: appointmentData.title,
        start_time: appointmentData.start_time,
        location: appointmentData.location,
        doctor_name: appointmentData.doctor_name,
        notes: appointmentData.notes,
        appointment_type: appointmentData.appointment_type,
        status: appointmentData.status,
      };

      const { data, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Database error:', error);
        throw new Error('Failed to update appointment: ' + error.message);
      }

      console.log('✅ Database updated:', data);

      // Update local state
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === id ? data : appointment
        )
      );
      
      // Update selected date if needed
      const newDate = extractDateFromTimestamp(data.start_time);
      setSelectedDate(newDate);
      
      return data;
      
    } catch (err: any) {
      console.error('❌ Error updating appointment:', err);
      setError(err.message || 'Failed to update appointment');
      throw err;
    }
  }, []);

  const deleteAppointment = useCallback(async (id: string) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Authentication required');

      console.log('🗑️ Deleting appointment:', id);

      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Delete appointment error:', error);
        throw new Error('Failed to delete appointment: ' + error.message);
      }

      // Update local state
      setAppointments(prev => prev.filter(appointment => appointment.id !== id));
      
      console.log('✅ Appointment deleted successfully');
      
    } catch (err: any) {
      console.error('Error deleting appointment:', err);
      setError(err.message || 'Failed to delete appointment');
      throw err;
    }
  }, []);

  const markAppointmentCompleted = useCallback(async (id: string) => {
    try {
      await updateAppointment(id, { status: 'completed' });
    } catch (err) {
      console.error('Error marking appointment as completed:', err);
    }
  }, [updateAppointment]);

  const rescheduleAppointment = useCallback(async (id: string, newDate: string, newTime: string) => {
    try {
      console.log('🔄 Rescheduling appointment:', { id, newDate, newTime });
      
      // Create timestamp with new date/time
      const [y, m, d] = newDate.split('-').map(Number);
      const [hh, mm] = newTime.split(':').map(Number);
      const localDate = new Date(y, m - 1, d, hh, mm);
      const newStartTime = localDate.toISOString();
      
      await updateAppointment(id, { 
        start_time: newStartTime,
        status: 'rescheduled' 
      });
      
      console.log('✅ Appointment rescheduled successfully');
    } catch (err) {
      console.error('Error rescheduling appointment:', err);
      throw err;
    }
  }, [updateAppointment]);

  // Set up real-time subscriptions
  useEffect(() => {
    fetchAppointments();

    // Set up real-time subscription for appointments
    const appointmentsChannel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
        },
        (payload) => {
          console.log('🔄 Appointments updated:', payload);
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(appointmentsChannel);
    };
  }, [fetchAppointments]);

  return {
    selectedDate,
    setSelectedDate,
    appointments: appointmentsDisplay, // Return display format
    appointmentsForSelectedDate,
    upcomingAppointments,
    loading,
    error,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    markAppointmentCompleted,
    rescheduleAppointment,
    fetchAppointments,
    getAppointmentsByMonth,
  };
}