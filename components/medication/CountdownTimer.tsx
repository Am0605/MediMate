import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH > 768;

type CountdownTimerProps = {
  hoursRemaining: number;
  isVisible: boolean;
};

export default function CountdownTimer({ hoursRemaining, isVisible }: CountdownTimerProps) {
  if (!isVisible) return null;

  return (
    <View style={[
      styles.countdownContainer,
      { backgroundColor: '#FF8C00' + '20' }
    ]}>
      <Ionicons name="timer" size={14} color="#FF8C00" />
      <Text style={[styles.countdownText, { color: '#FF8C00' }]}>
        {Math.ceil(hoursRemaining)}h left
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  countdownContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 3,
  },
  countdownText: {
    fontSize: isTablet ? 12 : 10,
    fontWeight: '500',
    marginLeft: 4,
  },
});