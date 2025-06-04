import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

// Import medication components
import MedicationHeader from '@/components/medication/MedicationHeader';
import MedicationStats from '@/components/medication/MedicationStats';
import MedicationList from '@/components/medication/MedicationList';
import MedicationReminders from '@/components/medication/MedicationReminders';
import AddMedicationButton from '@/components/medication/AddMedicationButton';

// Mock data import (replace with actual data service later)
import { useMedicationData } from '@/hooks/useMedicationData';

export default function MedicationScreen() {
  const colorScheme = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);
  const { medications, reminders, adherenceRate, fetchMedications } = useMedicationData();

  // Pull to refresh functionality
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMedications().finally(() => {
      setRefreshing(false);
    });
  }, [fetchMedications]);

  return (
    <View style={styles.container}>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <MedicationHeader />
        <MedicationStats adherenceRate={adherenceRate} />
        <MedicationReminders reminders={reminders} />
        <MedicationList medications={medications} />
      </ScrollView>
      
      <AddMedicationButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 80, 
  },
});