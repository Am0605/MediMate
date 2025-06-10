import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import * as Haptics from 'expo-haptics';
import AddMedicationModal from './AddMedicationModal';

type MedicationHeaderProps = {
  onAddMedication?: (medicationData: any) => void;
  loading?: boolean;
};

export default function MedicationHeader({ onAddMedication, loading }: MedicationHeaderProps) {
  const colorScheme = useColorScheme();
  const [showAddModal, setShowAddModal] = useState(false);
  
  const handleAddMedication = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowAddModal(true);
  };

  const handleSaveMedication = (medicationData: any) => {
    console.log('💊 Adding new medication:', medicationData);
    onAddMedication?.(medicationData);
    setShowAddModal(false);
  };
  
  return (
    <>
      <View style={[styles.header, { backgroundColor: Colors[colorScheme].background }]}>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>My Medications</Text>
          <Text style={[styles.headerSubtitle, { color: Colors[colorScheme === 'dark' ? 'dark' : 'light'].tabIconDefault }]}>
            Track and manage your medications
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              { 
                backgroundColor: Colors[colorScheme].tint + '20',
                opacity: loading ? 0.6 : 1
              }
            ]}
            onPress={handleAddMedication}
            disabled={loading}
          >
            <Ionicons name="add" size={20} color={Colors[colorScheme].tint} />
          </TouchableOpacity>
        </View>
      </View>

      <AddMedicationModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveMedication}
        loading={loading}
      />
    </>
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