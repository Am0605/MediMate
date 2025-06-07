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
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].card }]}>
      <Text style={styles.title}>Health Overview</Text>
      
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statItem}>
            <View style={[styles.statIconContainer, { backgroundColor: stat.color + '20' }]}>
              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: Colors[colorScheme].text }]}>
              {stat.value}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#A0B4C5' : '#666666' }]}>
              {stat.label}
            </Text>
            <Text style={[styles.statSubtitle, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
              {stat.subtitle}
            </Text>
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
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  statSubtitle: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
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