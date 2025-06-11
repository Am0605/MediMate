import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH > 768;

type StatusInfo = {
  text: string;
  color: string;
  icon: string;
  fillColor: string;
};

type MedicationCardContentProps = {
  time: string;
  medicationName: string;
  dosage: string;
  instructions: string;
  statusInfo: StatusInfo;
  isOverdue: boolean;
  isAutoMissed: boolean;
  isTaken: boolean;
  isLate: boolean;
  isMissed: boolean;
};

export default function MedicationCardContent({
  time,
  medicationName,
  dosage,
  instructions,
  statusInfo,
  isOverdue,
  isAutoMissed,
  isTaken,
  isLate,
  isMissed,
}: MedicationCardContentProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const fontSize = {
    time: isTablet ? 20 : 16,
    name: isTablet ? 20 : 16,
    dosage: isTablet ? 16 : 14,
    status: isTablet ? 14 : 12,
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.cardContent}>
      <View style={styles.reminderTimeContainer}>
        <Text style={[
          styles.reminderTime,
          { 
            color: (isOverdue || isAutoMissed) ? '#F44336' : Colors[colorScheme].text,
            fontSize: fontSize.time,
          }
        ]}>
          {formatTime(time)}
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
          {medicationName}
        </Text>
        <Text style={[
          styles.reminderDosage, 
          { 
            color: isDark ? '#A0B4C5' : '#757575',
            fontSize: fontSize.dosage,
          }
        ]}>
          {dosage} • {instructions}
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
    </View>
  );
}

const styles = StyleSheet.create({
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
    backgroundColor: 'transparent',
    flex: 1,
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
  } as any,
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
  } as any,
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
  } as any,
});