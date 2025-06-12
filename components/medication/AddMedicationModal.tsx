import React, { useState, useRef, useEffect } from 'react';
import { 
  Modal, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';

type AddMedicationModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (medicationData: any) => void;
  loading?: boolean;
};

const FREQUENCY_OPTIONS = [
  { label: 'Once daily', value: 'once_daily' },
  { label: 'Twice daily', value: 'twice_daily' },
  { label: 'Three times daily', value: 'three_times_daily' },
  { label: 'Four times daily', value: 'four_times_daily' },
  { label: 'Every other day', value: 'every_other_day' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'As needed', value: 'as_needed' },
];

const MEDICATION_COLORS = [
  '#4A90E2', '#50E3C2', '#F5A623', '#D0021B', 
  '#7ED321', '#9013FE', '#BD10E0', '#F8E71C',
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'
];

export default function AddMedicationModal({
  visible,
  onClose,
  onSave,
  loading = false
}: AddMedicationModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

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
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
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
      ]).start();
    }
  }, [visible]);

  // Form state
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('once_daily');
  const [instructions, setInstructions] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedColor, setSelectedColor] = useState(MEDICATION_COLORS[0]);
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reminderTimes, setReminderTimes] = useState<Date[]>([new Date()]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingTimeIndex, setEditingTimeIndex] = useState(0);

  const getMaxReminderTimes = (frequency: string): number => {
    const frequencyLimits: { [key: string]: number } = {
      'once_daily': 1,
      'twice_daily': 2,
      'three_times_daily': 3,
      'four_times_daily': 4,
      'every_other_day': 1,
      'weekly': 1,
      'as_needed': 0,
    };
    return frequencyLimits[frequency] || 1;
  };

  const getFrequencyDescription = (frequency: string): string => {
    const descriptions: { [key: string]: string } = {
      'once_daily': 'One reminder per day',
      'twice_daily': 'Two reminders per day',
      'three_times_daily': 'Three reminders per day',
      'four_times_daily': 'Four reminders per day',
      'every_other_day': 'One reminder every other day',
      'weekly': 'One reminder per week',
      'as_needed': 'No scheduled reminders (take when needed)',
    };
    return descriptions[frequency] || '';
  };

  const handleSave = () => {
    if (!medicationName.trim()) {
      Alert.alert('Error', 'Please enter a medication name');
      return;
    }

    if (!dosage.trim()) {
      Alert.alert('Error', 'Please enter the dosage');
      return;
    }

    // Validate reminder times based on frequency
    const maxTimes = getMaxReminderTimes(selectedFrequency);
    if (selectedFrequency !== 'as_needed' && reminderTimes.length === 0) {
      Alert.alert('Error', 'Please add at least one reminder time');
      return;
    }

    if (reminderTimes.length > maxTimes) {
      Alert.alert('Error', `${selectedFrequency.replace('_', ' ')} medications can have maximum ${maxTimes} reminder time(s)`);
      return;
    }

    const medicationData = {
      name: medicationName.trim(),
      dosage: dosage.trim(),
      frequency: selectedFrequency,
      startDate: startDate.toISOString().split('T')[0],
      instructions: instructions.trim() || null,
      prescriber: null,
      color: selectedColor,
      reminderTimes: reminderTimes,
    };

    console.log('💊 Saving medication data:', medicationData);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave(medicationData);
    handleClose();
  };

  const handleClose = () => {
    // Play close animation first
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset form
      setMedicationName('');
      setDosage('');
      setSelectedFrequency('once_daily');
      setInstructions('');
      setNotes('');
      setSelectedColor(MEDICATION_COLORS[0]);
      setStartDate(new Date());
      setReminderTimes([new Date()]);
      // Call onClose after animation and reset
      onClose();
    });
  };

  const addReminderTime = () => {
    const maxTimes = getMaxReminderTimes(selectedFrequency);
    
    if (selectedFrequency === 'as_needed') {
      Alert.alert('Not Available', 'As needed medications don\'t require scheduled reminder times.');
      return;
    }
    
    if (reminderTimes.length >= maxTimes) {
      Alert.alert('Limit Reached', `${selectedFrequency.replace('_', ' ')} medications can have maximum ${maxTimes} reminder time(s).`);
      return;
    }
    
    setReminderTimes([...reminderTimes, new Date()]);
  };

  const removeReminderTime = (index: number) => {
    if (reminderTimes.length > 1) {
      setReminderTimes(reminderTimes.filter((_, i) => i !== index));
    }
  };

  const updateReminderTime = (index: number, time: Date) => {
    const newTimes = [...reminderTimes];
    newTimes[index] = time;
    setReminderTimes(newTimes);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleFrequencyChange = (frequency: string) => {
    setSelectedFrequency(frequency);
    
    const maxTimes = getMaxReminderTimes(frequency);
    
    if (frequency === 'as_needed') {
      // Clear all reminder times for "as needed"
      setReminderTimes([]);
    } else {
      // Adjust reminder times to match frequency requirements
      const currentTimes = reminderTimes.length;
      
      if (currentTimes === 0) {
        // Add default reminder time if none exist
        setReminderTimes([new Date()]);
      } else if (currentTimes > maxTimes) {
        // Trim excess reminder times
        setReminderTimes(reminderTimes.slice(0, maxTimes));
      } else if (currentTimes < maxTimes && frequency.includes('daily')) {
        // Auto-add reminder times for multi-daily frequencies
        const newTimes = [...reminderTimes];
        const defaultTimes = ['09:00', '13:00', '18:00', '21:00'];
        
        while (newTimes.length < maxTimes && newTimes.length < defaultTimes.length) {
          const [hours, minutes] = defaultTimes[newTimes.length].split(':');
          const time = new Date();
          time.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          newTimes.push(time);
        }
        setReminderTimes(newTimes);
      }
    }
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
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
                Add Medication
              </Text>
              <TouchableOpacity onPress={handleClose} disabled={loading}>
                <Ionicons name="close" size={24} color={Colors[colorScheme].text} />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              {/* Medication Name */}
              <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>
                Medication Name *
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    color: Colors[colorScheme].text,
                    backgroundColor: isDark ? '#132F4C' : '#F5F9FC',
                    borderColor: isDark ? '#1E3A5F' : '#E0E0E0'
                  }
                ]}
                placeholder="Enter medication name"
                placeholderTextColor={isDark ? '#A0B4C5' : '#AAAAAA'}
                value={medicationName}
                onChangeText={setMedicationName}
                editable={!loading}
              />

              {/* Dosage */}
              <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>
                Dosage *
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    color: Colors[colorScheme].text,
                    backgroundColor: isDark ? '#132F4C' : '#F5F9FC',
                    borderColor: isDark ? '#1E3A5F' : '#E0E0E0'
                  }
                ]}
                placeholder="e.g., 10mg, 1 tablet"
                placeholderTextColor={isDark ? '#A0B4C5' : '#AAAAAA'}
                value={dosage}
                onChangeText={setDosage}
                editable={!loading}
              />

              {/* Frequency */}
              <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>
                Frequency
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.frequencyContainer}>
                {FREQUENCY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.frequencyChip,
                      {
                        backgroundColor: selectedFrequency === option.value 
                          ? Colors[colorScheme].tint 
                          : isDark ? '#1E3A5F' : '#F0F0F0',
                        borderColor: selectedFrequency === option.value 
                          ? Colors[colorScheme].tint 
                          : 'transparent'
                      }
                    ]}
                    onPress={() => handleFrequencyChange(option.value)}
                    disabled={loading}
                  >
                    <Text style={[
                      styles.frequencyText,
                      { 
                        color: selectedFrequency === option.value 
                          ? '#FFFFFF' 
                          : Colors[colorScheme].text 
                      }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Frequency Description */}
              {selectedFrequency && (
                <Text style={[styles.frequencyDescription, { color: isDark ? '#A0B4C5' : '#666666' }]}>
                  {getFrequencyDescription(selectedFrequency)}
                </Text>
              )}

              {/* Start Date */}
              <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>
                Start Date
              </Text>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  { 
                    backgroundColor: isDark ? '#1E3A5F' : '#FFFFFF',
                    borderColor: isDark ? '#2E4A6F' : '#E8EDF5'
                  }
                ]}
                onPress={() => setShowDatePicker(true)}
                disabled={loading}
              >
                <Ionicons name="calendar" size={20} color={Colors[colorScheme].tint} />
                <Text style={[styles.dateText, { color: Colors[colorScheme].text }]}>
                  {startDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>

              {/* Reminder Times */}
              <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>
                Reminder Times
              </Text>
              {reminderTimes.map((time, index) => (
                <View key={index} style={styles.reminderTimeRow}>
                  <TouchableOpacity
                    style={[
                      styles.timeButton,
                      { 
                        backgroundColor: isDark ? '#1E3A5F' : '#FFFFFF',
                        borderColor: isDark ? '#2E4A6F' : '#E8EDF5'
                      }
                    ]}
                    onPress={() => {
                      setEditingTimeIndex(index);
                      setShowTimePicker(true);
                    }}
                    disabled={loading}
                  >
                    <Ionicons name="time" size={20} color={Colors[colorScheme].tint} />
                    <Text style={[styles.timeText, { color: Colors[colorScheme].text }]}>
                      {formatTime(time)}
                    </Text>
                  </TouchableOpacity>
                  
                  {reminderTimes.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeTimeButton}
                      onPress={() => removeReminderTime(index)}
                      disabled={loading}
                    >
                      <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <TouchableOpacity
                style={[styles.addTimeButton, { borderColor: Colors[colorScheme].tint }]}
                onPress={addReminderTime}
                disabled={loading}
              >
                <Ionicons name="add" size={20} color={Colors[colorScheme].tint} />
                <Text style={[styles.addTimeText, { color: Colors[colorScheme].tint }]}>
                  Add Another Time
                </Text>
              </TouchableOpacity>

              {/* Color Selection */}
              <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>
                Color
              </Text>
              <View style={styles.colorContainer}>
                {MEDICATION_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { 
                        backgroundColor: color,
                        borderWidth: selectedColor === color ? 3 : 0,
                        borderColor: Colors[colorScheme].text
                      }
                    ]}
                    onPress={() => setSelectedColor(color)}
                    disabled={loading}
                  />
                ))}
              </View>

              {/* Instructions */}
              <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>
                Instructions
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    color: Colors[colorScheme].text,
                    backgroundColor: isDark ? '#132F4C' : '#F5F9FC',
                    borderColor: isDark ? '#1E3A5F' : '#E0E0E0'
                  }
                ]}
                placeholder="e.g., Take with food"
                placeholderTextColor={isDark ? '#A0B4C5' : '#AAAAAA'}
                value={instructions}
                onChangeText={setInstructions}
                editable={!loading}
              />

              {/* Notes */}
              <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>
                Notes
              </Text>
              <TextInput
                style={[
                  styles.textInputMultiline,
                  { 
                    color: Colors[colorScheme].text,
                    backgroundColor: isDark ? '#132F4C' : '#F5F9FC',
                    borderColor: isDark ? '#1E3A5F' : '#E0E0E0'
                  }
                ]}
                placeholder="Additional notes..."
                placeholderTextColor={isDark ? '#A0B4C5' : '#AAAAAA'}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!loading}
              />
            </ScrollView>

            {/* Date Picker */}
            {showDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setStartDate(selectedDate);
                  }
                }}
              />
            )}

            {/* Time Picker */}
            {showTimePicker && (
              <DateTimePicker
                value={reminderTimes[editingTimeIndex]}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) {
                    updateReminderTime(editingTimeIndex, selectedTime);
                  }
                }}
              />
            )}

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.cancelButton, { borderColor: Colors[colorScheme].text }]}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={[styles.cancelButtonText, { color: Colors[colorScheme].text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: Colors[colorScheme].tint }]}
                onPress={handleSave}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Adding...' : 'Add Medication'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
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
    maxHeight: '95%',
    minHeight: '80%',
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
    maxHeight: 600,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 8,
  },
  textInputMultiline: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  frequencyContainer: {
    marginBottom: 8,
  },
  frequencyChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  frequencyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    marginLeft: 12,
  },
  reminderTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 16,
    marginLeft: 12,
  },
  removeTimeButton: {
    padding: 8,
  },
  addTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  addTimeText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  frequencyDescription: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 8,
  },
});