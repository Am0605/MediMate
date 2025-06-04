import React from 'react';
import { StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { MedicationItem } from '@/types/medication';

type MedicationListProps = {
  medications: MedicationItem[];
};

export default function MedicationList({ medications }: MedicationListProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].card }]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>My Medications</Text>
        <TouchableOpacity>
          <Text style={{ color: Colors[colorScheme].tint }}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {medications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons 
            name="medkit" 
            size={48} 
            color={isDark ? '#1E3A5F' : '#e0e0e0'} 
          />
          <Text style={[styles.emptyText, { color: isDark ? '#A0B4C5' : '#757575' }]}>
            No medications added yet. Tap the + button to add your medications.
          </Text>
        </View>
      ) : (
        medications.map((medication) => (
          <MedicationCard key={medication.id} medication={medication} />
        ))
      )}
    </View>
  );
}

// Sub-component for medication cards
function MedicationCard({ medication }: { medication: MedicationItem }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <TouchableOpacity style={[
      styles.medicationCard, 
      { backgroundColor: isDark ? '#0A1929' : '#FFFFFF' }
    ]}>
      <View style={[
        styles.medicationImageContainer,
        { backgroundColor: medication.color + '20' }
      ]}>
        {medication.image ? (
          <Image source={{ uri: medication.image }} style={styles.medicationImage} />
        ) : (
          <MaterialCommunityIcons name="pill" size={24} color={medication.color || Colors[colorScheme].tint} />
        )}
      </View>
      
      <View style={styles.medicationDetails}>
        <Text style={styles.medicationName}>{medication.name}</Text>
        <Text style={[styles.medicationDosage, { color: isDark ? '#A0B4C5' : '#757575' }]}>
          {medication.dosage} • {medication.frequency}
        </Text>
        <View style={styles.tagRow}>
          {medication.tags && medication.tags.map((tag, index) => (
            <View key={index} style={[
              styles.tag, 
              { backgroundColor: isDark ? '#132F4C' : '#F5F9FC' }
            ]}>
              <Text style={[styles.tagText, { color: medication.color || Colors[colorScheme].tint }]}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      </View>
      
      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color={isDark ? '#A0B4C5' : '#C0C0C0'} 
      />
    </TouchableOpacity>
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
    marginBottom: 20,
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
  medicationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medicationImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  medicationImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  medicationDetails: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
  },
  medicationDosage: {
    fontSize: 14,
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
});