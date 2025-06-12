import React, { useState, useEffect, useRef } from 'react';
import { Modal, TouchableOpacity, ScrollView, Alert, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { AppointmentDisplay } from '@/types/calendar';
import * as Haptics from 'expo-haptics';

import AppointmentForm from './AppointmentForm';
import DateTimeSelector from './DateTimeSelector';
import ReadOnlyView from './ReadOnlyView';
import InlinePickers from './InlinePickers';
import { styles } from './AppointmentModal.styles';

type AppointmentModalProps = {
  visible: boolean;
  editingAppointment: AppointmentDisplay | null;
  selectedDate: string;
  onClose: () => void;
  onSave: (appointmentData: any) => void;
  onDelete: (appointmentId: string) => void;
  loading?: boolean;
};

export default function AppointmentModal({
  visible,
  editingAppointment,
  selectedDate,
  onClose,
  onSave,
  onDelete,
  loading = false
}: AppointmentModalProps) {
  const colorScheme = useColorScheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

  // Animation effects
  useEffect(() => {
    if (visible) {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(100);

      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    // Play close animation first
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(new Date());
  const [formTime, setFormTime] = useState(new Date());
  const [formLocation, setFormLocation] = useState('');
  const [formDoctorName, setFormDoctorName] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Date/time picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Initialize form when modal opens
  useEffect(() => {
    if (visible) {
      if (editingAppointment) {
        setFormTitle(editingAppointment.title);
        setFormLocation(editingAppointment.location || '');
        setFormDoctorName(editingAppointment.doctorName || editingAppointment.doctor_name || '');
        setFormNotes(editingAppointment.notes || '');

        if (editingAppointment.date) {
          const [year, month, day] = editingAppointment.date.split('-').map(n => parseInt(n, 10));
          
          // Create date object using local timezone
          const dateObj = new Date(year, month - 1, day);
          setFormDate(dateObj);

          if (editingAppointment.time) {
            const [hours, minutes] = editingAppointment.time.split(':').map(n => parseInt(n, 10));
            
            // Create time object using local timezone
            const timeObj = new Date(year, month - 1, day, hours, minutes, 0, 0);
            setFormTime(timeObj);
            
            console.log('🔄 Loaded existing appointment time (local):', timeObj.toString());
          } else {
            const defaultTime = new Date(year, month - 1, day, 9, 0, 0, 0);
            setFormTime(defaultTime);
          }
        }
      } else {
        // New appointment
        setFormTitle('');
        setFormLocation('');
        setFormDoctorName('');
        setFormNotes('');

        const [year, month, day] = selectedDate.split('-').map(n => parseInt(n, 10));
        
        // Create date object using local timezone
        const selectedDateObj = new Date(year, month - 1, day);
        setFormDate(selectedDateObj);

        // Set default time to 9:00 AM using local timezone
        const defaultTime = new Date(year, month - 1, day, 9, 0, 0, 0);
        setFormTime(defaultTime);
        
        console.log('📅 New appointment date (local):', selectedDateObj.toDateString());
        console.log('🕐 Default time (local):', defaultTime.toString());
      }
    }
  }, [visible, editingAppointment, selectedDate]);

  // Update the handleSave function to save as local time without timezone:
  const handleSave = () => {
    if (!formTitle.trim()) {
      Alert.alert('Error', 'Please enter an appointment title');
      return;
    }

    // Format date using local timezone
    const year = formDate.getFullYear();
    const month = String(formDate.getMonth() + 1).padStart(2, '0');
    const day = String(formDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    // Format time using local timezone
    const hours = formTime.getHours();
    const minutes = formTime.getMinutes();
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    // Create timestamp without timezone (treat as local time)
    const startTimeLocal = `${formattedDate}T${formattedTime}:00`;

    console.log('💾 Saving appointment:');
    console.log('📅 Local start_time (no TZ):', startTimeLocal);

    const appointmentData = {
      title: formTitle.trim(),
      start_time: startTimeLocal, // Save without timezone
      location: formLocation.trim() || null,
      doctor_name: formDoctorName.trim() || null,
      notes: formNotes.trim() || null,
      appointment_type: 'doctor_visit' as const,
      status: 'scheduled' as const,
    };

    console.log('📋 Final appointment data:', appointmentData);
    
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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    console.log('📅 Date change event:', event.type);
    
    if (event.type === 'dismissed') {
      // User cancelled
      setShowDatePicker(false);
      return;
    }
    
    if (selectedDate) {
      const localDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      );
      
      setFormDate(localDate);
      
      const newTime = new Date(
        localDate.getFullYear(),
        localDate.getMonth(),
        localDate.getDate(),
        formTime.getHours(),
        formTime.getMinutes(),
        0,
        0
      );
      setFormTime(newTime);
      
      // Auto-close after successful selection
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
      }
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    console.log('🕐 Time change event:', event.type);
    
    if (event.type === 'dismissed') {
      // User cancelled
      setShowTimePicker(false);
      return;
    }
    
    if (selectedTime) {
      const newTime = new Date(
        formDate.getFullYear(),
        formDate.getMonth(),
        formDate.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes(),
        0,
        0
      );
      setFormTime(newTime);
      
      // Auto-close after successful selection
      if (Platform.OS === 'android') {
        setShowTimePicker(false);
      }
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    console.log('📅 Date picker event:', event.type, selectedDate);
    
    if (selectedDate) {
      // Create a new date using local timezone (no UTC conversion)
      const localDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      );
      
      setFormDate(localDate);
      
      // Update the time to use the new date but keep the same hours/minutes
      const newTime = new Date(
        localDate.getFullYear(),
        localDate.getMonth(),
        localDate.getDate(),
        formTime.getHours(),
        formTime.getMinutes(),
        0,
        0
      );
      setFormTime(newTime);
      
      console.log('📅 Date changed to (local):', localDate.toDateString());
      console.log('🕐 Time updated to (local):', newTime.toString());
    }
    
    // Don't auto-close here - let InlinePickers handle it
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    console.log('🕐 Time picker event:', event.type, selectedTime);
    
    if (selectedTime) {
      // Create new time using the form date but with the selected time (local timezone)
      const newTime = new Date(
        formDate.getFullYear(),
        formDate.getMonth(),
        formDate.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes(),
        0,
        0
      );
      setFormTime(newTime);
      
      console.log('🕐 Time changed to (local):', newTime.toString());
    }
    
    // Don't auto-close here - let InlinePickers handle it
  };

  const formatDisplayDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const dateStr = date.toLocaleDateString();
    const todayStr = today.toLocaleDateString();
    const tomorrowStr = tomorrow.toLocaleDateString();
    
    if (dateStr === todayStr) return 'Today';
    if (dateStr === tomorrowStr) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
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

  const isCompleted = editingAppointment?.status === 'completed';
  const isNewAppointment = !editingAppointment;

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <Animated.View 
        style={[
          styles.modalContainer,
          {
            opacity: fadeAnim,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.modalContent, 
            { 
              backgroundColor: Colors[colorScheme].card,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: Colors[colorScheme].text }]}>
              {editingAppointment ? 'Edit Appointment' : 'New Appointment'}
            </Text>
            <TouchableOpacity onPress={handleClose} disabled={loading}>
              <Ionicons name="close" size={24} color={Colors[colorScheme].text} />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            {isCompleted ? (
              <ReadOnlyView
                formTitle={formTitle}
                formLocation={formLocation}
                formDoctorName={formDoctorName}
                formNotes={formNotes}
              />
            ) : (
              <>
                <AppointmentForm
                  formTitle={formTitle}
                  setFormTitle={setFormTitle}
                  formLocation={formLocation}
                  setFormLocation={setFormLocation}
                  formDoctorName={formDoctorName}
                  setFormDoctorName={setFormDoctorName}
                  formNotes={formNotes}
                  setFormNotes={setFormNotes}
                  loading={loading}
                />

                <DateTimeSelector
                  isNewAppointment={isNewAppointment}
                  isCompleted={isCompleted}
                  formDate={formDate}
                  formTime={formTime}
                  onDatePress={() => setShowDatePicker(true)}
                  onTimePress={() => setShowTimePicker(true)}
                  loading={loading}
                  formatDisplayDate={formatDisplayDate}
                  formatDisplayTime={formatDisplayTime}
                />
              </>
            )}
          </ScrollView>

          {/* Inline Pickers */}
          <InlinePickers
            showDatePicker={showDatePicker}
            showTimePicker={showTimePicker}
            formDate={formDate}
            formTime={formTime}
            onDateChange={handleDateChange}
            onTimeChange={handleTimeChange}
            onCloseDatePicker={() => setShowDatePicker(false)}
            onCloseTimePicker={() => setShowTimePicker(false)}
            loading={loading}
          />

          {/* Actions */}
          <View style={styles.modalActions}>
            {isCompleted ? (
              <TouchableOpacity 
                style={[styles.closeButton, { backgroundColor: Colors[colorScheme].tint }]}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            ) : (
              <>
                {editingAppointment && (
                  <TouchableOpacity 
                    style={[styles.deleteButton, { backgroundColor: '#FF3B30' }]}
                    onPress={handleDelete}
                    disabled={loading}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={[styles.saveButton, { backgroundColor: Colors[colorScheme].tint }]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Saving...' : editingAppointment ? 'Update' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}