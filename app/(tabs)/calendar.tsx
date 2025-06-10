import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

// Import calendar components
import CalendarHeader from '@/components/calendar/CalendarHeader';
import CalendarView from '@/components/calendar/CalendarView';
import AppointmentsList from '@/components/calendar/AppointmentList';
import AppointmentModal from '@/components/calendar/AppointmentModal';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorDisplay from '@/components/forms/ErrorDisplay';

// Data hook
import { useCalendarData } from '@/hooks/useCalendarData';
import { AppointmentDisplay } from '@/types/calendar';

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);
  const [localLoading, setLoading] = useState(false);
  const { 
    selectedDate, 
    setSelectedDate,
    appointments, 
    appointmentsForSelectedDate,
    upcomingAppointments,
    loading,
    error,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    markAppointmentCompleted,
    rescheduleAppointment,
    fetchAppointments 
  } = useCalendarData();

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentDisplay | null>(null);

  // Pull to refresh functionality
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAppointments().finally(() => {
      setRefreshing(false);
    });
  }, [fetchAppointments]);

  const handleAddAppointment = () => {
    setEditingAppointment(null);
    setModalVisible(true);
  };

  const handleEditAppointment = (appointment: AppointmentDisplay) => {
    setEditingAppointment(appointment);
    setModalVisible(true);
  };

  // Update the handleSave function
  const handleSave = async (appointmentData: any) => {
    try {
      setLoading(true);
      console.log('💾 Saving appointment:', appointmentData);
      
      if (editingAppointment) {
        // Update existing appointment
        await updateAppointment(editingAppointment.id, appointmentData);
        console.log('✅ Appointment updated successfully');
      } else {
        // Create new appointment
        await addAppointment(appointmentData);
        console.log('✅ New appointment created successfully');
      }
      
      setModalVisible(false);
      setEditingAppointment(null);
    } catch (error) {
      console.error('❌ Error saving appointment:', error);
      Alert.alert('Error', 'Failed to save appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      await deleteAppointment(appointmentId);
      setModalVisible(false);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      // Modal will stay open, error is handled in the hook
    }
  };

  const handleMarkCompleted = async (appointmentId: string) => {
    try {
      await markAppointmentCompleted(appointmentId);
    } catch (error) {
      console.error('Error marking appointment as completed:', error);
    }
  };

  // Update the handleReschedule function
  const handleReschedule = async (appointmentId: string, newDate: string, newTime: string) => {
    try {
      setLoading(true);
      await rescheduleAppointment(appointmentId, newDate, newTime);
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      Alert.alert('Error', 'Failed to reschedule appointment');
    } finally {
      setLoading(false);
    }
  };

  if (loading && appointments.length === 0) {
    return <LoadingScreen message="Loading your appointments..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={Colors[colorScheme].tint}
            colors={[Colors[colorScheme].tint]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {error && <ErrorDisplay error={error} />}
        
        <CalendarHeader />
        
        <CalendarView
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          appointments={appointments}
          loading={loading}
        />
        
        <AppointmentsList
          selectedDate={selectedDate}
          appointments={appointmentsForSelectedDate}
          onAddAppointment={handleAddAppointment}
          onEditAppointment={handleEditAppointment}
          onMarkCompleted={handleMarkCompleted}
          onReschedule={handleReschedule}
          loading={loading}
        />
      </ScrollView>
      <AppointmentModal
        visible={modalVisible}
        editingAppointment={editingAppointment}
        selectedDate={selectedDate}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        onDelete={handleDeleteAppointment}
        loading={loading || localLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
});
