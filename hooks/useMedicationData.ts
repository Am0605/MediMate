import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/config/supabase';
import { MedicationItem, MedicationLog, ReminderItem } from '@/types/medication';
import { StyleSheet } from 'react-native';

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
  const [statsData, setStatsData] = useState({
    onTime: 0,
    late: 0,
    missed: 0,
    total: 0
  });

  // Helper function to get random color
  const getRandomColor = () => {
    return MEDICATION_COLORS[Math.floor(Math.random() * MEDICATION_COLORS.length)];
  };

  // Helper function to determine status based on timing
  const determineStatus = (scheduledTime: string, takenTime?: string): 'pending' | 'taken' | 'late' | 'missed' => {
    const scheduled = new Date(scheduledTime);
    const now = new Date();
    
    if (takenTime) {
      const taken = new Date(takenTime);
      const timeDiff = taken.getTime() - scheduled.getTime();
      const minutesDiff = timeDiff / (1000 * 60);
      
      // Consider "late" if taken more than 30 minutes after scheduled time
      return minutesDiff > 30 ? 'late' : 'taken';
    }
    
    // If not taken and more than 4 hours past scheduled time, mark as missed
    const timeDiff = now.getTime() - scheduled.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (hoursDiff > 4) {
      return 'missed';
    }
    
    return 'pending';
  };

  // Helper function to check if medication should have reminder today based on frequency
  const shouldHaveReminderToday = (medication: MedicationItem, today: Date): boolean => {
    const startDate = new Date(medication.start_date || new Date());
    const daysDifference = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    console.log(`📅 Frequency check for ${medication.name}:`, {
      frequency: medication.frequency,
      startDate: medication.start_date,
      startDateParsed: startDate.toISOString(),
      today: today.toISOString(),
      daysDifference,
      todayDayOfWeek: today.getDay(),
      startDateDayOfWeek: startDate.getDay()
    });

    switch (medication.frequency) {
      case 'once_daily':
      case 'twice_daily':
      case 'three_times_daily':
      case 'four_times_daily':
        console.log(`✅ Daily medication ${medication.name} should have reminder today`);
        return true; // Daily medications

      case 'every_other_day':
        const shouldHaveEveryOther = daysDifference % 2 === 0;
        console.log(`${shouldHaveEveryOther ? '✅' : '❌'} Every other day medication ${medication.name}: daysDifference=${daysDifference}, shouldHave=${shouldHaveEveryOther}`);
        return shouldHaveEveryOther; // Every other day

      case 'weekly':
        const shouldHaveWeekly = daysDifference % 7 === 0;
        console.log(`${shouldHaveWeekly ? '✅' : '❌'} Weekly medication ${medication.name}: daysDifference=${daysDifference}, shouldHave=${shouldHaveWeekly}`);
        return shouldHaveWeekly; // Same day of week as start date

      case 'as_needed':
        console.log(`⏭️ As needed medication ${medication.name} - no scheduled reminders`);
        return false; // No scheduled reminders

      default:
        console.log(`⚠️ Unknown frequency for ${medication.name}: ${medication.frequency}, defaulting to daily`);
        return true; // Default to daily
    }
  };

  // Add helper function to update log status
  const updateLogStatus = useCallback(async (logId: string, status: 'missed') => {
    try {
      const { error } = await supabase
        .from('medication_logs')
        .update({ status })
        .eq('id', logId);

      if (error) {
        console.error('❌ Error auto-updating log status:', error);
      } else {
        console.log('✅ Auto-updated log status to:', status);
      }
    } catch (err) {
      console.error('❌ Error in updateLogStatus:', err);
    }
  }, []);

  // Helper function to generate today's reminders from medications
  const generateTodaysReminders = useCallback((medications: MedicationItem[], logs: MedicationLog[]): ReminderItem[] => {
    // Get precise current day boundaries
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Use consistent date formatting
    const todayString = now.toISOString().split('T')[0];
    const reminders: ReminderItem[] = [];

    console.log('🔍 TODAY\'S REMINDER GENERATION DEBUG:', {
      currentDate: now.toISOString(),
      todayString,
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString(),
      dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
      dateOnly: now.toLocaleDateString('en-CA'), // YYYY-MM-DD format
      medicationsCount: medications.length,
      logsCount: logs.length
    });

    medications.forEach(medication => {
      if (!medication.is_active || !medication.reminder_times) {
        console.log(`⏭️ Skipping medication: ${medication.name} - active: ${medication.is_active}, reminder_times: ${medication.reminder_times}`);
        return;
      }
      
      // Check if this medication should have reminders today based on frequency
      const shouldHaveToday = shouldHaveReminderToday(medication, now);
      console.log(`📅 Medication frequency check: ${medication.name}`, {
        frequency: medication.frequency,
        startDate: medication.start_date,
        shouldHaveToday,
        todayDate: todayString
      });
      
      if (!shouldHaveToday) {
        console.log(`📅 Skipping reminders for ${medication.name} - not scheduled for today (${medication.frequency})`);
        return;
      }

      medication.reminder_times.forEach((timeString, index) => {
        // Fix the reminder date generation - use TODAY's date, not start_date
        const reminderDateTime = `${todayString}T${timeString}:00`;
        const reminderDate = new Date(reminderDateTime);
        
        console.log(`⏰ Processing reminder ${index + 1} for ${medication.name}:`, {
          originalTimeString: timeString,
          reminderDateTime,
          reminderDateISO: reminderDate.toISOString(),
          startOfDay: startOfDay.toISOString(),
          endOfDay: endOfDay.toISOString(),
          isAfterStart: reminderDate >= startOfDay,
          isBeforeEnd: reminderDate <= endOfDay,
          isWithinToday: reminderDate >= startOfDay && reminderDate <= endOfDay
        });
        
        // Ensure the reminder falls within today's boundaries
        if (reminderDate >= startOfDay && reminderDate <= endOfDay) {
          const reminderId = `${medication.id}-${timeString}`;
          
          // Find corresponding log for this reminder
          const log = logs.find(log => {
            const logMatches = log.medication_id === medication.id && 
              log.scheduled_time.startsWith(todayString) &&
              log.scheduled_time.includes(timeString);
            
            console.log(`🔍 Log matching for ${medication.name} at ${timeString}:`, {
              logId: log?.id,
              logMedicationId: log?.medication_id,
              logScheduledTime: log?.scheduled_time,
              medicationId: medication.id,
              todayString,
              timeString,
              startsWithToday: log?.scheduled_time.startsWith(todayString),
              includesTime: log?.scheduled_time.includes(timeString),
              matches: logMatches
            });
            
            return logMatches;
          });

          // Determine current status
          let status = log?.status || 'pending';
          let logId = log?.id;

          console.log(`📊 Status determination for ${medication.name} at ${timeString}:`, {
            logExists: !!log,
            logStatus: log?.status,
            logId: log?.id,
            finalStatus: status
          });

          // If no log exists or log is pending, check if we need to auto-update
          if (!log || log.status === 'pending') {
            const newStatus = determineStatus(reminderDate.toISOString());
            
            console.log(`🔄 Auto-status check for ${medication.name}:`, {
              originalStatus: log?.status || 'no log',
              newStatus,
              reminderTime: reminderDate.toISOString(),
              currentTime: now.toISOString()
            });
            
            // If status changed from pending to missed, we should update the database
            if (log && log.status === 'pending' && newStatus === 'missed') {
              // Auto-update the log in the database
              updateLogStatus(log.id, 'missed');
              status = 'missed';
            } else if (!log && newStatus === 'missed') {
              // If no log exists and it should be missed, we'll handle this in the UI
              status = newStatus;
            } else {
              status = newStatus;
            }
          }

          const reminder: ReminderItem = {
            id: reminderId,
            medicationId: medication.id,
            medicationName: medication.name,
            dosage: medication.dosage,
            time: reminderDate.toISOString(), // Ensure ISO format
            scheduledTime: reminderDate.toISOString(),
            instructions: medication.instructions || '',
            color: medication.color || getRandomColor(),
            status,
            logId,
          };

          console.log(`✅ Created reminder for ${medication.name}:`, {
            id: reminder.id,
            time: reminder.time,
            status: reminder.status,
            logId: reminder.logId
          });

          reminders.push(reminder);
        } else {
          console.log(`❌ Reminder time outside today's boundaries for ${medication.name}:`, {
            reminderTime: reminderDate.toISOString(),
            startOfDay: startOfDay.toISOString(),
            endOfDay: endOfDay.toISOString()
          });
        }
      });
    });

    const sortedReminders = reminders.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    
    console.log('🎯 FINAL REMINDERS GENERATED:', {
      totalReminders: sortedReminders.length,
      reminders: sortedReminders.map(r => ({
        name: r.medicationName,
        time: r.time,
        status: r.status,
        logId: r.logId
      }))
    });

    return sortedReminders;
  }, [updateLogStatus]);

  // Calculate adherence rate and stats from logs
  const calculateStats = useCallback((logs: MedicationLog[]) => {
    console.log('📊 Calculating stats from logs:', logs.length);
    
    const now = new Date();
    
    // Get current week boundaries (Monday to Sunday)
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Calculate days to Monday
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0); // Start of Monday
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999); // End of Sunday
    
    console.log('⏰ Current week boundaries:', {
      now: now.toISOString(),
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      currentDay,
      mondayOffset
    });
    
    // Filter logs for the current week (Monday to Sunday)
    const currentWeekLogs = logs.filter(log => {
      const logDate = new Date(log.scheduled_time);
      const isInCurrentWeek = logDate >= weekStart && logDate <= weekEnd;
      
      console.log('📅 Log check:', {
        scheduled: log.scheduled_time,
        status: log.status,
        logDate: logDate.toISOString(),
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        isAfterWeekStart: logDate >= weekStart,
        isBeforeWeekEnd: logDate <= weekEnd,
        isInCurrentWeek,
        dayOfWeek: logDate.toLocaleDateString('en-US', { weekday: 'long' })
      });
      
      return isInCurrentWeek;
    });

    console.log('📊 Current week logs found:', currentWeekLogs.length);

    if (currentWeekLogs.length === 0) {
      console.log('📊 No logs found for current week, setting stats to 0');
      setAdherenceRate(0);
      setStatsData({ onTime: 0, late: 0, missed: 0, total: 0 });
      return;
    }

    // Auto-update status for logs that should be missed (only for past scheduled times)
    const autoUpdatedLogs = currentWeekLogs.map(log => {
      const scheduledDate = new Date(log.scheduled_time);
      const hoursSinceScheduled = (now.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60);
      
      // Only auto-mark as missed if the scheduled time has passed by more than 4 hours and it's still pending
      if (log.status === 'pending' && scheduledDate < now && hoursSinceScheduled > 4) {
        console.log('⏰ Auto-marking as missed for stats:', {
          scheduled: log.scheduled_time,
          hoursPast: hoursSinceScheduled
        });
        
        // Update in database
        updateLogStatus(log.id, 'missed');
        
        return { ...log, status: 'missed' as const };
      }
      
      return log;
    });

    // Count by status
    const onTime = autoUpdatedLogs.filter(log => log.status === 'taken').length;
    const late = autoUpdatedLogs.filter(log => log.status === 'late').length;
    const missed = autoUpdatedLogs.filter(log => log.status === 'missed').length;
    const pending = autoUpdatedLogs.filter(log => log.status === 'pending').length;
    const total = autoUpdatedLogs.length;
    
    // Penalty-based (start from 100%)
    let adherenceRate = 100;
    if (total > 0) {
      const missedPenalty = (missed / total) * 100;
      const latePenalty = (late / total) * 50; // 50% penalty for late
      adherenceRate = Math.max(0, Math.round(100 - missedPenalty - latePenalty));
    }

    console.log('📊 Current week stats calculated:', { 
      onTime, 
      late, 
      missed, 
      pending,
      total, 
      adherenceRate
    });

    setAdherenceRate(adherenceRate);
    setStatsData({ onTime, late, missed, total });
  }, [updateLogStatus]);

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

      // Calculate stats
      calculateStats(logsData || []);

    } catch (err: any) {
      console.error('❌ Error fetching medication data:', err);
      setError(err.message || 'Failed to fetch medications');
    } finally {
      setLoading(false);
    }
  }, [generateTodaysReminders, calculateStats]);

  // Generate medication logs for a medication based on frequency
  const generateMedicationLogs = useCallback(async (medication: MedicationItem) => {
    try {
      if (!medication.reminder_times || medication.reminder_times.length === 0) return;

      const logs: Omit<MedicationLog, 'id' | 'created_at'>[] = [];
      const startDate = new Date(medication.start_date || new Date());
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // Generate for next 30 days

      console.log('📅 Generating logs for medication:', {
        name: medication.name,
        frequency: medication.frequency,
        reminderTimes: medication.reminder_times,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });

      // Generate logs based on frequency
      switch (medication.frequency) {
        case 'once_daily':
        case 'twice_daily':
        case 'three_times_daily':
        case 'four_times_daily':
          // Daily medications - generate for each day
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
          break;

        case 'every_other_day':
          // Every other day - generate for alternate days
          for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 2)) {
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
          break;

        case 'weekly':
          // Weekly - generate for same day of week
          const startDayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
          
          for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 7)) {
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
          break;

        case 'as_needed':
          // As needed - don't generate automatic logs
          console.log('💊 Skipping log generation for "as needed" medication:', medication.name);
          return;

        default:
          console.warn('⚠️ Unknown frequency, defaulting to daily:', medication.frequency);
          // Default to daily if frequency is unknown
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
          break;
      }

      if (logs.length === 0) {
        console.log('📅 No logs to generate for medication:', medication.name);
        return;
      }

      console.log('📅 Generated medication logs:', {
        medicationName: medication.name,
        frequency: medication.frequency,
        logsCount: logs.length,
        dateRange: `${logs[0]?.scheduled_time.split('T')[0]} to ${logs[logs.length - 1]?.scheduled_time.split('T')[0]}`
      });

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

  // Add new medication with color and proper frequency handling
  const addMedication = useCallback(async (medicationData: any) => {
    try {
      setLoading(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Authentication required');
      }

      console.log('💊 Adding medication:', medicationData);

    
      // Validate reminder times based on frequency
      const validateReminderTimes = (frequency: string, reminderTimes: Date[]) => {
        const frequencyLimits: { [key: string]: number } = {
          'once_daily': 1,
          'twice_daily': 2,
          'three_times_daily': 3,
          'four_times_daily': 4,
          'every_other_day': 1,
          'weekly': 1,
          'as_needed': 0, // No scheduled times for as needed
        };

        const maxTimes = frequencyLimits[frequency];
        if (maxTimes !== undefined && reminderTimes.length > maxTimes) {
          throw new Error(`${frequency.replace('_', ' ')} medications can have maximum ${maxTimes} reminder time(s)`);
        }

        if (frequency === 'as_needed' && reminderTimes.length > 0) {
          console.log('⚠️ Clearing reminder times for "as needed" medication');
          return [];
        }

        return reminderTimes;
      };

      const validatedReminderTimes = validateReminderTimes(
        medicationData.frequency, 
        medicationData.reminderTimes || []
      );

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
        color: medicationData.color || getRandomColor(),
        reminder_times: validatedReminderTimes.map((timeISO: string | Date) => {
          const time = new Date(timeISO);
          return `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
        }),
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

      // Generate medication logs based on frequency (only if not "as needed")
      if (data.frequency !== 'as_needed') {
        await generateMedicationLogs(data);
      }

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
  }, [fetchMedications, generateMedicationLogs]);
  
  // Mark medication as taken with smart status detection
  const markMedicationTaken = useCallback(async (logId: string, scheduledTime: string) => {
    try {
      const now = new Date();
      const scheduled = new Date(scheduledTime);
      const timeDiff = now.getTime() - scheduled.getTime();
      const minutesDiff = timeDiff / (1000 * 60);

      // Determine if it's on time or late
      const status = minutesDiff > 30 ? 'late' : 'taken';

      console.log('💊 Marking medication as taken:', { logId, scheduledTime, status, minutesDiff });

      const { data, error } = await supabase
        .from('medication_logs')
        .update({
          status: status,
          taken_time: now.toISOString(),
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

  // Mark medication as missed
  const markMedicationMissed = useCallback(async (logId: string) => {
    try {
      const { data, error } = await supabase
        .from('medication_logs')
        .update({
          status: 'missed',
        })
        .eq('id', logId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error marking medication as missed:', error);
        throw error;
      }

      console.log('✅ Medication marked as missed:', data);
      
      // Refresh data
      await fetchMedications();
      
      return data;
    } catch (err: any) {
      console.error('❌ Error marking medication as missed:', err);
      setError(err.message || 'Failed to mark medication as missed');
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

  // Simple and clear approach:
  const calculateAdherence = (stats: typeof statsData) => {
    if (stats.total === 0) return 100;
    
    // Simple: (taken + late) / total
    // This treats late doses as successful but shows them separately
    const successfulDoses = stats.onTime + stats.late;
    const adherence = (successfulDoses / stats.total) * 100;
    
    return Math.round(adherence);
  };

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
    statsData,
    fetchMedications,
    addMedication,
    updateMedication,
    deleteMedication,
    markMedicationTaken,
    markMedicationMissed,
  };
}

const styles = StyleSheet.create({
  adherenceDescription: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  penaltyText: {
    fontSize: 9,
    marginTop: 1,
  },
  calculationContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 6,
  },
  calculationText: {
    fontSize: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});