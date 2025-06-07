import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import PagerView from 'react-native-pager-view';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/config/supabase'; 

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Welcome to MediMate',
    subtitle: 'Your AI-powered health companion',
    description: 'Get personalized health insights, medication reminders, and simplified medical information all in one place.',
    icon: 'medical',
    color: '#4a90e2',
    gradient: ['#4a90e2', '#357abd'],
  },
  {
    id: 2,
    title: 'Smart Symptom Checker',
    subtitle: 'AI-powered health analysis',
    description: 'Describe your symptoms and get instant AI analysis with recommendations for next steps.',
    icon: 'search',
    color: '#e74c3c',
    gradient: ['#e74c3c', '#c0392b'],
  },
  {
    id: 3,
    title: 'Document Simplification',
    subtitle: 'Understand your medical reports',
    description: 'Upload medical documents and get easy-to-understand explanations of complex medical terms.',
    icon: 'document-text',
    color: '#27ae60',
    gradient: ['#27ae60', '#229954'],
  },
  {
    id: 4,
    title: 'Medication Management',
    subtitle: 'Never miss a dose',
    description: 'Track your medications, set reminders, and monitor your adherence with smart notifications.',
    icon: 'medical-outline',
    color: '#f39c12',
    gradient: ['#f39c12', '#e67e22'],
  },
  {
    id: 5,
    title: 'Health Calendar',
    subtitle: 'Stay organized',
    description: 'Schedule appointments, track health events, and maintain your health journey in one calendar.',
    icon: 'calendar',
    color: '#9b59b6',
    gradient: ['#9b59b6', '#8e44ad'],
  },
];

export default function OnboardingWelcomeScreen() {
  const [currentPage, setCurrentPage] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  const handleNext = () => {
    if (currentPage < onboardingData.length - 1) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setCurrentPage(currentPage + 1);
        pagerRef.current?.setPage(currentPage + 1);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      });
    } else {
      handleFinish();
    }
  };

  const handleSkip = async () => {
    try {
      await markOnboardingCompleted();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      router.replace('/(tabs)');
    }
  };

  const handleFinish = async () => {
    try {
      await markOnboardingCompleted();
      // Force navigation with replace to ensure clean transition
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Still navigate even if there's an error
      router.replace('/(tabs)');
    }
  };

  const markOnboardingCompleted = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            onboarding_seen: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) {
          console.error('Error marking onboarding completed:', error);
          throw error; // Add this to ensure error handling
        } else {
          console.log('✅ Onboarding marked as completed');
          // Force a small delay to ensure database transaction completes
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (error) {
      console.error('Error marking onboarding completed:', error);
      throw error; // Re-throw to handle in calling function
    }
  };

  const handlePageSelected = (e: any) => {
    setCurrentPage(e.nativeEvent.position);
  };

  const renderPage = (item: typeof onboardingData[0], index: number) => (
    <View key={item.id} style={styles.page}>
      <LinearGradient
        colors={item.gradient as any}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.iconContainer}>
            <View style={[styles.iconBackground, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name={item.icon as any} size={80} color="white" />
            </View>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {onboardingData.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: currentPage === index ? 'white' : 'rgba(255,255,255,0.5)',
              width: currentPage === index ? 24 : 8,
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Pager View */}
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={handlePageSelected}
      >
        {onboardingData.map((item, index) => renderPage(item, index))}
      </PagerView>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {renderDots()}
        
        <View style={styles.buttonContainer}>
          {currentPage > 0 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setCurrentPage(currentPage - 1);
                pagerRef.current?.setPage(currentPage - 1);
              }}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentPage === onboardingData.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons 
              name={currentPage === onboardingData.length - 1 ? 'checkmark' : 'chevron-forward'} 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4a90e2',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  skipText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 60,
  },
  iconBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  bottomSection: {
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});