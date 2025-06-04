import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, Card } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

// Daily health tips pool
const healthTips = [
  {
    id: '1',
    title: 'Hydration Matters',
    content: 'Drinking enough water helps your body absorb medications properly. Aim for 8 glasses daily!',
    icon: 'water',
    color: '#2196F3'
  },
  {
    id: '2',
    title: 'Medication Timing',
    content: 'Take medications at the same time each day to maintain consistent levels in your body.',
    icon: 'time',
    color: '#4CAF50'
  },
  {
    id: '3',
    title: 'Regular Exercise',
    content: 'Light exercise can improve medication effectiveness and overall health. Start with 15 minutes daily.',
    icon: 'fitness',
    color: '#FF9800'
  },
  {
    id: '4',
    title: 'Sleep Quality',
    content: 'Good sleep helps your body heal and process medications effectively. Aim for 7-9 hours nightly.',
    icon: 'moon',
    color: '#9C27B0'
  },
  {
    id: '5',
    title: 'Food Interactions',
    content: 'Some medications work better with food, others without. Always follow your prescription instructions.',
    icon: 'restaurant',
    color: '#F44336'
  }
];

export default function DailyTipCard() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [dailyTip, setDailyTip] = useState(healthTips[0]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Get tip based on current day to ensure consistency
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const tipIndex = dayOfYear % healthTips.length;
    setDailyTip(healthTips[tipIndex]);
  }, []);

  const handleTipPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded(!isExpanded);
  };

  return (
    <TouchableOpacity onPress={handleTipPress} activeOpacity={0.8}>
      <Card style={[styles.tipCard, { borderLeftColor: dailyTip.color }]}>
        <View style={[styles.tipIconContainer, { backgroundColor: dailyTip.color + '20' }]}>
          <Ionicons name={dailyTip.icon as any} size={24} color={dailyTip.color} />
        </View>
        
        <View style={styles.tipContent}>
          <View style={styles.tipHeader}>
            <Text style={[styles.tipTitle, { color: Colors[colorScheme].text }]}>
              {dailyTip.title}
            </Text>
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={Colors[colorScheme].text} 
            />
          </View>
          
          <Text style={[styles.tipLabel, { color: dailyTip.color }]}>
            Tip of the Day
          </Text>
          
          <Text 
            style={[styles.tipText, { color: isDark ? '#A0B4C5' : '#666' }]}
            numberOfLines={isExpanded ? undefined : 2}
          >
            {dailyTip.content}
          </Text>
          
          {!isExpanded && (
            <Text style={[styles.expandHint, { color: Colors[colorScheme].tint }]}>
              Tap to read more
            </Text>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tipCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 15,
    borderLeftWidth: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  tipIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    alignSelf: 'flex-start',
  },
  tipContent: {
    flex: 1,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  tipLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
  expandHint: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
});