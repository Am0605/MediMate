import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { styles } from './AppointmentModal.styles';

type DateTimeSelectorProps = {
  isNewAppointment: boolean;
  isCompleted: boolean;
  formDate: Date;
  formTime: Date;
  onDatePress: () => void;
  onTimePress: () => void;
  loading: boolean;
  formatDisplayDate: (date: Date) => string;
  formatDisplayTime: (time: Date) => string;
};

export default function DateTimeSelector({
  isNewAppointment,
  isCompleted,
  formDate,
  formTime,
  onDatePress,
  onTimePress,
  loading,
  formatDisplayDate,
  formatDisplayTime
}: DateTimeSelectorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (isCompleted) {
    return (
      <View style={styles.displayOnlySection}>
        <View style={styles.displayRow}>
          <View style={[styles.iconContainer, { backgroundColor: '#4CAF50' + '15' }]}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          </View>
          <View style={styles.displayContent}>
            <Text style={[styles.displayLabel, { color: isDark ? '#A0B4C5' : '#666666' }]}>
              Completed Appointment
            </Text>
            <Text style={[styles.displayValue, { color: Colors[colorScheme].text }]}>
              {formatDisplayDate(formDate)} at {formatDisplayTime(formTime)}
            </Text>
          </View>
        </View>  
      </View>
    );
  }

  if (isNewAppointment) {
    return (
      <View style={styles.newAppointmentSection}>
        {/* Fixed Date Display */}
        <View style={styles.fixedDateSection}>
          <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Date</Text>
          <View style={[
            styles.fixedDateCard,
            { 
              backgroundColor: isDark ? '#132F4C' : '#F8FAFC',
              borderColor: isDark ? '#1E3A5F' : '#E0E0E0',
            }
          ]}>
            <View style={[styles.iconContainer, { backgroundColor: Colors[colorScheme].tint + '15' }]}>
              <Ionicons name="calendar" size={20} color={Colors[colorScheme].tint} />
            </View>
            <View style={styles.dateTimeContent}>
              <Text style={[styles.dateTimeLabel, { color: isDark ? '#A0B4C5' : '#666666' }]}>
                Selected Date
              </Text>
              <Text style={[styles.dateTimeValue, { color: Colors[colorScheme].text }]}>
                {formatDisplayDate(formDate)}
              </Text>
            </View>
            <Ionicons name="lock-closed" size={16} color={isDark ? '#A0B4C5' : '#CCCCCC'} />
          </View>
        </View>

        {/* Time Picker */}
        <View style={styles.timePickerSection}>
          <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Time</Text>
          <TouchableOpacity 
            style={[
              styles.dateTimeCard,
              { 
                backgroundColor: isDark ? '#1E3A5F' : '#FFFFFF',
                borderColor: isDark ? '#2E4A6F' : '#E8EDF5',
                shadowColor: isDark ? '#000' : '#000',
              }
            ]}
            onPress={onTimePress}
            disabled={loading}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: Colors[colorScheme].tint + '15' }]}>
              <Ionicons name="time" size={20} color={Colors[colorScheme].tint} />
            </View>
            <View style={styles.dateTimeContent}>
              <Text style={[styles.dateTimeLabel, { color: isDark ? '#A0B4C5' : '#666666' }]}>
                Select Time
              </Text>
              <Text style={[styles.dateTimeValue, { color: Colors[colorScheme].text }]}>
                {formatDisplayTime(formTime)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={isDark ? '#A0B4C5' : '#CCCCCC'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Edit appointment - both date and time editable
  return (
    <View style={styles.dateTimeRow}>
      {/* Date */}
      <View style={styles.dateTimeSection}>
        <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Date</Text>
        <TouchableOpacity 
          style={[
            styles.dateTimeCard,
            { 
              backgroundColor: isDark ? '#1E3A5F' : '#FFFFFF',
              borderColor: isDark ? '#2E4A6F' : '#E8EDF5',
              shadowColor: isDark ? '#000' : '#000',
            }
          ]}
          onPress={onDatePress}
          disabled={loading}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: Colors[colorScheme].tint + '15' }]}>
            <Ionicons name="calendar" size={20} color={Colors[colorScheme].tint} />
          </View>
          <View style={styles.dateTimeContent}>
            <Text style={[styles.dateTimeLabel, { color: isDark ? '#A0B4C5' : '#666666' }]}>
              Reschedule Date
            </Text>
            <Text style={[styles.dateTimeValue, { color: Colors[colorScheme].text }]}>
              {formatDisplayDate(formDate)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={isDark ? '#A0B4C5' : '#CCCCCC'} />
        </TouchableOpacity>
      </View>

      {/* Time */}
      <View style={styles.dateTimeSection}>
        <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Time</Text>
        <TouchableOpacity 
          style={[
            styles.dateTimeCard,
            { 
              backgroundColor: isDark ? '#1E3A5F' : '#FFFFFF',
              borderColor: isDark ? '#2E4A6F' : '#E8EDF5',
              shadowColor: isDark ? '#000' : '#000',
            }
          ]}
          onPress={onTimePress}
          disabled={loading}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: Colors[colorScheme].tint + '15' }]}>
            <Ionicons name="time" size={20} color={Colors[colorScheme].tint} />
          </View>
          <View style={styles.dateTimeContent}>
            <Text style={[styles.dateTimeLabel, { color: isDark ? '#A0B4C5' : '#666666' }]}>
              Reschedule Time
            </Text>
            <Text style={[styles.dateTimeValue, { color: Colors[colorScheme].text }]}>
              {formatDisplayTime(formTime)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={isDark ? '#A0B4C5' : '#CCCCCC'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}