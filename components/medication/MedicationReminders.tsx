import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { ReminderItem } from '@/types/medication';

type MedicationRemindersProps = {
  reminders: ReminderItem[];
};

export default function MedicationReminders({ reminders }: MedicationRemindersProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Show only upcoming reminders (max 3)
  const upcomingReminders = reminders.filter(r => 
    new Date(r.time) > new Date()
  ).slice(0, 3);
  
  if (upcomingReminders.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[colorScheme].card }]}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Upcoming Doses</Text>
          <TouchableOpacity>
            <Text style={{ color: Colors[colorScheme].tint }}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.emptyContainer}>
          <Ionicons 
            name="checkmark-circle" 
            size={48} 
            color={isDark ? '#1E3A5F' : '#e0e0e0'} 
          />
          <Text style={[styles.emptyText, { color: isDark ? '#A0B4C5' : '#757575' }]}>
            All caught up! No upcoming doses for today.
          </Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].card }]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Upcoming Doses</Text>
        <TouchableOpacity>
          <Text style={{ color: Colors[colorScheme].tint }}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {upcomingReminders.map((reminder) => (
        <ReminderCard key={reminder.id} reminder={reminder} />
      ))}
    </View>
  );
}

// Sub-component for reminder cards
function ReminderCard({ reminder }: { reminder: ReminderItem }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Format time to display
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <View style={[
      styles.reminderCard, 
      { borderLeftColor: reminder.color || Colors[colorScheme].tint }
    ]}>
      <View style={styles.reminderTimeContainer}>
        <Text style={styles.reminderTime}>{formatTime(reminder.time)}</Text>
        <Text style={[styles.reminderTimeAMPM, { color: isDark ? '#A0B4C5' : '#757575' }]}>
          {new Date(reminder.time).getHours() >= 12 ? 'PM' : 'AM'}
        </Text>
      </View>
      
      <View style={styles.reminderDetails}>
        <Text style={styles.reminderName}>{reminder.medicationName}</Text>
        <Text style={[styles.reminderDosage, { color: isDark ? '#A0B4C5' : '#757575' }]}>
          {reminder.dosage} • {reminder.instructions}
        </Text>
      </View>
      
      <TouchableOpacity style={[
        styles.takeDoseButton, 
        { backgroundColor: Colors[colorScheme].tint + '20' }
      ]}>
        <Text style={{ color: Colors[colorScheme].tint }}>Take</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 14,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 6,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  reminderTimeContainer: {
    alignItems: 'center',
    marginRight: 12,
    minWidth: 60,
  },
  reminderTime: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reminderTimeAMPM: {
    fontSize: 12,
  },
  reminderDetails: {
    flex: 1,
  },
  reminderName: {
    fontSize: 16,
    fontWeight: '600',
  },
  reminderDosage: {
    fontSize: 14,
    marginTop: 2,
  },
  takeDoseButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});