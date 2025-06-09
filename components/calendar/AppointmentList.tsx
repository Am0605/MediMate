import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { AppointmentDisplay } from '@/types/calendar';
import * as Haptics from 'expo-haptics';

type AppointmentsListProps = {
  selectedDate: string;
  appointments: AppointmentDisplay[];
  onAddAppointment: () => void;
  onEditAppointment: (appointment: AppointmentDisplay) => void;
  onMarkCompleted: (appointmentId: string) => void;
  onReschedule: (appointmentId: string, newDate: string, newTime: string) => void;
  loading?: boolean;
};

export default function AppointmentsList({ 
  selectedDate, 
  appointments, 
  onAddAppointment, 
  onEditAppointment,
  onMarkCompleted,
  loading = false
}: AppointmentsListProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Keep the formatTime function simple and consistent:
  const formatTime = (timeString: string) => {
    console.log('🕐 Formatting time:', timeString);
    
    if (!timeString || !timeString.includes(':')) {
      console.warn('⚠️ Invalid time format:', timeString);
      return '9:00 AM'; // Fallback
    }
    
    const [hoursStr, minutesStr] = timeString.split(':');
    const hours = parseInt(hoursStr);
    const minutes = parseInt(minutesStr);
    
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHour = hours % 12 || 12;
    const result = `${formattedHour}:${String(minutes).padStart(2, '0')} ${ampm}`;
    
    console.log('🕐 Formatted result:', result);
    return result;
  };

  // Keep the date formatting consistent:
  const formatSelectedDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(n => parseInt(n, 10));
    const date = new Date(year, month - 1, day); // Local date
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleMarkCompleted = (appointment: AppointmentDisplay) => {
    if (loading) return;
    
    Alert.alert(
      'Mark as Completed',
      `Mark "${appointment.title}" as completed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Complete', 
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onMarkCompleted(appointment.id);
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].card }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: Colors[colorScheme].text }]}>
          {formatSelectedDate(selectedDate)}
        </Text>
        <TouchableOpacity 
          style={[
            styles.addButton, 
            { 
              backgroundColor: Colors[colorScheme].tint,
              opacity: loading ? 0.6 : 1
            }
          ]}
          onPress={onAddAppointment}
          disabled={loading}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Appointments List */}
      {loading && appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: isDark ? '#A0B4C5' : '#757575' }]}>
            Loading appointments...
          </Text>
        </View>
      ) : appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons 
            name="calendar-outline" 
            size={48} 
            color={isDark ? '#455A64' : '#E0E0E0'} 
          />
          <Text style={[styles.emptyText, { color: isDark ? '#A0B4C5' : '#757575' }]}>
            No appointments for this day
          </Text>
          <TouchableOpacity 
            style={[styles.scheduleButton, { backgroundColor: Colors[colorScheme].tint }]}
            onPress={onAddAppointment}
            disabled={loading}
          >
            <Text style={styles.scheduleButtonText}>Schedule Appointment</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {appointments.map(appointment => {
            const isCompleted = appointment.status === 'completed';
            
            return (
              <View
                key={appointment.id}
                style={[
                  styles.appointmentRow, 
                  { 
                    backgroundColor: Colors[colorScheme].background,
                    borderColor: isDark ? '#1E3A5F' : '#E0E0E0',
                    opacity: isCompleted ? 0.7 : 1
                  }
                ]}
              >
                {/* Time */}
                <View style={styles.timeContainer}>
                  <Text style={[
                    styles.time, 
                    { 
                      color: Colors[colorScheme].tint,
                      textDecorationLine: isCompleted ? 'line-through' : 'none'
                    }
                  ]}>
                    {formatTime(appointment.time)}
                  </Text>
                </View>
                
                {/* Appointment Details */}
                <TouchableOpacity
                  style={styles.detailsContainer}
                  onPress={() => onEditAppointment(appointment)}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.appointmentTitle, 
                    { 
                      color: Colors[colorScheme].text,
                      textDecorationLine: isCompleted ? 'line-through' : 'none'
                    }
                  ]}>
                    {appointment.title}
                  </Text>
                  
                  {appointment.doctorName && (
                    <View style={styles.doctorRow}>
                      <Ionicons name="person-outline" size={14} color={isDark ? '#A0B4C5' : '#666666'} />
                      <Text style={[styles.doctorName, { color: isDark ? '#A0B4C5' : '#666666' }]}>
                        Dr. {appointment.doctorName}
                      </Text>
                    </View>
                  )}
                  
                  {appointment.location && (
                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={14} color={isDark ? '#A0B4C5' : '#999999'} />
                      <Text style={[styles.locationText, { color: isDark ? '#A0B4C5' : '#999999' }]}>
                        {appointment.location}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Actions */}
                <View style={styles.actionsContainer}>
                  {/* Mark Complete Button - only show if not completed */}
                  {!isCompleted && appointment.status === 'scheduled' && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                      onPress={() => handleMarkCompleted(appointment)}
                      disabled={loading}
                    >
                      <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}

                  {/* Completed Status Icon */}
                  {isCompleted && (
                    <View style={[styles.statusIcon, { backgroundColor: '#4CAF50' }]}>
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    </View>
                  )}

                  {/* Edit Arrow */}
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => onEditAppointment(appointment)}
                    disabled={loading}
                  >
                    <Ionicons 
                      name="chevron-forward" 
                      size={20} 
                      color={isDark ? '#A0B4C5' : '#999999'} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    marginTop: 8,
    borderRadius: 16,
    padding: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 16,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  scheduleButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  timeContainer: {
    width: 80,
    alignItems: 'center',
    marginRight: 16,
  },
  time: {
    fontSize: 16,
    fontWeight: '700',
  },
  detailsContainer: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorName: {
    fontSize: 14,
    marginBottom: 2,
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    marginLeft: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  statusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  editButton: {
    padding: 4,
  },
});