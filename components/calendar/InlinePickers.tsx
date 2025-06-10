import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles } from './AppointmentModal.styles';

type InlinePickersProps = {
  showDatePicker: boolean;
  showTimePicker: boolean;
  formDate: Date;
  formTime: Date;
  onDateChange: (event: any, selectedDate?: Date) => void;
  onTimeChange: (event: any, selectedTime?: Date) => void;
  onCloseDatePicker: () => void;
  onCloseTimePicker: () => void;
  loading: boolean;
};

export default function InlinePickers({
  showDatePicker,
  showTimePicker,
  formDate,
  formTime,
  onDateChange,
  onTimeChange,
  onCloseDatePicker,
  onCloseTimePicker,
  loading
}: InlinePickersProps) {
  const colorScheme = useColorScheme();

  return (
    <>
      {showDatePicker && !loading && (
        <View style={[styles.inlinePicker, { backgroundColor: Colors[colorScheme].background }]}>
          <Text style={[styles.pickerTitle, { color: Colors[colorScheme].text }]}>
            Select Date
          </Text>
          <DateTimePicker
            value={formDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              // Handle the change
              onDateChange(event, selectedDate);
              
              // Auto-close on Android after selection
              if (Platform.OS === 'android') {
                onCloseDatePicker();
              }
            }}
            style={styles.picker}
          />
          {/* Only show Done button on iOS */}
          {Platform.OS === 'ios' && (
            <TouchableOpacity 
              style={[styles.pickerDone, { backgroundColor: Colors[colorScheme].tint }]}
              onPress={onCloseDatePicker}
            >
              <Text style={styles.pickerDoneText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {showTimePicker && !loading && (
        <View style={[styles.inlinePicker, { backgroundColor: Colors[colorScheme].background }]}>
          <Text style={[styles.pickerTitle, { color: Colors[colorScheme].text }]}>
            Select Time
          </Text>
          <DateTimePicker
            value={formTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedTime) => {
              // Handle the change
              onTimeChange(event, selectedTime);
              
              // Auto-close on Android after selection
              if (Platform.OS === 'android') {
                onCloseTimePicker();
              }
            }}
            style={styles.picker}
          />
          {/* Only show Done button on iOS */}
          {Platform.OS === 'ios' && (
            <TouchableOpacity 
              style={[styles.pickerDone, { backgroundColor: Colors[colorScheme].tint }]}
              onPress={onCloseTimePicker}
            >
              <Text style={styles.pickerDoneText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </>
  );
}