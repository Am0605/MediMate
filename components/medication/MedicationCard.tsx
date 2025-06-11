import React, { useState, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Animated, Vibration, Dimensions } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { ReminderItem } from '@/types/medication';
import * as Haptics from 'expo-haptics';
import MedicationCardContent from './MedicationCardContent';
import CountdownTimer from './CountdownTimer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH > 768;

type MedicationCardProps = {
  reminder: ReminderItem;
  onMarkTaken?: (logId: string, scheduledTime: string) => void;
};

export default function MedicationCard({ 
  reminder, 
  onMarkTaken 
}: MedicationCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Animation states
  const [isPressed, setIsPressed] = useState(false);
  const fillAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const HOLD_DURATION = 2000; // 2 seconds
  const cardPadding = isTablet ? 20 : 12;

  // Determine status and colors
  const now = new Date();
  const scheduledTime = new Date(reminder.time);
  const hoursSinceScheduled = (now.getTime() - scheduledTime.getTime()) / (1000 * 60 * 60);
  
  const isTaken = reminder.status === 'taken';
  const isLate = reminder.status === 'late';
  const isMissed = reminder.status === 'missed';
  const isPending = reminder.status === 'pending';
  const isOverdue = scheduledTime < now && isPending;
  const isAutoMissed = hoursSinceScheduled > 4 && isPending;
  
  // Fixed canTake logic: Allow both pending and overdue, but not auto-missed
  const canTake = (isPending || isOverdue) && !isAutoMissed && reminder.logId && !isTaken && !isLate && !isMissed;

  // Status-based styling
  const getStatusInfo = () => {
    if (isTaken) return { 
      text: '✓ Taken on time', 
      color: '#4CAF50', 
      icon: 'checkmark-circle',
      fillColor: '#4CAF50',
      bgColor: isDark ? '#1A1A1A' : '#FFFFFF'
    };
    if (isLate) return { 
      text: '⚠ Taken late', 
      color: '#FFC107', 
      icon: 'checkmark-circle',
      fillColor: '#FFC107',
      bgColor: isDark ? '#1A1A1A' : '#FFFFFF'
    };
    if (isMissed || isAutoMissed) return { 
      text: '✗ Missed', 
      color: '#F44336', 
      icon: 'close-circle',
      fillColor: '#F44336',
      bgColor: isDark ? '#1A1A1A' : '#FFFFFF'
    };
    if (isOverdue) return { 
      text: 'Overdue - Hold to take', 
      color: '#FF8C00', 
      icon: 'alert-circle',
      fillColor: '#FF8C00',
      bgColor: isDark ? '#1A1A1A' : '#FFFFFF'
    };
    return { 
      text: canTake ? 'Hold to take' : 'Scheduled', 
      color: Colors[colorScheme].text, 
      icon: 'time-outline',
      fillColor: '#4CAF50',
      bgColor: isDark ? '#1A1A1A' : '#FFFFFF'
    };
  };

  const statusInfo = getStatusInfo();

  const handleTakeDose = () => {
    console.log('🏥 Taking dose:', reminder.medicationName);
    if (reminder.logId && reminder.scheduledTime && onMarkTaken) {
      onMarkTaken(reminder.logId, reminder.scheduledTime);
    }
  };

  const startFillAnimation = () => {
    console.log('🎯 Starting fill animation for:', reminder.medicationName, 'canTake:', canTake);
    if (!canTake) {
      console.log('❌ Cannot take medication:', { 
        canTake, 
        isPending, 
        isOverdue, 
        isAutoMissed, 
        isTaken, 
        isLate, 
        isMissed,
        logId: reminder.logId 
      });
      return;
    }
    
    setIsPressed(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.parallel([
      Animated.timing(fillAnim, {
        toValue: 1,
        duration: HOLD_DURATION,
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.02,
        duration: HOLD_DURATION,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      console.log('🎯 Animation finished:', finished);
      if (finished) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Vibration.vibrate([0, 100, 50, 100]);
        handleTakeDose();
      }
      resetAnimations();
    });
  };
  
  const cancelFillAnimation = () => {
    console.log('❌ Cancelling fill animation');
    resetAnimations();
  };
  
  const resetAnimations = () => {
    fillAnim.stopAnimation();
    scaleAnim.stopAnimation();
    
    Animated.parallel([
      Animated.timing(fillAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsPressed(false);
    });
  };

  // Change the fillWidth interpolation to use scaleX instead
  const fillScale = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  console.log('🔄 MedicationCard render:', {
    medicationName: reminder.medicationName,
    canTake,
    isPending,
    isOverdue,
    isAutoMissed,
    isTaken,
    isLate,
    isMissed,
    logId: reminder.logId,
    isPressed,
    status: reminder.status,
    hoursSinceScheduled: hoursSinceScheduled.toFixed(2)
  });

  return (
    <TouchableOpacity
      style={[
        styles.reminderCard, 
        { 
          borderStartColor: reminder.color || Colors[colorScheme].tint,
          borderStartWidth: isTablet ? 6 : 4,
          backgroundColor: statusInfo.bgColor,
          opacity: (isTaken || isLate || isMissed || isAutoMissed) ? 0.8 : 1,
          padding: cardPadding,
          borderStyle: 'solid',
          transform: [{ scale: scaleAnim }],
          borderWidth: 1,
          borderColor: isDark ? '#333' : '#E0E0E0',
        }
      ]}
      onPressIn={() => {
        console.log('👆 onPressIn triggered, canTake:', canTake);
        if (canTake) startFillAnimation();
      }}
      onPressOut={() => {
        console.log('👆 onPressOut triggered');
        if (canTake) cancelFillAnimation();
      }}
      onPress={() => {
        console.log('🎯 onPress triggered, canTake:', canTake);
        if (!canTake) {
          console.log('🚫 Card not pressable - medication already taken or missed');
        }
      }}
      disabled={!canTake} // Disable press for taken/missed medications
      activeOpacity={canTake ? 0.7 : 1}
    >
      
      {/* Full card fill animation */}
      <Animated.View
        style={[
          styles.fillOverlay,
          {
            transform: [{ scaleX: fillScale }],
            backgroundColor: isPressed ? statusInfo.fillColor + '40' : 'transparent',
          }
        ]}
        pointerEvents="none"
      />

      {/* Card content with proper z-index */}
      <Animated.View style={styles.contentContainer}>
        <MedicationCardContent
          time={reminder.time}
          medicationName={reminder.medicationName}
          dosage={reminder.dosage}
          instructions={reminder.instructions || 'No instructions'}
          statusInfo={statusInfo}
          isOverdue={isOverdue}
          isAutoMissed={isAutoMissed}
          isTaken={isTaken}
          isLate={isLate}
          isMissed={isMissed}
        />
        
        <CountdownTimer
          hoursRemaining={4 - hoursSinceScheduled}
          isVisible={isOverdue && !isAutoMissed && hoursSinceScheduled < 4}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  reminderCard: {
    position: 'relative',
    marginVertical: isTablet ? 8 : 6,
    borderRadius: isTablet ? 16 : 12,
    overflow: 'hidden',
    minHeight: isTablet ? 100 : 80,
  },
  leftBorderIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 3, // Above fill animation
    borderTopLeftRadius: isTablet ? 16 : 12,
    borderBottomLeftRadius: isTablet ? 16 : 12,
  },
  fillOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0, 
    bottom: 0, 
    zIndex: 1,
    borderRadius: isTablet ? 16 : 12,
    transformOrigin: 'left center', 
  },
  contentContainer: {
    position: 'relative',
    zIndex: 2,
    backgroundColor: 'transparent',
  },
});