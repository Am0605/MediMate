import React from 'react';
import { View, TextInput } from 'react-native';
import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { styles } from './AppointmentModal.styles';

type AppointmentFormProps = {
  formTitle: string;
  setFormTitle: (value: string) => void;
  formLocation: string;
  setFormLocation: (value: string) => void;
  formDoctorName: string;
  setFormDoctorName: (value: string) => void;
  formNotes: string;
  setFormNotes: (value: string) => void;
  loading: boolean;
};

export default function AppointmentForm({
  formTitle,
  setFormTitle,
  formLocation,
  setFormLocation,
  formDoctorName,
  setFormDoctorName,
  formNotes,
  setFormNotes,
  loading
}: AppointmentFormProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View>
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
        editable={!loading}
      />

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
        editable={!loading}
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
        editable={!loading}
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
        editable={!loading}
      />
    </View>
  );
}