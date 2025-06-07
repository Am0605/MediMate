import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { HealthProfileData } from '@/types/healthProfile';

type HealthPersonalInfoProps = {
  healthProfile: HealthProfileData;
};

export default function HealthPersonalInfo({ healthProfile }: HealthPersonalInfoProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const calculateBMI = (weight: string, height: string) => {
    // Extract numeric values from weight (assumes format like "175 lbs")
    const weightValue = parseFloat(weight.replace(/[^\d.]/g, ''));
    
    // Extract height in feet and inches (assumes format like "5'10\"")
    const heightMatch = height.match(/(\d+)'(\d+)"/);
    if (!heightMatch) return 'N/A';
    
    const feet = parseInt(heightMatch[1]);
    const inches = parseInt(heightMatch[2]);
    const totalInches = feet * 12 + inches;
    
    // Convert to metric (kg and meters)
    const weightKg = weightValue * 0.453592;
    const heightM = totalInches * 0.0254;
    
    const bmi = weightKg / (heightM * heightM);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi: string) => {
    const bmiValue = parseFloat(bmi);
    if (isNaN(bmiValue)) return { category: 'Unknown', color: '#757575' };
    
    if (bmiValue < 18.5) return { category: 'Underweight', color: '#2196F3' };
    if (bmiValue < 25) return { category: 'Normal', color: '#4CAF50' };
    if (bmiValue < 30) return { category: 'Overweight', color: '#FF9800' };
    return { category: 'Obese', color: '#F44336' };
  };

  const bmi = calculateBMI(healthProfile.weight, healthProfile.height);
  const bmiInfo = getBMICategory(bmi);

  const healthInfoItems = [
    {
      icon: 'calendar-outline',
      label: 'Age',
      value: `${calculateAge(healthProfile.dateOfBirth)} years`,
      color: Colors[colorScheme].tint,
    },
    {
      icon: 'transgender-outline',
      label: 'Gender',
      value: healthProfile.gender,
      color: '#9C27B0',
    },
    {
      icon: 'resize-outline',
      label: 'Height',
      value: healthProfile.height,
      color: '#2196F3',
    },
    {
      icon: 'fitness-outline',
      label: 'Weight',
      value: healthProfile.weight,
      color: '#FF9800',
    },
    {
      icon: 'analytics-outline',
      label: 'BMI',
      value: `${bmi} (${bmiInfo.category})`,
      color: bmiInfo.color,
    },
    {
      icon: 'water-outline',
      label: 'Blood Type',
      value: healthProfile.bloodType,
      color: '#F44336',
    },
  ];

  const conditions = healthProfile.conditions || [];
  const allergies = healthProfile.allergies || [];

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].card }]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Personal Health Information</Text>
        <TouchableOpacity>
          <Ionicons name="create-outline" size={22} color={Colors[colorScheme].tint} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.infoGrid}>
        {healthInfoItems.map((item, index) => (
          <View key={index} style={styles.infoItem}>
            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon as any} size={20} color={item.color} />
            </View>
            <View style={styles.infoText}>
              <Text style={[styles.infoLabel, { color: isDark ? '#A0B4C5' : '#666666' }]}>
                {item.label}
              </Text>
              <Text style={[styles.infoValue, { color: Colors[colorScheme].text }]}>
                {item.value}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Medical Conditions */}
      {conditions.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>
            Medical Conditions
          </Text>
          <View style={styles.tagContainer}>
            {conditions.map((condition, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: '#F44336' + '20' }]}>
                <Text style={[styles.tagText, { color: '#F44336' }]}>{condition}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Allergies */}
      {allergies.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>
            Allergies
          </Text>
          <View style={styles.tagContainer}>
            {allergies.map((allergy, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: '#FF9800' + '20' }]}>
                <Text style={[styles.tagText, { color: '#FF9800' }]}>{allergy}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
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
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
});