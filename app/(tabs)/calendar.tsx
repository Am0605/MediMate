import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

// Import calendar components
import CalendarHeader from '@/components/calendar/CalendarHeader';
import CalendarView from '@/components/calendar/CalendarView';
import AppointmentsList from '@/components/calendar/AppointmentList';
import AppointmentModal from '@/components/calendar/AppointmentModal';

// Data hook
import { useCalendarData } from '@/hooks/useCalendarData';

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);
  const { 
    selectedDate, 
    setSelectedDate,
    appointments, 
    appointmentsForSelectedDate,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    fetchAppointments 
  } = useCalendarData();

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

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

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setModalVisible(true);
  };

  const handleSaveAppointment = (appointmentData) => {
    if (editingAppointment) {
      updateAppointment(editingAppointment.id, appointmentData);
    } else {
      addAppointment(appointmentData);
    }
    setModalVisible(false);
  };

  const handleDeleteAppointment = (appointmentId) => {
    deleteAppointment(appointmentId);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <CalendarHeader />
        <CalendarView
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          appointments={appointments}
        />
        
        <AppointmentsList
          selectedDate={selectedDate}
          appointments={appointmentsForSelectedDate}
          onAddAppointment={handleAddAppointment}
          onEditAppointment={handleEditAppointment}
        />
      </ScrollView>

      <AppointmentModal
        visible={modalVisible}
        editingAppointment={editingAppointment}
        selectedDate={selectedDate}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveAppointment}
        onDelete={handleDeleteAppointment}
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
