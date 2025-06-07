import React from 'react';
import { StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

// App features showcase
const appFeatures = [
  {
    id: '1',
    title: 'Medication Tracking',
    description: 'Never miss a dose with our smart reminders',
    icon: 'medical',
    color: '#4A90E2',
    route: '/(tabs)/medication'
  },
  {
    id: '2',
    title: 'Appointments',
    description: 'Keep track of your doctor appointments',
    icon: 'calendar',
    color: '#50E3C2',
    route: '/(tabs)/calendar'
  },
  {
    id: '3',
    title: 'Health Profile',
    description: 'Manage your health information in one place',
    icon: 'person',
    color: '#F5A623',
    route: '/(tabs)/health-profile'
  },
  {
    id: '4',
    title: 'AI Assistant',
    description: 'Get health insights and medication help',
    icon: 'sparkles',
    color: '#9C27B0',
    route: '/(tabs)/ai-assistant'
  }
];

export default function QuickAccessSection() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  
  const handleFeaturePress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };
  
  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>
        Quick Access
      </Text>
      
      <View style={styles.featuresGrid}>
        {appFeatures.map(feature => (
          <TouchableOpacity 
            key={feature.id}
            style={[styles.featureCard, { backgroundColor: Colors[colorScheme].card }]}
            onPress={() => handleFeaturePress(feature.route)}
          >
            <View style={[styles.iconContainer, { backgroundColor: feature.color + '20' }]}>
              <Ionicons name={feature.icon as any} size={24} color={feature.color} />
            </View>
            <Text style={[styles.featureTitle, { color: Colors[colorScheme].text }]}>
              {feature.title}
            </Text>
            <Text style={[styles.featureDescription, { color: isDark ? '#A0B4C5' : '#666' }]} numberOfLines={2}>
              {feature.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  featureCard: {
    width: screenWidth / 2 - 25,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
});