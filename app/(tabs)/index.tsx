import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

// Import home components
import HomeHeader from '@/components/home/HomeHeader';
import QuickAccessSection from '@/components/home/QuickAccessSection';
import HealthNewsSection from '@/components/home/HealthNewsSection';
import DailyTipCard from '@/components/home/DailyTipCard';

// Data hook
import { useHomeData } from '@/hooks/useHomeData';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);
  const { healthNews, userInfo, loading, fetchHomeData } = useHomeData();

  // Pull to refresh functionality
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHomeData().finally(() => {
      setRefreshing(false);
    });
  }, [fetchHomeData]);

  return (
    <View style={styles.container}>

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
        <HomeHeader userInfo={userInfo} />
        
        <DailyTipCard />
        {/* Quick Access Section */}
        <QuickAccessSection />
        <HealthNewsSection healthNews={healthNews} loading={loading} />
      
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
