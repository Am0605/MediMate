import React, { useState, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Alert, Animated, PanResponder, Dimensions, Vibration } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { ReminderItem } from '@/types/medication';
import * as Haptics from 'expo-haptics';
import MedicationCard from './MedicationCard';
import EmptyMedicationState from './EmptyMedicationState';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH > 768;

// Enhanced ReminderCard component with pressable card and fill animation
function ReminderCard({ 
  reminder, 
  onMarkTaken 
}: { 
  reminder: ReminderItem; 
  onMarkTaken?: (logId: string, scheduledTime: string) => void;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Animation states
  const [isPressed, setIsPressed] = useState(false);
  const fillAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressTextAnim = useRef(new Animated.Value(0)).current;
  
  const HOLD_DURATION = 2000; // 2 seconds
  
  // Responsive sizing
  const cardPadding = isTablet ? 20 : 12;
  const fontSize = {
    time: isTablet ? 20 : 16,
    name: isTablet ? 20 : 16,
    dosage: isTablet ? 16 : 14,
    status: isTablet ? 14 : 12,
  };
  
  // Format time to display
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
  const canTake = isPending && !isAutoMissed && reminder.logId;

  // Status-based styling with enhanced visuals
  const getStatusInfo = () => {
    if (isTaken) return { 
      text: '✓ Taken on time', 
      color: '#4CAF50', 
      icon: 'checkmark-circle',
      bgColor: '#4CAF50' + '20',
      fillColor: '#4CAF50'
    };
    if (isLate) return { 
      text: '⚠ Taken late', 
      color: '#FFC107', 
      icon: 'checkmark-circle',
      bgColor: '#FFC107' + '20',
      fillColor: '#FFC107'
    };
    if (isMissed || isAutoMissed) return { 
      text: '✗ Missed', 
      color: '#F44336', 
      icon: 'close-circle',
      bgColor: '#F44336' + '20',
      fillColor: '#F44336'
    };
    if (isOverdue) return { 
      text: 'Overdue', 
      color: '#FF8C00', 
      icon: 'alert-circle',
      bgColor: '#FF8C00' + '20',
      fillColor: '#FF8C00'
    };
    return { 
      text: 'Scheduled', 
      color: Colors[colorScheme].text, 
      icon: 'time-outline',
      bgColor: isDark ? '#1E3A5F' : '#F5F5F5',
      fillColor: '#4CAF50'
    };
  };

  const statusInfo = getStatusInfo();

  const handleTakeDose = () => {
    if (reminder.logId && reminder.scheduledTime && onMarkTaken) {
      onMarkTaken(reminder.logId, reminder.scheduledTime);
    }
  };

  const startFillAnimation = () => {
    if (!canTake) return;
    
    setIsPressed(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Start all animations
    Animated.parallel([
      // Fill animation from left to right
      Animated.timing(fillAnim, {
        toValue: 1,
        duration: HOLD_DURATION,
        useNativeDriver: false,
      }),
      // Scale animation
      Animated.timing(scaleAnim, {
        toValue: 1.02,
        duration: HOLD_DURATION,
        useNativeDriver: true,
      }),
      // Progress text fade in
      Animated.timing(progressTextAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        // Success! Medication taken
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Vibration.vibrate([0, 100, 50, 100]);
        handleTakeDose();
        resetAnimations();
      }
    });
  };
  
  const cancelFillAnimation = () => {
    resetAnimations();
  };
  
  const resetAnimations = () => {
    // Stop all animations
    fillAnim.stopAnimation();
    scaleAnim.stopAnimation();
    progressTextAnim.stopAnimation();
    
    // Reset values
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
      Animated.timing(progressTextAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsPressed(false);
    });
  };

  // Calculate fill width percentage
  const fillWidth = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const progressPercentage = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });

  return (
    <TouchableOpacity
      style={[
        styles.reminderCard, 
        { 
          borderLeftColor: reminder.color || Colors[colorScheme].tint,
          opacity: (isTaken || isLate || isMissed || isAutoMissed) ? 0.8 : 1,
          padding: cardPadding,
          borderLeftWidth: isTablet ? 6 : 4,
          overflow: 'hidden', // Important for fill animation
          transform: [{ scale: scaleAnim }],
        }
      ]}
      onPressIn={canTake ? startFillAnimation : undefined}
      onPressOut={canTake ? cancelFillAnimation : undefined}
      disabled={!canTake}
      activeOpacity={canTake ? 0.9 : 1}
    >
      {/* Background fill animation */}
      <Animated.View
        style={[
          styles.fillBackground,
          {
            width: fillWidth,
            backgroundColor: isPressed ? statusInfo.fillColor + '40' : 'transparent',
          }
        ]}
      />

      {/* Default background */}
      <View style={[
        styles.cardBackground,
        { backgroundColor: statusInfo.bgColor }
      ]} />

      {/* Card content */}
      <View style={styles.cardContent}>
        <View style={styles.reminderTimeContainer}>
          <Text style={[
            styles.reminderTime,
            { 
              color: (isOverdue || isAutoMissed) ? '#F44336' : Colors[colorScheme].text,
              fontSize: fontSize.time,
            }
          ]}>
            {formatTime(reminder.time)}
          </Text>
          <View style={[
            styles.statusIconContainer,
            { backgroundColor: statusInfo.color + '20' }
          ]}>
            <Ionicons 
              name={statusInfo.icon as any} 
              size={isTablet ? 20 : 16} 
              color={statusInfo.color} 
            />
          </View>
        </View>
        
        <View style={styles.reminderDetails}>
          <Text style={[
            styles.reminderName,
            { 
              textDecorationLine: (isTaken || isLate || isMissed || isAutoMissed) ? 'line-through' : 'none',
              color: Colors[colorScheme].text,
              fontSize: fontSize.name,
            }
          ]}>
            {reminder.medicationName}
          </Text>
          <Text style={[
            styles.reminderDosage, 
            { 
              color: isDark ? '#A0B4C5' : '#757575',
              fontSize: fontSize.dosage,
            }
          ]}>
            {reminder.dosage} • {reminder.instructions}
          </Text>
          <View style={styles.statusContainer}>
            <Text style={[
              styles.statusText, 
              { 
                color: statusInfo.color,
                fontSize: fontSize.status,
              }
            ]}>
              {statusInfo.text}
              {isAutoMissed && ' (auto-marked)'}
            </Text>
          </View>
        </View>

        {/* Progress indicator when taking */}
        {canTake && (
          <View style={styles.actionIndicator}>
            {isPressed ? (
              <Animated.View style={[
                styles.progressIndicator,
                { opacity: progressTextAnim }
              ]}>
                <Ionicons name="hand-left" size={isTablet ? 24 : 20} color="#4CAF50" />
                <Text style={[styles.progressText, { color: '#4CAF50' }]}>
                  <Animated.Text>
                    {progressPercentage.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    })}
                  </Animated.Text>
                </Text>
              </Animated.View>
            ) : (
              <View style={styles.takeHint}>
                <Ionicons name="hand-left" size={isTablet ? 20 : 16} color={Colors[colorScheme].tint} />
                <Text style={[styles.hintText, { color: Colors[colorScheme].tint }]}>
                  Hold to take
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
      
      {/* Enhanced Countdown */}
      {isOverdue && !isAutoMissed && hoursSinceScheduled < 4 && (
        <View style={[
          styles.countdownContainer,
          { backgroundColor: '#FF8C00' + '20' }
        ]}>
          <Ionicons name="timer" size={14} color="#FF8C00" />
          <Text style={[styles.countdownText, { color: '#FF8C00' }]}>
            {Math.ceil(4 - hoursSinceScheduled)}h left
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

type MedicationRemindersProps = {
  reminders: ReminderItem[];
  onMarkTaken?: (logId: string, scheduledTime: string) => void;
};

export default function MedicationReminders({ 
  reminders, 
  onMarkTaken 
}: MedicationRemindersProps) {
  const colorScheme = useColorScheme();
  
  // Responsive sizing
  const containerMargin = isTablet ? 24 : 16;
  const containerPadding = isTablet ? 24 : 16;
  const titleSize = isTablet ? 22 : 18;
  
  // Get precise current day boundaries (12:00 AM - 11:59 PM)
  const getCurrentDayBoundaries = () => {
    const now = new Date();
    
    // Start of today (12:00 AM)
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    
    // End of today (11:59:59 PM)
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    
    return { startOfDay, endOfDay };
  };
  
  // Filter reminders for current day only (12:00 AM - 11:59 PM)
  const todaysReminders = reminders
    .filter(r => {
      const { startOfDay, endOfDay } = getCurrentDayBoundaries();
      const reminderDate = new Date(r.time);
      
      console.log('🔍 COMPONENT FILTER DEBUG:', {
        medicationName: r.medicationName,
        reminderTime: r.time,
        reminderDateISO: reminderDate.toISOString(),
        reminderDateLocal: reminderDate.toLocaleString(),
        startOfDay: startOfDay.toISOString(),
        endOfDay: endOfDay.toISOString(),
        isAfterStart: reminderDate >= startOfDay,
        isBeforeEnd: reminderDate <= endOfDay,
        isWithinToday: reminderDate >= startOfDay && reminderDate <= endOfDay,
        status: r.status,
        logId: r.logId
      });
      
      // Check if reminder time falls within today's boundaries
      return reminderDate >= startOfDay && reminderDate <= endOfDay;
    })
    .sort((a, b) => {
      // Sort by status priority: pending/overdue first, then by time
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (b.status === 'pending' && a.status !== 'pending') return 1;
      return new Date(a.time).getTime() - new Date(b.time).getTime();
    })
    .slice(0, isTablet ? 8 : 5); // Show more on tablets

  console.log('📋 COMPONENT FINAL FILTERED REMINDERS:', {
    totalInputReminders: reminders.length,
    todaysReminders: todaysReminders.length,
    currentTime: new Date().toISOString(),
    currentDate: new Date().toLocaleDateString('en-CA'),
    currentDay: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    inputReminders: reminders.map(r => ({
      name: r.medicationName,
      time: r.time,
      status: r.status
    })),
    filteredReminders: todaysReminders.map(r => ({
      name: r.medicationName,
      time: r.time,
      status: r.status
    }))
  });

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: Colors[colorScheme].card,
        margin: containerMargin,
        padding: containerPadding,
      }
    ]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { fontSize: titleSize, color: Colors[colorScheme].text }]}>Today's Medications</Text>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={[styles.viewAllText, { color: Colors[colorScheme].tint }]}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors[colorScheme].tint} />
        </TouchableOpacity>
      </View>
      
      {todaysReminders.length === 0 ? (
        <EmptyMedicationState />
      ) : (
        todaysReminders.map((reminder) => (
          <MedicationCard 
            key={reminder.id} 
            reminder={reminder} 
            onMarkTaken={onMarkTaken}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: isTablet ? 20 : 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isTablet ? 20 : 16,
  },
  title: {
    fontWeight: 'bold',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  viewAllText: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '500',
    marginRight: 4,
  },
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
  reminderCard: {
    position: 'relative',
    marginVertical: isTablet ? 8 : 6,
    borderRadius: isTablet ? 16 : 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  fillBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    zIndex: 1,
  },
  cardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
    backgroundColor: 'transparent',
  },
  reminderTimeContainer: {
    alignItems: 'center',
    marginRight: isTablet ? 16 : 12,
    minWidth: isTablet ? 80 : 60,
    backgroundColor: 'transparent',
  },
  reminderTime: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  statusIconContainer: {
    padding: 6,
    borderRadius: 12,
  },
  reminderDetails: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  reminderName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  reminderDosage: {
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  statusText: {
    fontWeight: '500',
  },
  actionIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: isTablet ? 80 : 60,
    backgroundColor: 'transparent',
  },
  progressIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: isTablet ? 12 : 10,
    fontWeight: 'bold',
    marginTop: 4,
  },
  takeHint: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },
  hintText: {
    fontSize: isTablet ? 10 : 8,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
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