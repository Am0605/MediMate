import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function FormSection({ title, children }: FormSectionProps) {
  const colorScheme = useColorScheme();

  return (
    <View style={[styles.section, { backgroundColor: Colors[colorScheme].card }]}>
      <Text style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});