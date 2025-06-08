import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useHealthProfileData } from '@/hooks/useHealthProfileData';
import HealthPersonalInfo from '@/components/health-profile/HealthPersonalInfo';
import HealthOverview from '@/components/health-profile/HealthOverview';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorDisplay from '@/components/forms/ErrorDisplay';
import HealthHeader from '@/components/health-profile/HealthHeader';
import HealthEntries from '@/components/health-profile/HealthEntries';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);
  const { 
    healthProfile, 
    healthStats, 
    healthEntries, 
    medications,
    loading, 
    error, 
    fetchHealthProfile 
  } = useHealthProfileData();

  // Pull to refresh functionality
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHealthProfile().finally(() => {
      setRefreshing(false);
    });
  }, [fetchHealthProfile]);

  if (loading && !healthProfile) {
    return <LoadingScreen message="Loading your health profile..." />;
  }

  if (error && !healthProfile) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
        <ErrorDisplay error={error} />
      </View>
    );
  }

  if (!healthProfile || !healthStats) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
        <ErrorDisplay error="Health profile not found. Please complete your profile setup." />
      </View>
    );
  }

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
        showsVerticalScrollIndicator={false}
      >
        {error && <ErrorDisplay error={error} />}

        <HealthHeader />
        <HealthPersonalInfo 
          healthProfile={healthProfile}
          onEdit={() => {
            // Navigate to edit profile or refresh data
            fetchHealthProfile();
          }}
        />
        <HealthOverview healthStats={healthStats} />
        <HealthEntries 
          entries={healthEntries} 
        />
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
    paddingBottom: 30,
  },
});
