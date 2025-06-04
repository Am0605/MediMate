import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function MedicationHeader() {
  const colorScheme = useColorScheme();
  
  return (
    <View style={[styles.header, { backgroundColor: Colors[colorScheme].background }]}>
      <View>
        <Text style={styles.headerTitle}>My Medications</Text>
        <Text style={[styles.headerSubtitle, { color: Colors[colorScheme === 'dark' ? 'dark' : 'light'].tabIconDefault }]}>
          Track and manage your medications
        </Text>
      </View>
      
      <TouchableOpacity style={styles.filterButton}>
        <Ionicons name="filter" size={22} color={Colors[colorScheme].text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 5,
  },
  filterButton: {
    padding: 8,
  },
});