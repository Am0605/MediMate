import React from 'react';
import { StyleSheet, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { HealthStats } from '@/types/healthProfile';

type HealthOverviewProps = {
  healthStats: HealthStats;
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive breakpoints
const isTablet = screenWidth >= 768;
const isLargePhone = screenWidth >= 414;
const isSmallPhone = screenWidth < 350;

export default function HealthOverview({ healthStats }: HealthOverviewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Calculate responsive dimensions
  const containerPadding = isTablet ? 24 : isLargePhone ? 20 : 16;
  const cardGap = isTablet ? 16 : isLargePhone ? 14 : 12;
  const cardWidth = (screenWidth - (containerPadding * 2) - cardGap) / 2;
  
  // Responsive text sizes
  const textSizes = {
    title: isTablet ? 24 : isLargePhone ? 20 : 18,
    sectionTitle: isTablet ? 18 : isLargePhone ? 16 : 15,
    statValue: isTablet ? 28 : isLargePhone ? 24 : 22,
    statLabel: isTablet ? 16 : isLargePhone ? 14 : 13,
    statSubtitle: isTablet ? 14 : isLargePhone ? 12 : 11,
    activityText: isTablet ? 16 : isLargePhone ? 14 : 13,
    activityTime: isTablet ? 14 : isLargePhone ? 12 : 11,
  };
  
  // Responsive icon and element sizes
  const elementSizes = {
    statIcon: isTablet ? 32 : isLargePhone ? 28 : 26,
    iconContainer: isTablet ? 64 : isLargePhone ? 56 : 52,
    activityDot: isTablet ? 10 : 8,
    cardPadding: isTablet ? 20 : isLargePhone ? 16 : 14,
    cardRadius: isTablet ? 16 : 12,
  };

  const styles = StyleSheet.create({
    container: {
      margin: containerPadding,
    },
    title: {
      fontSize: textSizes.title,
      fontWeight: 'bold',
      marginBottom: isTablet ? 24 : isLargePhone ? 20 : 16,
      color: Colors[colorScheme].text,
    },
    statsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: isTablet ? 12 : 6,
    },
    statCard: {
      width: cardWidth,
      minHeight: isTablet ? 180 : isLargePhone ? 160 : 140,
      padding: elementSizes.cardPadding,
      borderRadius: elementSizes.cardRadius,
      marginBottom: cardGap,
      backgroundColor: isDark ? '#0A1929' : '#FFFFFF',
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? '#1E3A5F' : 'transparent',
      // Platform-specific card shadows
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { 
            width: 0, 
            height: isTablet ? 4 : 2 
          },
          shadowOpacity: isTablet ? 0.08 : 0.05,
          shadowRadius: isTablet ? 6 : 3,
        },
        android: {
          elevation: isTablet ? 4 : 2,
          borderWidth: isDark ? 1 : 0.5,
          borderColor: isDark ? '#1E3A5F' : 'rgba(0,0,0,0.06)',
        },
      }),
    },
    cardContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statIconContainer: {
      width: elementSizes.iconContainer,
      height: elementSizes.iconContainer,
      borderRadius: elementSizes.iconContainer / 2,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: isTablet ? 20 : isLargePhone ? 16 : 12,
      // borderWidth: Platform.OS === 'android' ? 1 : 0.5,
      // borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    },
    statContent: {
      alignItems: 'center',
      flex: 1,
    },
    statLabel: {
      fontSize: textSizes.statLabel,
      fontWeight: '600',
      textAlign: 'center',
      color: isDark ? '#A0B4C5' : '#666666',
      marginBottom: isTablet ? 8 : 6,
      lineHeight: textSizes.statLabel * 1.2,
    },
    statValue: {
      fontSize: textSizes.statValue,
      fontWeight: 'bold',
      textAlign: 'center',
      color: Colors[colorScheme].text,
      marginBottom: isTablet ? 8 : 6,
      lineHeight: textSizes.statValue * 1.1,
    },
    statSubtitle: {
      fontSize: textSizes.statSubtitle,
      textAlign: 'center',
      color: isDark ? '#6B7280' : '#9CA3AF',
      fontWeight: '500',
      lineHeight: textSizes.statSubtitle * 1.2,
    },
    activitySection: {
      marginTop: isTablet ? 32 : 24,
      paddingTop: isTablet ? 24 : 20,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#1E3A5F' : '#E5E7EB',
    },
    sectionTitle: {
      fontSize: textSizes.sectionTitle,
      fontWeight: 'bold',
      marginBottom: isTablet ? 20 : 16,
      color: Colors[colorScheme].text,
    },
    activityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: isTablet ? 12 : 10,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1E3A5F20' : '#E5E7EB40',
    },
    lastActivityItem: {
      borderBottomWidth: 0,
    },
    activityDot: {
      width: elementSizes.activityDot,
      height: elementSizes.activityDot,
      borderRadius: elementSizes.activityDot / 2,
      marginRight: isTablet ? 16 : 12,
      // No shadows for activity dots - just clean circles
    },
    activityContent: {
      flex: 1,
      marginRight: isTablet ? 12 : 8,
    },
    activityText: {
      fontSize: textSizes.activityText,
      fontWeight: '500',
      color: Colors[colorScheme].text,
      lineHeight: textSizes.activityText * 1.3,
    },
    activityTime: {
      fontSize: textSizes.activityTime,
      color: isDark ? '#A0B4C5' : '#6B7280',
      fontWeight: '500',
      minWidth: isTablet ? 60 : 50,
      textAlign: 'right',
    },
  });

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
      value: isSmallPhone ? 'None' : (healthStats.nextAppointment || 'None scheduled'),
      fullValue: healthStats.nextAppointment || 'None scheduled',
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

  const activities = [
    {
      text: 'Medication taken on time',
      time: '2h ago',
      color: '#4CAF50',
    },
    {
      text: 'Voice log recorded',
      time: '1d ago',
      color: '#2196F3',
    },
    {
      text: isSmallPhone ? 'Document uploaded' : 'Health document uploaded',
      time: '3d ago',
      color: '#FF9800',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isSmallPhone ? 'Health Overview' : 'Health Overview'}
      </Text>
      
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View
            key={index}
            style={styles.statCard}
          >
            <View style={styles.cardContent}>
              <View style={[styles.statIconContainer, { backgroundColor: stat.color + '20' }]}>
                <Ionicons name={stat.icon as any} size={elementSizes.statIcon} color={stat.color} />
              </View>
              <View style={styles.statContent}>
                <Text 
                  style={styles.statLabel}
                  numberOfLines={isSmallPhone ? 2 : 1}
                  adjustsFontSizeToFit={isSmallPhone}
                  minimumFontScale={0.8}
                >
                  {stat.label}
                </Text>
                <Text 
                  style={styles.statValue}
                  numberOfLines={1}
                  adjustsFontSizeToFit={true}
                  minimumFontScale={0.7}
                >
                  {stat.value}
                </Text>
                <Text 
                  style={styles.statSubtitle}
                  numberOfLines={1}
                >
                  {stat.subtitle}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Recent Activity */}
      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>
          Recent Activity
        </Text>
        
        {activities.map((activity, index) => (
          <View
            key={index}
            style={[
              styles.activityItem,
              index === activities.length - 1 && styles.lastActivityItem
            ]}
          >
            <View style={[styles.activityDot, { backgroundColor: activity.color }]} />
            <View style={styles.activityContent}>
              <Text 
                style={styles.activityText}
                numberOfLines={isSmallPhone ? 2 : 1}
              >
                {activity.text}
              </Text>
            </View>
            <Text style={styles.activityTime}>
              {activity.time}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}