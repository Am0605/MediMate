import React from 'react';
import { StyleSheet, Modal, View, Text, TouchableOpacity, Pressable, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

interface AIModalProps {
  visible: boolean;
  onClose: () => void;
}

interface AIOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

const aiOptions: AIOption[] = [
  {
    id: '1',
    title: 'MedSimplify',
    description: 'Simplify complex medical information',
    icon: 'document-text',
    route: '/(ai)/medsimplify',
    color: '#4F46E5' // Indigo
  },
  {
    id: '2',
    title: 'Symptom Checker',
    description: 'AI-powered symptom analysis',
    icon: 'medical',
    route: '/(ai)/symptom-checker',
    color: '#DC2626' // Red
  },
  {
    id: '3',
    title: 'Vital Voice',
    description: 'Voice-powered vital tracking',
    icon: 'mic',
    route: '/(ai)/vital-voice',
    color: '#059669' // Green
  }
];

export default function AIModal({ visible, onClose }: AIModalProps) {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleOptionPress = (route: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    onClose();
    setTimeout(() => {
      router.push(route as any);
    }, 150);
  };

  const handleClose = () => {
    if (Platform.OS === 'ios') {
      Haptics.selectionAsync();
    }
    onClose();
  };

  const handleSymptomChecker = () => {
    onClose();
    router.push('/(ai)/symptom-checker');
  };

  const handleMedSimplify = () => {
    onClose();
    router.push('/(ai)/medsimplify');
  };

  const handleVitalVoice = () => {
    onClose();
    router.push('/(ai)/vital-voice');
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Animated.View 
        style={[
          styles.modalOverlay, 
          { opacity: fadeAnim }
        ]}
      >
        <Pressable style={styles.overlayTouchable} onPress={handleClose} />
        
        <Animated.View 
          style={[
            styles.modalContent, 
            { 
              backgroundColor: Colors[colorScheme ?? 'light'].card,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Handle bar */}
          <View style={[styles.handleBar, { backgroundColor: Colors[colorScheme ?? 'light'].border }]} />
          
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleContainer}>
              <View style={[styles.aiIconContainer, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}>
                <Ionicons name="sparkles" size={20} color="white" />
              </View>
              <View>
                <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                  AI Assistant
                </Text>
                <Text style={[styles.modalSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Choose your AI tool
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} 
              onPress={handleClose}
            >
              <Ionicons 
                name="close" 
                size={20} 
                color={Colors[colorScheme ?? 'light'].text} 
              />
            </TouchableOpacity>
          </View>
          
          {/* Options */}
          <View style={styles.optionsContainer}>
            {aiOptions.map((option, index) => (
              <Animated.View
                key={option.id}
                style={{
                  opacity: fadeAnim,
                  transform: [{
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    })
                  }]
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.optionButton, 
                    { 
                      backgroundColor: Colors[colorScheme ?? 'light'].background,
                      borderColor: Colors[colorScheme ?? 'light'].border,
                    }
                  ]}
                  onPress={() => handleOptionPress(option.route)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.optionIconContainer, { backgroundColor: option.color }]}>
                    <Ionicons 
                      name={option.icon as any} 
                      size={24} 
                      color="white"
                    />
                  </View>
                  
                  <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionText, { color: Colors[colorScheme ?? 'light'].text }]}>
                      {option.title}
                    </Text>
                    <Text style={[styles.optionDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      {option.description}
                    </Text>
                  </View>
                  
                  <View style={[styles.chevronContainer, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
                    <Ionicons 
                      name="chevron-forward" 
                      size={16} 
                      color={Colors[colorScheme ?? 'light'].textSecondary}
                    />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
          
          {/* Footer */}
          <View style={styles.modalFooter}>
            <Text style={[styles.footerText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Powered by AI • Always verify with healthcare professionals
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '60%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 20,
    opacity: 0.3,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    gap:8,
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  chevronContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalFooter: {
    alignItems: 'center',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.6,
  },
});