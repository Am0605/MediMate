import React from 'react';
import { StyleSheet, TouchableOpacity, Dimensions, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { HealthProfileData } from '@/types/healthProfile';
import { useRouter } from 'expo-router';

type HealthPersonalInfoProps = {
  healthProfile: HealthProfileData;
  onEdit?: () => void;
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive breakpoints
const isTablet = screenWidth >= 768;
const isLargePhone = screenWidth >= 414;
const isSmallPhone = screenWidth < 350;

export default function HealthPersonalInfo({ healthProfile, onEdit }: HealthPersonalInfoProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  
  // Calculate responsive dimensions
  const containerPadding = isTablet ? 24 : isLargePhone ? 20 : 16;
  const cardGap = isTablet ? 16 : isLargePhone ? 12 : 8;
  const cardWidth = (screenWidth - (containerPadding * 2) - (cardGap * 2)) / 3;
  
  // Responsive text sizes
  const textSizes = {
    title: isTablet ? 22 : isLargePhone ? 20 : 18,
    sectionTitle: isTablet ? 18 : isLargePhone ? 16 : 15,
    cardLabel: isTablet ? 14 : isLargePhone ? 13 : 12,
    cardValue: isTablet ? 16 : isLargePhone ? 15 : 14,
    tagText: isTablet ? 14 : isLargePhone ? 13 : 12,
  };
  
  // Responsive icon sizes
  const iconSizes = {
    edit: isTablet ? 26 : 22,
    card: isTablet ? 28 : isLargePhone ? 26 : 24,
  };
  
  const styles = StyleSheet.create({
    container: {
      margin: containerPadding,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: isTablet ? 32 : 24,
    },
    title: {
      fontSize: textSizes.title,
      fontWeight: 'bold',
      color: Colors[colorScheme].text,
    },
    editButton: {
      padding: isTablet ? 12 : 8,
      borderRadius: isTablet ? 12 : 8,
      backgroundColor: Colors[colorScheme].tint + '15',
    },
    infoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: isTablet ? 20 : 16,
    },
    infoItem: {
      width: cardWidth,
      minHeight: isTablet ? 140 : isLargePhone ? 120 : 110,
      padding: isTablet ? 16 : isLargePhone ? 14 : 12,
      marginBottom: cardGap,
      borderRadius: isTablet ? 16 : 12,
      backgroundColor: isDark ? '#0A1929' : '#FFFFFF',
      borderWidth: isDark ? 1 : 0,
      borderColor: isDark ? '#1E3A5F' : 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
      // Platform-specific shadows
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: isTablet ? 3 : 2 },
          shadowOpacity: isTablet ? 0.08 : 0.05,
          shadowRadius: isTablet ? 4 : 2,
        },
        android: {
          elevation: isTablet ? 3 : 2,
        },
      }),
    },
    iconContainer: {
      width: isTablet ? 56 : isLargePhone ? 52 : 48,
      height: isTablet ? 56 : isLargePhone ? 52 : 48,
      borderRadius: isTablet ? 28 : isLargePhone ? 26 : 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: isTablet ? 16 : 12,
      // Platform-specific styling - NO shadows on Android for perfect circles
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        android: {
          // Removed elevation and borderWidth for clean circles
          overflow: 'hidden', // Ensures perfect circle clipping
        },
      }),
    },
    infoText: {
      alignItems: 'center',
      flex: 1,
    },
    infoLabel: {
      fontSize: textSizes.cardLabel,
      marginBottom: isTablet ? 6 : 4,
      textAlign: 'center',
      color: isDark ? '#A0B4C5' : '#666666',
      fontWeight: '500',
    },
    infoValue: {
      fontSize: textSizes.cardValue,
      fontWeight: '600',
      textAlign: 'center',
      color: Colors[colorScheme].text,
      lineHeight: textSizes.cardValue * 1.2,
      marginBottom: isTablet ? 2 : 1,
    },
    infoCategoryText: {
      fontSize: textSizes.cardLabel,
      fontWeight: '500',
      textAlign: 'center',
      marginTop: isTablet ? 4 : 2,
      lineHeight: textSizes.cardLabel * 1.1,
    },
    section: {
      marginTop: isTablet ? 28 : 20,
      paddingBottom: isTablet ? 32 : 24,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1E3A5F' : '#E5E7EB',
    },
    sectionTitle: {
      fontSize: textSizes.sectionTitle,
      fontWeight: 'bold',
      marginBottom: isTablet ? 16 : 12,
      color: Colors[colorScheme].text,
    },
    tagContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: isTablet ? 12 : 8,
    },
    tag: {
      paddingHorizontal: isTablet ? 16 : 12,
      paddingVertical: isTablet ? 10 : 8,
      borderRadius: isTablet ? 20 : 16,
      marginRight: isSmallPhone ? 4 : 0,
      marginBottom: isSmallPhone ? 4 : 0,
    },
    tagText: {
      fontSize: textSizes.tagText,
      fontWeight: '500',
    },
    fallbackContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: isTablet ? 32 : 24,
      paddingHorizontal: isTablet ? 20 : 16,
      backgroundColor: isDark ? '#0A1929' : '#F8FAFC',
      borderRadius: isTablet ? 12 : 8,
      borderWidth: 1,
      borderColor: isDark ? '#1E3A5F' : '#E5E7EB',
      borderStyle: 'dashed',
    },
    fallbackIcon: {
      marginBottom: isTablet ? 12 : 8,
      opacity: 0.7,
    },
    fallbackText: {
      fontSize: isTablet ? 16 : 14,
      fontWeight: '600',
      color: Colors[colorScheme].text,
      textAlign: 'center',
      marginBottom: isTablet ? 6 : 4,
    },
    fallbackSubtext: {
      fontSize: isTablet ? 14 : 12,
      color: isDark ? '#A0B4C5' : '#666666',
      textAlign: 'center',
      fontWeight: '500',
    },
  });

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'N/A';
    
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
    if (!weight || !height) return 'N/A';
    
    try {
      // Extract numeric values
      const weightNum = parseFloat(weight.replace(/[^\d.]/g, ''));
      const heightNum = parseFloat(height.replace(/[^\d.]/g, ''));
      
      if (weightNum <= 0 || heightNum <= 0) return 'N/A';
      
      // Weight is in kg (no conversion needed)
      const weightInKg = weightNum;
      
      // Height is in cm, convert to meters
      const heightInMeters = heightNum / 100;
      
      // Calculate BMI: weight (kg) / height (m)²
      const bmi = weightInKg / (heightInMeters * heightInMeters);
      
      // Validate BMI is in reasonable range
      if (bmi < 10 || bmi > 100) {
        console.log('BMI calculation debug:', {
          originalHeight: height,
          originalWeight: weight,
          heightInMeters,
          weightInKg,
          calculatedBMI: bmi
        });
        return 'N/A';
      }
      
      return bmi.toFixed(1);
    } catch (error) {
      console.error('Error calculating BMI:', error);
      return 'N/A';
    }
  };

  const getBMICategory = (bmi: string) => {
    const bmiValue = parseFloat(bmi);
    if (isNaN(bmiValue) || bmi === 'N/A') return { category: 'Unknown', color: '#757575' };
    
    if (bmiValue < 18.5) return { category: 'Underweight', color: '#2196F3' };
    if (bmiValue < 25) return { category: 'Normal', color: '#4CAF50' };
    if (bmiValue < 30) return { category: 'Overweight', color: '#FF9800' };
    return { category: 'Obese', color: '#F44336' };
  };

  const bmi = calculateBMI(healthProfile.weight, healthProfile.height);
  const bmiInfo = getBMICategory(bmi);

  // Format text for better responsiveness
  const formatCardValue = (value: string | undefined, maxLength = isSmallPhone ? 12 : 15) => {
    if (!value) return 'N/A';
    if (value.length > maxLength) {
      return value.substring(0, maxLength - 3) + '...';
    }
    return value;
  };

  const handleEditPress = () => {
    router.push('/(setting)/edit-profile');
  };

  const healthInfoItems = [
    {
      icon: 'calendar-outline',
      label: 'Age',
      value: `${calculateAge(healthProfile.date_of_birth)} ${isSmallPhone ? 'yrs' : 'years'}`,
      color: Colors[colorScheme].tint,
    },
    {
      icon: 'transgender-outline',
      label: 'Gender',
      value: formatCardValue(healthProfile.gender),
      color: '#9C27B0',
    },
    {
      icon: 'resize-outline',
      label: 'Height',
      value: formatCardValue(healthProfile.height),
      color: '#2196F3',
    },
    {
      icon: 'fitness-outline',
      label: 'Weight',
      value: formatCardValue(healthProfile.weight),
      color: '#FF9800',
    },
    {
      icon: 'analytics-outline',
      label: 'BMI',
      value: bmi,
      category: bmi !== 'N/A' ? bmiInfo.category : undefined,
      color: bmiInfo.color,
    },
    {
      icon: 'water-outline',
      label: 'Blood Type',
      value: formatCardValue(healthProfile.blood_type),
      color: '#F44336',
    },
  ];

  const conditions = healthProfile.conditions || [];
  const allergies = healthProfile.allergies || [];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>
          {isSmallPhone ? 'Health Info' : 'Personal Health Information'}
        </Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
          <Ionicons name="create-outline" size={iconSizes.edit} color={Colors[colorScheme].tint} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.infoGrid}>
        {healthInfoItems.map((item, index) => (
          <View key={index} style={styles.infoItem}>
            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon as any} size={iconSizes.card} color={item.color} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>
                {item.label}
              </Text>
              <Text 
                style={styles.infoValue}
                numberOfLines={1}
                adjustsFontSizeToFit={isSmallPhone}
                minimumFontScale={0.8}
              >
                {item.value}
              </Text>
              {/* BMI Category on second line */}
              {item.category && (
                <Text 
                  style={[
                    styles.infoCategoryText,
                    { color: item.color }
                  ]}
                  numberOfLines={1}
                >
                  {item.category}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Medical Conditions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Medical Conditions
        </Text>
        {conditions.length > 0 ? (
          <View style={styles.tagContainer}>
            {conditions.map((condition, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: '#F44336' + '20' }]}>
                <Text style={[styles.tagText, { color: '#F44336' }]}>
                  {formatCardValue(condition, isSmallPhone ? 10 : 20)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.fallbackContainer}>
            <Ionicons 
              name="checkmark-circle-outline" 
              size={isTablet ? 32 : 28} 
              color={isDark ? '#4CAF50' : '#4CAF50'} 
              style={styles.fallbackIcon}
            />
            <Text style={styles.fallbackText}>
              No medical conditions recorded
            </Text>
          </View>
        )}
      </View>

      {/* Allergies */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Allergies
        </Text>
        {allergies.length > 0 ? (
          <View style={styles.tagContainer}>
            {allergies.map((allergy, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: '#FF9800' + '20' }]}>
                <Text style={[styles.tagText, { color: '#FF9800' }]}>
                  {formatCardValue(allergy, isSmallPhone ? 10 : 20)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.fallbackContainer}>
            <Ionicons 
              name="shield-checkmark-outline" 
              size={isTablet ? 32 : 28} 
              color={isDark ? '#4CAF50' : '#4CAF50'} 
              style={styles.fallbackIcon}
            />
            <Text style={styles.fallbackText}>
              No allergies recorded
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}