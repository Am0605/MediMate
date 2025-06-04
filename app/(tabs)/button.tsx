import React, { useRef, useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Modal, 
  Animated, 
  PanResponder, 
  TouchableWithoutFeedback,
  Dimensions,
  TouchableOpacity,
  Text as RNText
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, View as ThemedView } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CIRCLE_SIZE = 70;
const CENTER_CIRCLE_SIZE = 80;
const DRAG_THRESHOLD = 70;

// AI options data
const aiOptions = [
  {
    id: 'medSimplify',
    name: 'MedSimplify',
    icon: 'medkit-outline',
    color: '#4a90e2',
    description: 'Simplify medical jargon',
    route: '/(tabs)/medication'
  },
  {
    id: 'voiceVital',
    name: 'Voice Vital',
    icon: 'mic-outline',
    color: '#50c878',
    description: 'Voice-activated health assistant',
    route: '/(tabs)/calendar'
  },
  {
    id: 'symptomChecker',
    name: 'Symptom Checker',
    icon: 'search-outline',
    color: '#ff7f50',
    description: 'Identify possible conditions',
    route: '/(tabs)/index'
  }
];

export default function ButtonScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const centerCircleScale = useRef(new Animated.Value(1)).current;
  const optionCirclePositions = useRef(aiOptions.map(() => new Animated.ValueXY())).current;
  const [activeOption, setActiveOption] = useState(null);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Initial positions for the option circles (will be calculated after layout)
  const [centerPosition, setCenterPosition] = useState({ x: 0, y: 0 });

  // Setup the circle positions when modal opens
  useEffect(() => {
    if (modalVisible) {
      // Reset positions
      optionCirclePositions.forEach(pos => pos.setValue({ x: 0, y: 0 }));
      setActiveOption(null);

      // Calculate angles for 3 circles around the center
      const angleBetween = (2 * Math.PI) / aiOptions.length;
      const distance = 120; // Distance from center

      aiOptions.forEach((_, index) => {
        const angle = index * angleBetween - Math.PI / 2; // Start from top (-90 degrees)
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        // Animate the circles into position
        Animated.spring(optionCirclePositions[index], {
          toValue: { x, y },
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [modalVisible]);

  // Handle showing/hiding modal
  useEffect(() => {
    if (modalVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [modalVisible]);

  // Create the pan responder for the center circle
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Provide haptic feedback on touch start
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        // Scale up the center circle slightly
        Animated.spring(centerCircleScale, {
          toValue: 1.1,
          friction: 5,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        const { dx, dy } = gestureState;
        
        // Calculate distance from center
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if user is dragging toward any of the option circles
        let closestOption = null;
        let minDistance = DRAG_THRESHOLD;
        
        aiOptions.forEach((option, index) => {
          const optionX = optionCirclePositions[index].x._value;
          const optionY = optionCirclePositions[index].y._value;
          
          const distToOption = Math.sqrt(
            Math.pow(dx - optionX, 2) + 
            Math.pow(dy - optionY, 2)
          );
          
          if (distToOption < minDistance) {
            minDistance = distToOption;
            closestOption = index;
          }
        });
        
        // Update active option
        if (distance > CIRCLE_SIZE / 2) {
          setActiveOption(closestOption);
        } else {
          setActiveOption(null);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Scale down the center circle
        Animated.spring(centerCircleScale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }).start();

        // If an option is active, navigate to its screen
        if (activeOption !== null) {
          // Close modal
          setModalVisible(false);
          
          // Provide haptic feedback for selection
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          
          // Navigate after a short delay to allow the modal to close
          setTimeout(() => {
            router.push(aiOptions[activeOption].route);
          }, 300);
        }
      },
    })
  ).current;

  // Function to handle layout of modal content for positioning
  const onModalContentLayout = (e) => {
    const { width, height } = e.nativeEvent.layout;
    setCenterPosition({
      x: width / 2,
      y: height / 2,
    });
  };

  return (
    <ThemedView style={styles.container}>
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
            <TouchableWithoutFeedback>
              <Animated.View 
                style={[
                  styles.modalContent,
                  {
                    backgroundColor: isDark ? '#0A1929' : '#FFFFFF',
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
                onLayout={onModalContentLayout}
              >
                <RNText style={styles.modalTitle}>AI Assistants</RNText>
                <RNText style={[styles.modalSubtitle, { color: isDark ? '#A0B4C5' : '#666666' }]}>
                  Drag to select an assistant
                </RNText>
                
                {/* Option circles positioned around the center */}
                {aiOptions.map((option, index) => (
                  <Animated.View
                    key={option.id}
                    style={[
                      styles.optionCircle,
                      {
                        backgroundColor: option.color + (isDark ? '90' : '20'),
                        borderColor: option.color,
                        transform: [
                          { translateX: Animated.add(optionCirclePositions[index].x, centerPosition.x - CIRCLE_SIZE / 2) },
                          { translateY: Animated.add(optionCirclePositions[index].y, centerPosition.y - CIRCLE_SIZE / 2) },
                          { scale: activeOption === index ? 1.2 : 1 }
                        ],
                      }
                    ]}
                  >
                    <Ionicons name={option.icon} size={28} color={option.color} />
                    <RNText style={[styles.optionLabel, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                      {option.name}
                    </RNText>
                  </Animated.View>
                ))}
                
                {/* Center draggable circle */}
                <Animated.View
                  {...panResponder.panHandlers}
                  style={[
                    styles.centerCircle,
                    {
                      backgroundColor: Colors[colorScheme].tint,
                      transform: [
                        { translateX: centerPosition.x - CENTER_CIRCLE_SIZE / 2 },
                        { translateY: centerPosition.y - CENTER_CIRCLE_SIZE / 2 },
                        { scale: centerCircleScale }
                      ],
                    }
                  ]}
                >
                  <Ionicons name="apps" size={32} color="#FFFFFF" />
                  <RNText style={styles.dragText}>Drag</RNText>
                </Animated.View>
                
                <View style={styles.handleBar} />
                
                <View style={styles.spacer} />
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>

      <ThemedView style={styles.placeholder}>
        <Text style={styles.title}>AI Assist</Text>
        <Text style={styles.subtitle}>
          Access powerful AI assistants to help manage your health
        </Text>
        
        <TouchableOpacity 
          style={[
            styles.openButton,
            { backgroundColor: Colors[colorScheme].tint }
          ]}
          onPress={() => {
            setModalVisible(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
        >
          <Ionicons name="sparkles" size={28} color="#FFFFFF" />
          <Text style={styles.openButtonText}>Open AI Assistants</Text>
        </TouchableOpacity>
        
        {/* Option previews */}
        <ThemedView style={styles.optionsPreview}>
          {aiOptions.map(option => (
            <ThemedView key={option.id} style={styles.optionPreview}>
              <View style={[styles.optionIconPreview, { backgroundColor: option.color + '20' }]}>
                <Ionicons name={option.icon} size={24} color={option.color} />
              </View>
              <Text style={styles.optionNamePreview}>{option.name}</Text>
              <Text style={styles.optionDescPreview}>{option.description}</Text>
            </ThemedView>
          ))}
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.7,
    maxWidth: '80%',
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 40,
  },
  openButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  optionsPreview: {
    width: '100%',
    flexDirection: 'column',
  },
  optionPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  optionIconPreview: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionNamePreview: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
  },
  optionDescPreview: {
    fontSize: 14,
    opacity: 0.7,
    flex: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: SCREEN_HEIGHT * 0.6,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    alignItems: 'center',
  },
  handleBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.2)',
    position: 'absolute',
    top: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 40,
  },
  centerCircle: {
    width: CENTER_CIRCLE_SIZE,
    height: CENTER_CIRCLE_SIZE,
    borderRadius: CENTER_CIRCLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dragText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 2,
  },
  optionCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    borderWidth: 2,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  optionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
  },
  spacer: {
    height: 200,
  },
});