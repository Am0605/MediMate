import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

type MedicationStatsProps = {
  adherenceRate: number;
};

export default function MedicationStats({ adherenceRate }: MedicationStatsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Function to determine color based on adherence rate
  const getAdherenceColor = (rate: number) => {
    if (rate >= 80) return '#4CAF50';
    if (rate >= 60) return '#FFC107';
    return '#F44336';
  };

  const adherenceColor = getAdherenceColor(adherenceRate);

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].card }]}>
      <Text style={styles.title}>Medication Adherence</Text>
      
      <View style={styles.statsRow}>
        <View style={styles.adherenceContainer}>
          <View style={styles.rateContainer}>
            <Text style={[styles.rateText, { color: adherenceColor }]}>
              {adherenceRate}%
            </Text>
            <View style={[styles.rateIndicator, { backgroundColor: adherenceColor }]} />
          </View>
          <Text style={[styles.rateLabel, { color: isDark ? '#A0B4C5' : '#666666' }]}>
            This Week
          </Text>
        </View>
        
        <View style={[styles.divider, { backgroundColor: isDark ? '#1E3A5F' : '#f0f0f0' }]} />
        
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={22} color={Colors[colorScheme].tint} />
            <Text style={styles.infoText}>On Time</Text>
            <Text style={styles.infoValue}>15</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="alert-circle" size={22} color="#FFC107" />
            <Text style={styles.infoText}>Late</Text>
            <Text style={styles.infoValue}>3</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="close-circle" size={22} color="#F44336" />
            <Text style={styles.infoText}>Missed</Text>
            <Text style={styles.infoValue}>2</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adherenceContainer: {
    alignItems: 'center',
    width: '30%',
  },
  rateContainer: {
    alignItems: 'center',
  },
  rateText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  rateIndicator: {
    height: 4,
    width: 40,
    borderRadius: 2,
    marginTop: 4,
  },
  rateLabel: {
    fontSize: 12,
    marginTop: 8,
  },
  divider: {
    width: 1,
    height: 60,
    marginHorizontal: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 1,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    marginTop: 4,
  },
  infoValue: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 2,
  },
});