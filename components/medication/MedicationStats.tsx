import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

type MedicationStatsProps = {
  adherenceRate: number;
  statsData: {
    onTime: number;
    late: number;
    missed: number;
    total: number;
  };
};

export default function MedicationStats({ adherenceRate, statsData }: MedicationStatsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Add debug logging to see what's being passed
  console.log('📊 MedicationStats received:', { adherenceRate, statsData });
  
  // Function to determine color based on adherence rate
  const getAdherenceColor = (rate: number) => {
    if (rate >= 80) return '#4CAF50';
    if (rate >= 60) return '#FFC107';
    return '#F44336';
  };

  // Get current week range for display
  const getCurrentWeekRange = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + mondayOffset);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const adherenceColor = getAdherenceColor(adherenceRate);

  // Add fallback for undefined statsData
  const safeStatsData = statsData || { onTime: 0, late: 0, missed: 0, total: 0 };
  const safeAdherenceRate = adherenceRate || 0;

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].card }]}>
      <Text style={[styles.title, { color: Colors[colorScheme].text }]}>
        Medication Adherence
      </Text>
      
      <View style={styles.statsRow}>
        <View style={styles.adherenceContainer}>
          <View style={styles.rateContainer}>
            <Text style={[styles.rateText, { color: adherenceColor }]}>
              {safeAdherenceRate}%
            </Text>
            <View style={[styles.rateIndicator, { backgroundColor: adherenceColor }]} />
          </View>
          <Text style={[styles.rateLabel, { color: isDark ? '#A0B4C5' : '#666666' }]}>
            This Week
          </Text>
          <Text style={[styles.weekRange, { color: isDark ? '#708090' : '#999999' }]}>
            {getCurrentWeekRange()}
          </Text>
        </View>
        
        <View style={[styles.divider, { backgroundColor: isDark ? '#1E3A5F' : '#f0f0f0' }]} />
        
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
            <Text style={[styles.infoText, { color: isDark ? '#A0B4C5' : '#666666' }]}>
              On Time
            </Text>
            <Text style={[styles.infoValue, { color: Colors[colorScheme].text }]}>
              {safeStatsData.onTime}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="alert-circle" size={22} color="#FFC107" />
            <Text style={[styles.infoText, { color: isDark ? '#A0B4C5' : '#666666' }]}>
              Late
            </Text>
            <Text style={[styles.infoValue, { color: Colors[colorScheme].text }]}>
              {safeStatsData.late}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="close-circle" size={22} color="#F44336" />
            <Text style={[styles.infoText, { color: isDark ? '#A0B4C5' : '#666666' }]}>
              Missed
            </Text>
            <Text style={[styles.infoValue, { color: Colors[colorScheme].text }]}>
              {safeStatsData.missed}
            </Text>
          </View>
        </View>
      </View>
      
      {safeStatsData.total > 0 && (
        <Text style={[styles.totalText, { color: isDark ? '#A0B4C5' : '#666666' }]}>
          Total doses this week: {safeStatsData.total}
        </Text>
      )}
      
      {/* Debug info - remove in production */}
      {__DEV__ && (
        <View style={{ marginTop: 8, padding: 8, backgroundColor: isDark ? '#1E3A5F' : '#f0f0f0', borderRadius: 8 }}>
          <Text style={{ fontSize: 10, color: isDark ? '#A0B4C5' : '#333' }}>
            Debug: Rate={safeAdherenceRate}%, OnTime={safeStatsData.onTime}, Late={safeStatsData.late}, Missed={safeStatsData.missed}, Total={safeStatsData.total}
          </Text>
          <Text style={{ fontSize: 10, color: isDark ? '#A0B4C5' : '#333', marginTop: 2 }}>
            Week: {getCurrentWeekRange()}
          </Text>
        </View>
      )}
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
  weekRange: {
    fontSize: 10,
    marginTop: 2,
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
  totalText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});