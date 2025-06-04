import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Alert,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Appointment } from '@/types/calendar';
import * as Haptics from 'expo-haptics';

type AppointmentModalProps = {
  visible: boolean;
  editingAppointment: Appointment | null;
  selectedDate: string;
  onClose: () => void;
  onSave: (appointmentData: any) => void;
  onDelete: (appointmentId: string) => void;
};

export default function AppointmentModal({
  visible,
  editingAppointment,
  selectedDate,
  onClose,
  onSave,
  onDelete
}: AppointmentModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(new Date());
  const [formTime, setFormTime] = useState(new Date());
  const [formLocation, setFormLocation] = useState('');
  const [formDoctorName, setFormDoctorName] = useState('');
  const [formDoctorSpecialty, setFormDoctorSpecialty] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Date/time picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Initialize form when modal opens
  useEffect(() => {
    if (visible) {
      if (editingAppointment) {
        // Fill form with appointment data
        setFormTitle(editingAppointment.title);
        setFormLocation(editingAppointment.location || '');
        setFormDoctorName(editingAppointment.doctorName || '');
        setFormDoctorSpecialty(editingAppointment.doctorSpecialty || '');
        setFormNotes(editingAppointment.notes || '');

        // Parse date
        const [year, month, day] = editingAppointment.date.split('-').map(n => parseInt(n, 10));
        const dateObj = new Date(year, month - 1, day);
        setFormDate(dateObj);

        // Parse time
        const [hours, minutes] = editingAppointment.time.split(':').map(n => parseInt(n, 10));
        const timeObj = new Date();
        timeObj.setHours(hours, minutes, 0, 0);
        setFormTime(timeObj);
      } else {
        // Reset form for new appointment
        setFormTitle('');
        setFormLocation('');
        setFormDoctorName('');
        setFormDoctorSpecialty('');
        setFormNotes('');
        setFormTime(new Date());

        // Use selected date
        const [year, month, day] = selectedDate.split('-').map(n => parseInt(n, 10));
        const selectedDateObj = new Date(year, month - 1, day);
        setFormDate(selectedDateObj);
      }
    }
  }, [visible, editingAppointment, selectedDate]);

  const handleSave = () => {
    if (!formTitle.trim()) {
      Alert.alert('Error', 'Please enter an appointment title');
      return;
    }

    const formattedDate = formDate.toISOString().split('T')[0];
    const formattedTime = `${String(formTime.getHours()).padStart(2, '0')}:${String(formTime.getMinutes()).padStart(2, '0')}`;

    const appointmentData = {
      title: formTitle.trim(),
      date: formattedDate,
      time: formattedTime,
      location: formLocation.trim(),
      doctorName: formDoctorName.trim(),
      doctorSpecialty: formDoctorSpecialty.trim(),
      notes: formNotes.trim(),
    };

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave(appointmentData);
  };

  const handleDelete = () => {
    if (editingAppointment) {
      Alert.alert(
        'Delete Appointment',
        'Are you sure you want to delete this appointment?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              onDelete(editingAppointment.id);
            }
          }
        ]
      );
    }
  };

  // Date/time picker handlers
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setFormTime(selectedTime);
    }
  };

  // Format functions
  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatDisplayTime = (time: Date) => {
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: Colors[colorScheme].card }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: Colors[colorScheme].text }]}>
              {editingAppointment ? 'Edit Appointment' : 'New Appointment'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors[colorScheme].text} />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Title *</Text>
            <TextInput
              style={[
                styles.textInput,
                { 
                  color: Colors[colorScheme].text,
                  backgroundColor: isDark ? '#132F4C' : '#F5F9FC',
                  borderColor: isDark ? '#1E3A5F' : '#E0E0E0'
                }
              ]}
              placeholder="Appointment Title"
              placeholderTextColor={isDark ? '#A0B4C5' : '#AAAAAA'}
              value={formTitle}
              onChangeText={setFormTitle}
            />

            {/* Date */}
            <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Date</Text>
            <TouchableOpacity 
              style={[
                styles.dateTimePicker,
                { 
                  backgroundColor: isDark ? '#132F4C' : '#F5F9FC',
                  borderColor: isDark ? '#1E3A5F' : '#E0E0E0'
                }
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={isDark ? '#A0B4C5' : '#757575'} />
              <Text style={[styles.dateTimeText, { color: Colors[colorScheme].text }]}>
                {formatDisplayDate(formDate)}
              </Text>
            </TouchableOpacity>

            {/* Time */}
            <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Time</Text>
            <TouchableOpacity 
              style={[
                styles.dateTimePicker,
                { 
                  backgroundColor: isDark ? '#132F4C' : '#F5F9FC',
                  borderColor: isDark ? '#1E3A5F' : '#E0E0E0'
                }
              ]}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color={isDark ? '#A0B4C5' : '#757575'} />
              <Text style={[styles.dateTimeText, { color: Colors[colorScheme].text }]}>
                {formatDisplayTime(formTime)}
              </Text>
            </TouchableOpacity>

            {/* Location */}
            <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Location</Text>
            <TextInput
              style={[
                styles.textInput,
                { 
                  color: Colors[colorScheme].text,
                  backgroundColor: isDark ? '#132F4C' : '#F5F9FC',
                  borderColor: isDark ? '#1E3A5F' : '#E0E0E0'
                }
              ]}
              placeholder="Location"
              placeholderTextColor={isDark ? '#A0B4C5' : '#AAAAAA'}
              value={formLocation}
              onChangeText={setFormLocation}
            />

            {/* Doctor Name */}
            <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Doctor Name</Text>
            <TextInput
              style={[
                styles.textInput,
                { 
                  color: Colors[colorScheme].text,
                  backgroundColor: isDark ? '#132F4C' : '#F5F9FC',
                  borderColor: isDark ? '#1E3A5F' : '#E0E0E0'
                }
              ]}
              placeholder="Doctor Name"
              placeholderTextColor={isDark ? '#A0B4C5' : '#AAAAAA'}
              value={formDoctorName}
              onChangeText={setFormDoctorName}
            />

            {/* Doctor Specialty */}
            <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Specialty</Text>
            <TextInput
              style={[
                styles.textInput,
                { 
                  color: Colors[colorScheme].text,
                  backgroundColor: isDark ? '#132F4C' : '#F5F9FC',
                  borderColor: isDark ? '#1E3A5F' : '#E0E0E0'
                }
              ]}
              placeholder="Doctor Specialty"
              placeholderTextColor={isDark ? '#A0B4C5' : '#AAAAAA'}
              value={formDoctorSpecialty}
              onChangeText={setFormDoctorSpecialty}
            />

            {/* Notes */}
            <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Notes</Text>
            <TextInput
              style={[
                styles.textInputMultiline,
                { 
                  color: Colors[colorScheme].text,
                  backgroundColor: isDark ? '#132F4C' : '#F5F9FC',
                  borderColor: isDark ? '#1E3A5F' : '#E0E0E0'
                }
              ]}
              placeholder="Notes"
              placeholderTextColor={isDark ? '#A0B4C5' : '#AAAAAA'}
              value={formNotes}
              onChangeText={setFormNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </ScrollView>

          {/* Actions */}
          <View style={styles.modalActions}>
            {editingAppointment && (
              <TouchableOpacity 
                style={[styles.deleteButton, { backgroundColor: '#FF3B30' }]}
                onPress={handleDelete}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: Colors[colorScheme].tint }]}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date/Time Pickers */}
        {showDatePicker && (
          <DateTimePicker
            value={formDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={formTime}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formContainer: {
    maxHeight: 400,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 8,
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 8,
  },
  textInputMultiline: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingTop: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  dateTimePicker: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 16,
    marginLeft: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  deleteButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginRight: 10,
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});