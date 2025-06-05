import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

interface LoadingIndicatorProps {
  step: 'extracting' | 'simplifying';
}

export default function LoadingIndicator({ step }: LoadingIndicatorProps) {
  const colorScheme = useColorScheme();
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    spinAnimation.start();
    pulseAnimation.start();

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getStepInfo = () => {
    switch (step) {
      case 'extracting':
        return {
          icon: 'scan',
          title: 'Extracting Text',
          description: 'Reading and extracting text from your document...',
          color: '#4F46E5',
        };
      case 'simplifying':
        return {
          icon: 'sparkles',
          title: 'Simplifying Content',
          description: 'AI is converting medical terms to simple language...',
          color: '#059669',
        };
      default:
        return {
          icon: 'hourglass',
          title: 'Processing',
          description: 'Please wait...',
          color: Colors[colorScheme ?? 'light'].tint,
        };
    }
  };

  const stepInfo = getStepInfo();

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
      <Animated.View
        style={[
          styles.iconContainer,
          { 
            backgroundColor: stepInfo.color + '20',
            transform: [{ rotate: spin }, { scale: pulseValue }],
          }
        ]}
      >
        <Ionicons name={stepInfo.icon as any} size={32} color={stepInfo.color} />
      </Animated.View>

      <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
        {stepInfo.title}
      </Text>
      
      <Text style={[styles.description, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
        {stepInfo.description}
      </Text>

      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            { 
              backgroundColor: stepInfo.color,
              width: step === 'extracting' ? '50%' : '100%',
            }
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});