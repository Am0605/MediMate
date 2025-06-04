import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Appointment } from '@/types/calendar';

type AppointmentsListProps = {
  selectedDate: string;
  appointments: Appointment[];
  onAddAppointment: () => void;
  onEditAppointment: (appointment: Appointment) => void;
};

export default function AppointmentsList({ 
  selectedDate, 
  appointments, 
  onAddAppointment, 
  onEditAppointment 
}: AppointmentsListProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const formatSelectedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].card }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: Colors[colorScheme].text }]}>
          Appointments for {formatSelectedDate(selectedDate)}
        </Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: Colors[colorScheme].tint }]}
          onPress={onAddAppointment}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons 
            name="calendar-outline" 
            size={64} 
            color={isDark ? '#455A64' : '#E0E0E0'} 
          />
          <Text style={[styles.emptyText, { color: isDark ? '#A0B4C5' : '#757575' }]}>
            No appointments for this day
          </Text>
          <TouchableOpacity 
            style={[styles.scheduleButton, { backgroundColor: Colors[colorScheme].tint }]}
            onPress={onAddAppointment}
          >
            <Text style={styles.scheduleButtonText}>Schedule Appointment</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.appointmentsList} showsVerticalScrollIndicator={false}>
          {appointments.map(appointment => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onPress={() => onEditAppointment(appointment)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// Sub-component for appointment cards
function AppointmentCard({ appointment, onPress }: { appointment: Appointment; onPress: () => void }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <TouchableOpacity
      style={[styles.appointmentCard, { backgroundColor: Colors[colorScheme].background }]}
      onPress={onPress}
    >
      <View style={styles.timeContainer}>
        <Text style={[styles.appointmentTime, { color: Colors[colorScheme].tint }]}>
          {formatTime(appointment.time)}
        </Text>
      </View>
      
      <View style={styles.appointmentDetails}>
        <Text style={[styles.appointmentTitle, { color: Colors[colorScheme].text }]}>
          {appointment.title}
        </Text>
        
        {appointment.location && (
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={14} color={isDark ? '#A0B4C5' : '#757575'} />
            <Text style={[styles.detailText, { color: isDark ? '#A0B4C5' : '#757575' }]}>
              {appointment.location}
            </Text>
          </View>
        )}
        
        {appointment.doctorName && (
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={14} color={isDark ? '#A0B4C5' : '#757575'} />
            <Text style={[styles.detailText, { color: isDark ? '#A0B4C5' : '#757575' }]}>
              {appointment.doctorName}
              {appointment.doctorSpecialty && ` • ${appointment.doctorSpecialty}`}
            </Text>
          </View>
        )}
      </View>
      
      <Ionicons name="chevron-forward" size={20} color={isDark ? '#A0B4C5' : '#C0C0C0'} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    minHeight: 200,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 16,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  scheduleButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 3,
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  appointmentsList: {
    maxHeight: 300,
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  timeContainer: {
    width: 80,
    alignItems: 'center',
    marginRight: 12,
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  appointmentDetails: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 6,
  },
});