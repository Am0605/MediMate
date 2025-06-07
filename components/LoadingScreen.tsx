import React, { useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ActivityIndicator, 
  Animated,
  Dimensions,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotsAnim = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
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

    // Continuous pulse animation for logo
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Continuous rotation for loading indicator
    const rotationAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    // Animated dots
    const dotsAnimation = Animated.loop(
      Animated.stagger(300, 
        dotsAnim.map(dot => 
          Animated.sequence([
            Animated.timing(dot, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        )
      )
    );

    if (variant !== 'minimal') {
      pulseAnimation.start();
      dotsAnimation.start();
    }
    rotationAnimation.start();

    return () => {
      pulseAnimation.stop();
      rotationAnimation.stop();
      dotsAnimation.stop();
    };
  }, [variant]);

  const renderMinimalLoading = () => (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}
    >
      <Animated.View style={[
        styles.minimalContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
      >
        <ActivityIndicator 
          size="large" 
          color={Colors[colorScheme].tint} 
        />
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
      <Animated.View style={[
        styles.splashContent,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
      >
        {showLogo && (
          <Animated.View style={[
            styles.logoContainer,
            {
              transform: [{ scale: pulseAnim }]
            }
          ]}
          >
            <View style={styles.logoBackground}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </Animated.View>
        )}
        
        <View style={styles.brandContainer}>
          <Text style={styles.brandText}>MediMate</Text>
          <Text style={styles.taglineText}>Your AI Health Companion</Text>
        </View>

        <View style={styles.loadingContainer}>
          <Animated.View style={[
            styles.customSpinner,
            {
              transform: [{
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg']
                })
              }]
            }
          ]}
          >
            <Ionicons name="medical" size={24} color="#fff" />
          </Animated.View>
          <Text style={styles.splashMessage}>{message}</Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );

  const renderDefaultLoading = () => (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}
    >
      <Animated.View style={[
        styles.defaultContent,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
      >
        {showLogo && (
          <Animated.View style={[
            styles.logoContainer,
            {
              transform: [{ scale: pulseAnim }]
            }
          ]}
          >
            <View style={[styles.logoBackground, { backgroundColor: Colors[colorScheme].card }]}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </Animated.View>
        )}

        <View style={styles.loadingIndicatorContainer}>
          <View style={styles.spinnerContainer}>
            <Animated.View style={[
              styles.customSpinner,
              { backgroundColor: Colors[colorScheme].tint },
              {
                transform: [{
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })
                }]
              }
            ]}
            >
              <Ionicons name="medical" size={20} color="#fff" />
            </Animated.View>
          </View>

          <Text style={[styles.messageText, { color: Colors[colorScheme].text }]}>
            {message}
          </Text>

          {/* Animated dots */}
          <View style={styles.dotsContainer}>
            {dotsAnim.map((dot, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  { backgroundColor: Colors[colorScheme].tint },
                  {
                    opacity: dot,
                    transform: [{
                      scale: dot.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1.2]
                      })
                    }]
                  }
                ]}
              />
            ))}
          </View>
        </View>

        {/* Progress bar */}
        <View style={[styles.progressContainer, { backgroundColor: Colors[colorScheme].card }]}>
          <Animated.View 
            style={[
              styles.progressBar,
              { backgroundColor: Colors[colorScheme].tint },
              {
                transform: [{
                  translateX: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-width, width * 0.7]
                  })
                }]
              }
            ]}
          />
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
  
  // Minimal variant
  minimalContainer: {
    alignItems: 'center',
  },
  minimalText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },

  // Splash variant
  splashContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 40,
  },
  brandContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  brandText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  taglineText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    textAlign: 'center',
  },
  splashMessage: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },

  // Default variant
  defaultContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 50,
    height: 50,
  },
  loadingIndicatorContainer: {
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  spinnerContainer: {
    marginBottom: 20,
  },
  customSpinner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  messageText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  progressContainer: {
    width: width * 0.7,
    height: 4,
    borderRadius: 2,
    marginTop: 30,
    overflow: 'hidden',
  },
  progressBar: {
    width: '30%',
    height: '100%',
    borderRadius: 2,
  },
});