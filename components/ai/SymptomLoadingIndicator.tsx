import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

interface SymptomLoadingIndicatorProps {
  step: 'analyzing' | 'processing';
}

export default function SymptomLoadingIndicator({ step }: SymptomLoadingIndicatorProps) {
  const colorScheme = useColorScheme();
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const progressValue = useRef(new Animated.Value(0)).current;

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

    const progressAnimation = Animated.timing(progressValue, {
      toValue: step === 'analyzing' ? 0.7 : 1,
      duration: 1500,
      useNativeDriver: false,
    });

    spinAnimation.start();
    pulseAnimation.start();
    progressAnimation.start();

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
      progressAnimation.stop();
    };
  }, [step]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getStepInfo = () => {
    switch (step) {
      case 'analyzing':
        return {
          icon: 'medical',
          title: 'Analyzing Your Symptoms',
          description: 'Our AI is carefully reviewing your symptoms and cross-referencing medical data...',
          color: '#DC2626',
          steps: [
            { label: 'Processing symptoms', completed: true },
            { label: 'Analyzing patterns', completed: false },
            { label: 'Generating recommendations', completed: false },
          ]
        };
      case 'processing':
        return {
          icon: 'sparkles',
          title: 'Generating Assessment',
          description: 'Creating personalized health recommendations based on your input...',
          color: '#059669',
          steps: [
            { label: 'Processing symptoms', completed: true },
            { label: 'Analyzing patterns', completed: true },
            { label: 'Generating recommendations', completed: false },
          ]
        };
      default:
        return {
          icon: 'hourglass',
          title: 'Processing',
          description: 'Please wait...',
          color: Colors[colorScheme ?? 'light'].tint,
          steps: []
        };
    }
  };

  const stepInfo = getStepInfo();

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={[styles.loadingCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
        {/* Animated Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            { 
              backgroundColor: stepInfo.color + '20',
              transform: [{ rotate: spin }, { scale: pulseValue }],
            }
          ]}
        >
          <Ionicons name={stepInfo.icon as any} size={48} color={stepInfo.color} />
          <View style={[styles.loadingSpinner, { borderTopColor: stepInfo.color }]} />
        </Animated.View>

        {/* Title and Description */}
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          {stepInfo.title}
        </Text>
        
        <Text style={[styles.description, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          {stepInfo.description}
        </Text>

        {/* Progress Steps */}
        {stepInfo.steps.length > 0 && (
          <View style={styles.stepsContainer}>
            {stepInfo.steps.map((stepItem, index) => (
              <View key={index} style={styles.stepItem}>
                <Ionicons 
                  name={stepItem.completed ? "checkmark-circle" : step === 'analyzing' && index === 1 ? "time-outline" : "ellipse-outline"} 
                  size={16} 
                  color={stepItem.completed ? '#059669' : step === 'analyzing' && index === 1 ? stepInfo.color : Colors[colorScheme ?? 'light'].textSecondary} 
                />
                <Text style={[
                  styles.stepText, 
                  { 
                    color: stepItem.completed 
                      ? '#059669' 
                      : step === 'analyzing' && index === 1 
                        ? stepInfo.color 
                        : Colors[colorScheme ?? 'light'].textSecondary 
                  }
                ]}>
                  {stepItem.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              { 
                backgroundColor: stepInfo.color,
                width: progressValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              }
            ]}
          />
        </View>

        {/* Medical Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <Ionicons name="information-circle-outline" size={16} color={Colors[colorScheme ?? 'light'].textSecondary} />
          <Text style={[styles.disclaimerText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            AI analysis for informational purposes only
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingCard: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  iconContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingSpinner: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: 'transparent',
    top: -5,
    left: -5,
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
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  stepsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  disclaimerText: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});