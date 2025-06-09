import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { styles } from './AppointmentModal.styles';

type ReadOnlyViewProps = {
  formTitle: string;
  formLocation: string;
  formDoctorName: string;
  formNotes: string;
};

export default function ReadOnlyView({
  formTitle,
  formLocation,
  formDoctorName,
  formNotes
}: ReadOnlyViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.readOnlyForm}>
      <View style={styles.readOnlyField}>
        <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Title</Text>
        <View style={[styles.readOnlyValue, { backgroundColor: isDark ? '#132F4C' : '#F8FAFC' }]}>
          <Text style={[styles.readOnlyText, { color: Colors[colorScheme].text }]}>
            {formTitle}
          </Text>
        </View>
      </View>

      {formLocation ? (
        <View style={styles.readOnlyField}>
          <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Location</Text>
          <View style={[styles.readOnlyValue, { backgroundColor: isDark ? '#132F4C' : '#F8FAFC' }]}>
            <Ionicons name="location-outline" size={16} color={isDark ? '#A0B4C5' : '#666666'} />
            <Text style={[styles.readOnlyText, { color: Colors[colorScheme].text, marginLeft: 8 }]}>
              {formLocation}
            </Text>
          </View>
        </View>
      ) : null}

      {formDoctorName ? (
        <View style={styles.readOnlyField}>
          <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Doctor</Text>
          <View style={[styles.readOnlyValue, { backgroundColor: isDark ? '#132F4C' : '#F8FAFC' }]}>
            <Ionicons name="person-outline" size={16} color={isDark ? '#A0B4C5' : '#666666'} />
            <Text style={[styles.readOnlyText, { color: Colors[colorScheme].text, marginLeft: 8 }]}>
              Dr. {formDoctorName}
            </Text>
          </View>
        </View>
      ) : null}

      {formNotes ? (
        <View style={styles.readOnlyField}>
          <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>Notes</Text>
          <View style={[styles.readOnlyValue, { backgroundColor: isDark ? '#132F4C' : '#F8FAFC' }]}>
            <Text style={[styles.readOnlyText, { color: Colors[colorScheme].text }]}>
              {formNotes}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}