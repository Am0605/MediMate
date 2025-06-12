import React, { useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Dimensions,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
  variant?: 'default' | 'splash' | 'minimal';
}

const { width } = Dimensions.get('window');

export default function LoadingScreen({ 
  message = 'Loading...', 
  showLogo = true,
  variant = 'default'
}: LoadingScreenProps) {
  const colorScheme = useColorScheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Bubble animation values
  const bubbles = useRef([
    { scale: new Animated.Value(0), opacity: new Animated.Value(0) },
    { scale: new Animated.Value(0), opacity: new Animated.Value(0) },
    { scale: new Animated.Value(0), opacity: new Animated.Value(0) }
  ]).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Bubble animations
    const bubbleAnimations = bubbles.map((bubble, index) => {
      const sequence = Animated.sequence([
        Animated.delay(index * 200),
        Animated.parallel([
          Animated.spring(bubble.scale, {
            toValue: 1,
            tension: 10,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.timing(bubble.opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          })
        ]),
        Animated.delay(1000),
        Animated.parallel([
          Animated.spring(bubble.scale, {
            toValue: 0,
            tension: 10,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.timing(bubble.opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          })
        ])
      ]);

      return Animated.loop(sequence);
    });

    bubbleAnimations.forEach(anim => anim.start());

    return () => {
      bubbleAnimations.forEach(anim => anim.stop());
    };
  }, [variant]);

  const renderBubbles = () => (
    <View style={styles.bubbleContainer}>
      {bubbles.map((bubble, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bubble,
            {
              backgroundColor: Colors[colorScheme].tint,
              transform: [{ scale: bubble.scale }],
              opacity: bubble.opacity
            }
          ]}
        />
      ))}
    </View>
  );

  const renderMinimalLoading = () => (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <Animated.View 
        style={[
          styles.minimalContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {renderBubbles()}
        <Text style={[styles.minimalText, { color: Colors[colorScheme].text }]}> 
          {message}
        </Text>
      </Animated.View>
    </View>
  );

  const renderSplashLoading = () => (
    <LinearGradient
      colors={[Colors[colorScheme].tint, Colors[colorScheme].tint + '80']}
      style={styles.container}
    >
      <Animated.View 
        style={[
          styles.splashContent,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.loadingContainer}>
          {renderBubbles()}
          <Text style={styles.splashMessage}>{message}</Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );

  const renderDefaultLoading = () => (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <Animated.View 
        style={[
          styles.defaultContent,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.loadingIndicatorContainer}>
          {renderBubbles()}
          <Text style={[styles.messageText, { color: Colors[colorScheme].text }]}> 
            {message}
          </Text>
        </View>
        <View style={[styles.progressContainer, { backgroundColor: Colors[colorScheme].card }]}>
        </View>
      </Animated.View>
    </View>
  );

  switch (variant) {
    case 'minimal':
      return renderMinimalLoading();
    case 'splash':
      return renderSplashLoading();
    default:
      return renderDefaultLoading();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  minimalContainer: {
    alignItems: 'center',
  },
  minimalText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  splashContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  splashMessage: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  defaultContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingIndicatorContainer: {
    alignItems: 'center',
  },
  messageText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    width: width * 0.7,
    height: 4,
    borderRadius: 2,
    marginTop: 30,
    overflow: 'hidden',
  },
  bubbleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    marginVertical: 16,
  },
  bubble: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 8,
  },
});