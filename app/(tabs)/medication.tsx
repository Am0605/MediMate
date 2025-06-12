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

// Import data hook
import { useMedicationData } from '@/hooks/useMedicationData';

export default function MedicationScreen() {
  const colorScheme = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);
  const { 
    medications, 
    reminders, 
    adherenceRate,
    statsData,
    fetchMedications, 
    loading, 
    addMedication,
    markMedicationTaken,
    error 
  } = useMedicationData();

  // Pull to refresh functionality
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMedications().finally(() => {
      setRefreshing(false);
    });
  }, [fetchMedications]);

  // Handle marking medication as taken
  const handleMarkTaken = useCallback(async (logId: string, scheduledTime: string) => {
    try {
      await markMedicationTaken(logId, scheduledTime);
    } catch (error) {
      console.error('Error marking medication as taken:', error);
    }
  }, [markMedicationTaken]);

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={Colors[colorScheme].tint}
            colors={[Colors[colorScheme].tint]}
          />
        }
      >
        <MedicationHeader 
          onAddMedication={addMedication}
          loading={loading}
        />
        <MedicationStats 
          adherenceRate={adherenceRate} 
          statsData={statsData}
        />
        <MedicationReminders 
          reminders={reminders} 
          onMarkTaken={handleMarkTaken}
        />
        <MedicationList medications={medications} />
      </ScrollView>
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
    paddingBottom: 100,
  },
});