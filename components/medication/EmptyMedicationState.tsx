import React from 'react';
import { StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH > 768;

export default function EmptyMedicationState() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.emptyContainer}>
      <View style={[
        styles.emptyIconContainer,
        { backgroundColor: isDark ? '#1E3A5F' : '#e8f5e8' }
      ]}>
        <Ionicons 
          name="checkmark-circle" 
          size={isTablet ? 64 : 48} 
          color="#4CAF50"
        />
      </View>
      <Text style={[
        styles.emptyText, 
        { 
          color: isDark ? '#A0B4C5' : '#757575',
          fontSize: isTablet ? 18 : 14,
        }
      ]}>
        All caught up! No medications scheduled for today.
      </Text>
      <Text style={[
        styles.emptySubtext, 
        { 
          color: isDark ? '#708090' : '#999999',
          fontSize: isTablet ? 14 : 12,
        }
      ]}>
        Check back tomorrow or add a new medication.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isTablet ? 40 : 20,
  },
  emptyIconContainer: {
    padding: isTablet ? 24 : 16,
    borderRadius: isTablet ? 32 : 24,
    marginBottom: isTablet ? 20 : 12,
  },
  emptyText: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});