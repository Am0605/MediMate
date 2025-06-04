import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

// Import health-focused profile components
import HealthHeader from '@/components/profile/HealthHeader';
import HealthPersonalInfo from '@/components/profile/HealthPersonalInfo';
import HealthOverview from '@/components/profile/HealthOverview';
import HealthEntries from '@/components/profile/HealthEntries';

// Mock data hook
import { useHealthProfileData } from '@/hooks/useHealthProfileData';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);
  const { healthProfile, healthStats, healthEntries, fetchHealthProfile } = useHealthProfileData();

  // Pull to refresh functionality
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHealthProfile().finally(() => {
      setRefreshing(false);
    });
  }, [fetchHealthProfile]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <HealthHeader />
        
        {/* Personal Info Section */}
        <HealthPersonalInfo healthProfile={healthProfile} />
        <HealthOverview healthStats={healthStats} />
        <HealthEntries entries={healthEntries} />
        
        {/* Bottom padding */}
        <View style={{ height: 100 }} />
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
