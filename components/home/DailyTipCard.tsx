import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  View as RNView,    
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, Card } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH > 768;

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
  const [contentHeight, setContentHeight] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Get tip based on current day to ensure consistency
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const tipIndex = dayOfYear % healthTips.length;
    setDailyTip(healthTips[tipIndex]);
  }, []);

  const toggleExpand = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    Animated.timing(expandAnim, {
      toValue: newExpandedState ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false, // animating height/opacity
    }).start();
  };

  // Add extra padding to ensure full content is visible
  const heightInterp = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentHeight + 20], // Add 20px extra padding
  });
  
  const opacityInterp = expandAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0, 1], // Delay opacity until height starts expanding
  });

  // Hint text opacity (inverse of expansion)
  const hintOpacity = expandAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [1, 0, 0], // Hide hint as soon as expansion starts
  });

  return (
    <>
      {/* off-screen measure container with proper padding */}
      <RNView
        style={styles.hiddenMeasure}
        onLayout={(e) => {
          const measuredHeight = e.nativeEvent.layout.height;
          console.log('📏 Measured content height:', measuredHeight);
          if (!contentHeight || measuredHeight > contentHeight) {
            setContentHeight(measuredHeight);
          }
        }}
      >
        <Text style={[styles.tipText, isDark ? { color: '#A0B4C5' } : { color: '#666' }]}>
          {dailyTip.content}
        </Text>
      </RNView>

      <TouchableOpacity onPress={toggleExpand} activeOpacity={0.8}>
        <Card style={[styles.tipCard, { borderStartColor: dailyTip.color }]}>
          <View
            style={[
              styles.tipIconContainer,
              { backgroundColor: dailyTip.color + '20' },
            ]}
          >
            <Ionicons name={dailyTip.icon as any} size={24} color={dailyTip.color} />
          </View>

          <View style={styles.tipContent}>
            <View style={styles.tipHeader}>
              <Text style={[styles.tipTitle, { color: Colors[colorScheme].text }]}>
                {dailyTip.title}
              </Text>
              <Animated.View
                style={{ 
                  transform: [{ 
                    rotate: expandAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '180deg'],
                    }) 
                  }] 
                }}
              >
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={Colors[colorScheme].text}
                />
              </Animated.View>
            </View>

            <Text style={[styles.tipLabel, { color: dailyTip.color }]}>
              Tip of the Day
            </Text>

            {/* animated content area with proper height */}
            <Animated.View
              style={{
                height: heightInterp,
                opacity: opacityInterp,
                overflow: 'hidden',
              }}
            >
              <View style={styles.contentWrapper}>
                <Text style={[styles.tipText, isDark ? { color: '#A0B4C5' } : { color: '#666' }]}>
                  {dailyTip.content}
                </Text>
              </View>
            </Animated.View>

            {/* animated hint text that fades out smoothly */}
            <Animated.View 
              style={{ 
                opacity: hintOpacity,
                height: isExpanded ? 0 : 'auto', // Collapse height when expanded
              }}
              pointerEvents={isExpanded ? 'none' : 'auto'}
            >
              <Text style={[styles.expandHint, { color: Colors[colorScheme].tint }]}>
                Tap to read tip
              </Text>
            </Animated.View>
          </View>
        </Card>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  tipCard: {
    flexDirection: 'row',
    marginHorizontal: 10,
    marginTop: 10,
    padding: 15,
    borderStartWidth: 4,
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
  } as any,
  tipLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  } as any,
  contentWrapper: {
    paddingTop: 8,
    paddingBottom: 8, // Add bottom padding for full visibility
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
  expandHint: {
    fontSize: 12,
    marginTop: 2,
    fontStyle: 'italic',
  } as any,
  hiddenMeasure: {
    position: 'absolute',
    top: -9999,
    left: 0,
    right: 0,
    opacity: 0,
    paddingTop: 8,
    paddingBottom: 8,
  },
});