import React from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { HealthStats } from '@/types/healthProfile';

type HealthOverviewProps = {
  healthStats: HealthStats;
};

export default function HealthOverview({ healthStats }: HealthOverviewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const stats = [
    {
      icon: 'medical',
      label: 'Active Medications',
      value: healthStats.totalMedications,
      color: '#4A90E2',
      subtitle: 'Currently taking',
    },
    {
      icon: 'trending-up',
      label: 'Adherence Rate',
      value: `${healthStats.adherenceRate}%`,
      color: healthStats.adherenceRate >= 80 ? '#4CAF50' : healthStats.adherenceRate >= 60 ? '#FFC107' : '#F44336',
      subtitle: 'This month',
    },
    {
      icon: 'calendar',
      label: 'Next Appointment',
      value: healthStats.nextAppointment || 'None scheduled',
      color: '#50E3C2',
      subtitle: 'Upcoming',
    },
    {
      icon: 'heart',
      label: 'Health Score',
      value: `${healthStats.healthScore}/100`,
      color: '#E91E63',
      subtitle: 'Overall wellness',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Health Overview</Text>
      
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={[styles.statCard, { backgroundColor: isDark ? '#0A1929' : '#FFFFFF' }]}>
            <View style={styles.cardContent}>
              <View style={[styles.statIconContainer, { backgroundColor: stat.color + '20' }]}>
                <Ionicons name={stat.icon as any} size={28} color={stat.color} />
              </View>
              <View style={styles.statContent}>
                <Text style={[styles.statLabel, { color: isDark ? '#A0B4C5' : '#666666' }]}>
                  {stat.label}
                </Text>
                <Text style={[styles.statValue, { color: Colors[colorScheme].text }]}>
                  {stat.value}
                </Text>
                <Text style={[styles.statSubtitle, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
                  {stat.subtitle}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Recent Activity */}
      <View style={styles.activitySection}>
        <Text style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>
          Recent Activity
        </Text>
        
        <View style={styles.activityItem}>
          <View style={[styles.activityDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={[styles.activityText, { color: Colors[colorScheme].text }]}>
            Medication taken on time
          </Text>
          <Text style={[styles.activityTime, { color: isDark ? '#A0B4C5' : '#666666' }]}>
            2h ago
          </Text>
        </View>
        
        <View style={styles.activityItem}>
          <View style={[styles.activityDot, { backgroundColor: '#2196F3' }]} />
          <Text style={[styles.activityText, { color: Colors[colorScheme].text }]}>
            Voice log recorded
          </Text>
          <Text style={[styles.activityTime, { color: isDark ? '#A0B4C5' : '#666666' }]}>
            1d ago
          </Text>
        </View>
        
        <View style={styles.activityItem}>
          <View style={[styles.activityDot, { backgroundColor: '#FF9800' }]} />
          <Text style={[styles.activityText, { color: Colors[colorScheme].text }]}>
            Health document uploaded
          </Text>
          <Text style={[styles.activityTime, { color: isDark ? '#A0B4C5' : '#666666' }]}>
            3d ago
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    aspectRatio: 1,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  activitySection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
  },
  activityTime: {
    fontSize: 12,
  },
});