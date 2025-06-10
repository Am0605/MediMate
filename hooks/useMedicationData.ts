import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/config/supabase';
import { MedicationItem, MedicationLog, ReminderItem } from '@/types/medication';

const MEDICATION_COLORS = [
  '#4A90E2', '#50E3C2', '#F5A623', '#D0021B', 
  '#7ED321', '#9013FE', '#BD10E0', '#F8E71C',
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'
];

export function useMedicationData() {
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adherenceRate, setAdherenceRate] = useState(0);
  
  // Helper function to get random color
  const getRandomColor = () => {
    return MEDICATION_COLORS[Math.floor(Math.random() * MEDICATION_COLORS.length)];
  };

  // Helper function to generate today's reminders from medications
  const generateTodaysReminders = useCallback((medications: MedicationItem[], logs: MedicationLog[]): ReminderItem[] => {
    const today = new Date().toISOString().split('T')[0];
    const reminders: ReminderItem[] = [];

    medications.forEach(medication => {
      if (!medication.is_active || !medication.reminder_times) return;

      medication.reminder_times.forEach(timeString => {
        const reminderDateTime = `${today}T${timeString}:00`;
        const reminderId = `${medication.id}-${timeString}`;
        
        // Find corresponding log for this reminder
        const log = logs.find(log => 
          log.medication_id === medication.id && 
          log.scheduled_time.startsWith(today) &&
          log.scheduled_time.includes(timeString)
        );

        reminders.push({
          id: reminderId,
          medicationId: medication.id,
          medicationName: medication.name,
          dosage: medication.dosage,
          time: reminderDateTime,
          instructions: medication.instructions || '',
          color: getRandomColor(),
          status: log?.status || 'pending',
          logId: log?.id,
        });
      });
    });

    return reminders.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }, []);

  // Calculate adherence rate from logs
  const calculateAdherenceRate = useCallback((logs: MedicationLog[]) => {
    const lastWeekLogs = logs.filter(log => {
      const logDate = new Date(log.scheduled_time);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return logDate >= weekAgo;
    });

    if (lastWeekLogs.length === 0) return 0;

    const takenLogs = lastWeekLogs.filter(log => log.status === 'taken');
    return Math.round((takenLogs.length / lastWeekLogs.length) * 100);
  }, []);

  // Fetch medications from Supabase
  const fetchMedications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Authentication required');
      }

      console.log('📋 Fetching medications for user:', user.id);

      // Fetch medications
      const { data: medicationsData, error: medicationsError } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (medicationsError) {
        console.error('❌ Error fetching medications:', medicationsError);
        throw medicationsError;
      }

      console.log('✅ Medications fetched:', medicationsData);

      // Fetch recent medication logs (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: logsData, error: logsError } = await supabase
        .from('medication_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('scheduled_time', thirtyDaysAgo.toISOString())
        .order('scheduled_time', { ascending: false });

      if (logsError) {
        console.error('❌ Error fetching medication logs:', logsError);
        throw logsError;
      }

      console.log('✅ Medication logs fetched:', logsData);

      // Update state
      setMedications(medicationsData || []);
      setMedicationLogs(logsData || []);
      
      // Generate today's reminders
      const todaysReminders = generateTodaysReminders(medicationsData || [], logsData || []);
      setReminders(todaysReminders);

      // Calculate adherence rate
      const adherence = calculateAdherenceRate(logsData || []);
      setAdherenceRate(adherence);

    } catch (err: any) {
      console.error('❌ Error fetching medication data:', err);
      setError(err.message || 'Failed to fetch medications');
    } finally {
      setLoading(false);
    }
  }, [generateTodaysReminders, calculateAdherenceRate]);

  // Add new medication
  const addMedication = useCallback(async (medicationData: any) => {
    try {
      setLoading(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Authentication required');
      }

      console.log('💊 Adding medication:', medicationData);

      const medicationToInsert = {
        user_id: user.id,
        name: medicationData.name,
        dosage: medicationData.dosage,
        frequency: medicationData.frequency,
        instructions: medicationData.instructions || null,
        prescriber: medicationData.prescriber || null,
        start_date: medicationData.startDate || new Date().toISOString().split('T')[0],
        end_date: medicationData.endDate || null,
        is_active: true,
        reminder_times: medicationData.reminderTimes?.map((timeISO: string) => {
          const time = new Date(timeISO);
          return `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
        }) || [],
      };

      const { data, error } = await supabase
        .from('medications')
        .insert([medicationToInsert])
        .select()
        .single();

      if (error) {
        console.error('❌ Database error:', error);
        throw new Error('Failed to add medication: ' + error.message);
      }

      console.log('✅ Medication added:', data);

      // Generate medication logs for the next 30 days
      await generateMedicationLogs(data);

      // Refresh data
      await fetchMedications();

      return data;
    } catch (err: any) {
      console.error('❌ Error adding medication:', err);
      setError(err.message || 'Failed to add medication');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMedications]);

  // Generate medication logs for a medication
  const generateMedicationLogs = useCallback(async (medication: MedicationItem) => {
    try {
      if (!medication.reminder_times || medication.reminder_times.length === 0) return;

      const logs: Omit<MedicationLog, 'id' | 'created_at'>[] = [];
      const startDate = new Date(medication.start_date || new Date());
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // Generate for next 30 days

      // Generate logs for each day
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dateString = date.toISOString().split('T')[0];
        
        medication.reminder_times.forEach(timeString => {
          const scheduledTime = `${dateString}T${timeString}:00+00:00`;
          
          logs.push({
            user_id: medication.user_id,
            medication_id: medication.id,
            scheduled_time: scheduledTime,
            status: 'pending',
          });
        });
      }

      console.log('📅 Generating medication logs:', logs.length);

      const { error } = await supabase
        .from('medication_logs')
        .insert(logs);

      if (error) {
        console.error('❌ Error generating medication logs:', error);
        throw error;
      }

      console.log('✅ Medication logs generated successfully');
    } catch (err) {
      console.error('❌ Error generating medication logs:', err);
    }
  }, []);

  // Mark medication as taken
  const markMedicationTaken = useCallback(async (logId: string) => {
    try {
      const { data, error } = await supabase
        .from('medication_logs')
        .update({
          status: 'taken',
          taken_time: new Date().toISOString(),
        })
        .eq('id', logId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error marking medication as taken:', error);
        throw error;
      }

      console.log('✅ Medication marked as taken:', data);
      
      // Refresh data
      await fetchMedications();
      
      return data;
    } catch (err: any) {
      console.error('❌ Error marking medication as taken:', err);
      setError(err.message || 'Failed to mark medication as taken');
      throw err;
    }
  }, [fetchMedications]);

  // Update medication
  const updateMedication = useCallback(async (id: string, updates: Partial<MedicationItem>) => {
    try {
      setLoading(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase
        .from('medications')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating medication:', error);
        throw error;
      }

      console.log('✅ Medication updated:', data);
      
      // Refresh data
      await fetchMedications();
      
      return data;
    } catch (err: any) {
      console.error('❌ Error updating medication:', err);
      setError(err.message || 'Failed to update medication');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMedications]);

  // Delete medication
  const deleteMedication = useCallback(async (id: string) => {
    try {
      setLoading(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Authentication required');
      }

      // Soft delete by marking as inactive
      const { data, error } = await supabase
        .from('medications')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error deleting medication:', error);
        throw error;
      }

      console.log('✅ Medication deleted:', data);
      
      // Refresh data
      await fetchMedications();
      
      return data;
    } catch (err: any) {
      console.error('❌ Error deleting medication:', err);
      setError(err.message || 'Failed to delete medication');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMedications]);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);
  
  return {
    medications,
    reminders,
    medicationLogs,
    loading,
    error,
    adherenceRate,
    fetchMedications,
    addMedication,
    updateMedication,
    deleteMedication,
    markMedicationTaken,
  };
}