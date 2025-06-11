import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

export default function CalendarHeader() {
  const colorScheme = useColorScheme();
  
  const handleSyncPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Handle calendar sync functionality
  };
  
  return (
    <View style={[styles.header, { backgroundColor: Colors[colorScheme].background }]}>
      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <Text style={[styles.headerSubtitle, { color: Colors[colorScheme === 'dark' ? 'dark' : 'light'].tabIconDefault }]}>
          Manage your appointments
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: Colors[colorScheme].tint + '20' }]}
          onPress={handleSyncPress}
        >
          <Ionicons name="sync-outline" size={20} color={Colors[colorScheme].tint} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  filterButton: {
    padding: 8,
  },
});