import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, ScrollView, Alert, TouchableOpacity, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { geminiService } from '@/services/geminiService';
import SymptomLoadingIndicator from '@/components/ai/SymptomLoadingIndicator';
import SymptomAnalysisResult from '@/components/ai/SymptomAnalysisResult';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

interface SymptomData {
  symptoms: string[];
  customSymptoms: string;
  duration: string;
  severity: 'mild' | 'moderate' | 'severe';
  additionalInfo: string;
  hasVisibleSymptoms: boolean;
  imageUri?: string;
}

interface SymptomAnalysis {
  assessment: string;
  possibleConditions: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  recommendations: string[];
  disclaimerText: string;
}

// Enhanced symptom data with proper icons
const commonSymptoms = [
  { 
    id: 'fever', 
    label: 'Fever', 
    icon: 'thermometer-outline',
    iconFamily: 'ionicons',
    color: '#DC2626'
  },
  { 
    id: 'headache', 
    label: 'Headache', 
    icon: 'head-side-cough',
    iconFamily: 'fontawesome5',
    color: '#7C2D12'
  },
  { 
    id: 'cough', 
    label: 'Cough', 
    icon: 'sick',
    iconFamily: 'materialicons',
    color: '#B45309'
  },
  { 
    id: 'sore_throat', 
    label: 'Sore Throat', 
    icon: 'healing',
    iconFamily: 'materialicons',
    color: '#BE185D'
  },
  { 
    id: 'fatigue', 
    label: 'Fatigue', 
    icon: 'battery-dead-outline',
    iconFamily: 'ionicons',
    color: '#374151'
  },
  { 
    id: 'nausea', 
    label: 'Nausea', 
    icon: 'no-food',
    iconFamily: 'materialicons',
    color: '#059669'
  },
  { 
    id: 'dizziness', 
    label: 'Dizziness', 
    icon: 'psychology',
    iconFamily: 'materialicons',
    color: '#7C3AED'
  },
  { 
    id: 'chest_pain', 
    label: 'Chest Pain', 
    icon: 'heart-outline',
    iconFamily: 'ionicons',
    color: '#DC2626'
  },
  { 
    id: 'shortness_breath', 
    label: 'Shortness of Breath', 
    icon: 'lungs',
    iconFamily: 'fontawesome5',
    color: '#0284C7'
  },
  { 
    id: 'abdominal_pain', 
    label: 'Abdominal Pain', 
    icon: 'body-outline',
    iconFamily: 'ionicons',
    color: '#EA580C'
  },
  { 
    id: 'muscle_pain', 
    label: 'Muscle Pain', 
    icon: 'fitness-outline',
    iconFamily: 'ionicons',
    color: '#16A34A'
  },
  { 
    id: 'joint_pain', 
    label: 'Joint Pain', 
    icon: 'bone',
    iconFamily: 'fontawesome5',
    color: '#CA8A04'
  },
  { 
    id: 'skin_rash', 
    label: 'Skin Rash', 
    icon: 'medical-outline',
    iconFamily: 'ionicons',
    color: '#DB2777'
  },
  { 
    id: 'swelling', 
    label: 'Swelling', 
    icon: 'water-outline',
    iconFamily: 'ionicons',
    color: '#0891B2'
  },
  { 
    id: 'others', 
    label: 'Others', 
    icon: 'ellipsis-horizontal',
    iconFamily: 'ionicons',
    color: '#6B7280'
  },
];

const durationOptions = [
  { value: 'less_than_1_day', label: 'Less than 1 day' },
  { value: '1_3_days', label: '1-3 days' },
  { value: '4_7_days', label: '4-7 days' },
  { value: '1_2_weeks', label: '1-2 weeks' },
  { value: 'more_than_2_weeks', label: 'More than 2 weeks' },
];

// Memoized symptom button component for better performance
const SymptomButton = React.memo(({ 
  symptom, 
  isSelected, 
  onPress, 
  colorScheme 
}: {
  symptom: typeof commonSymptoms[0],
  isSelected: boolean,
  onPress: () => void,
  colorScheme: 'light' | 'dark'
}) => {
  const renderIcon = () => {
    const iconProps = {
      size: 22,
      color: isSelected ? symptom.color : Colors[colorScheme].textSecondary
    };

    switch (symptom.iconFamily) {
      case 'fontawesome5':
        return <FontAwesome5 name={symptom.icon as any} {...iconProps} />;
      case 'materialicons':
        return <MaterialIcons name={symptom.icon as any} {...iconProps} />;
      default:
        return <Ionicons name={symptom.icon as any} {...iconProps} />;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.symptomButton,
        {
          backgroundColor: isSelected
            ? symptom.color + '15'
            : Colors[colorScheme].background,
          borderColor: isSelected
            ? symptom.color
            : Colors[colorScheme].border,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {renderIcon()}
      <Text style={[
        styles.symptomButtonText,
        {
          color: isSelected
            ? symptom.color
            : Colors[colorScheme].text
        }
      ]}>
        {symptom.label}
      </Text>
    </TouchableOpacity>
  );
});

export default function SymptomCheckerScreen() {
  const colorScheme = useColorScheme();
  const [currentStep, setCurrentStep] = useState<'input' | 'analyzing' | 'results'>('input');
  const [symptomData, setSymptomData] = useState<SymptomData>({
    symptoms: [],
    customSymptoms: '',
    duration: '',
    severity: 'mild',
    additionalInfo: '',
    hasVisibleSymptoms: false,
  });
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Optimized symptom toggle with useCallback
  const handleSymptomToggle = useCallback((symptomId: string) => {
    setSymptomData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptomId)
        ? prev.symptoms.filter(id => id !== symptomId)
        : [...prev.symptoms, symptomId]
    }));
    
    // Reduce haptic feedback intensity for Android
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.selectionAsync();
    }
  }, []);

  // Memoized symptoms grid for better performance
  const symptomsGrid = useMemo(() => (
    <View style={styles.symptomsGrid}>
      {commonSymptoms.map((symptom) => (
        <SymptomButton
          key={symptom.id}
          symptom={symptom}
          isSelected={symptomData.symptoms.includes(symptom.id)}
          onPress={() => handleSymptomToggle(symptom.id)}
          colorScheme={colorScheme ?? 'light'}
        />
      ))}
    </View>
  ), [symptomData.symptoms, handleSymptomToggle, colorScheme]);

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
      return;
    }

    Alert.alert(
      'Add Symptom Image',
      'Choose how you want to add an image of your visible symptoms',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Photo Library', onPress: openLibrary },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const openCamera = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    
    if (cameraPermission.status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSymptomData(prev => ({
        ...prev,
        imageUri: result.assets[0].uri
      }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const openLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSymptomData(prev => ({
        ...prev,
        imageUri: result.assets[0].uri
      }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleAnalyzeSymptoms = async () => {
    if (symptomData.symptoms.length === 0 && !symptomData.customSymptoms.trim()) {
      Alert.alert('No Symptoms', 'Please select at least one symptom or describe your symptoms.');
      return;
    }

    setIsAnalyzing(true);
    setCurrentStep('analyzing');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await geminiService.analyzeSymptoms(symptomData);
      setAnalysis(result);
      setCurrentStep('results');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Symptom analysis error:', error);
      Alert.alert(
        'Analysis Error',
        error instanceof Error ? error.message : 'Failed to analyze symptoms. Please try again.',
        [{ text: 'OK' }]
      );
      setCurrentStep('input');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartOver = () => {
    setSymptomData({
      symptoms: [],
      customSymptoms: '',
      duration: '',
      severity: 'mild',
      additionalInfo: '',
      hasVisibleSymptoms: false,
    });
    setAnalysis(null);
    setCurrentStep('input');
  };

  // Show loading indicator
  if (currentStep === 'analyzing') {
    return <SymptomLoadingIndicator step="analyzing" />;
  }

  // Show results
  if (currentStep === 'results' && analysis) {
    return (
      <SymptomAnalysisResult 
        analysis={analysis} 
        onStartOver={handleStartOver}
        onFindDoctors={() => {
          Alert.alert('Feature Coming Soon', 'Find nearby doctors feature will be available soon.');
        }}
      />
    );
  }

  // Show input form (rest of your existing input UI code...)
  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
              Symptom Checker
            </Text>
            <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Describe your symptoms to get AI-powered health insights
            </Text>
          </View>
        </View>

        {/* Common Symptoms */}
        <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: Colors[colorScheme ?? 'light'].tint + '20' }]}>
              <Ionicons name="medical" size={20} color={Colors[colorScheme ?? 'light'].tint} />
            </View>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Select Your Symptoms
            </Text>
          </View>
          {symptomsGrid}
        </View>

        {/* Custom Symptoms */}
        {symptomData.symptoms.includes('others') && (
          <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Describe Other Symptoms
            </Text>
            <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Please describe any additional symptoms you're experiencing
            </Text>
            <View style={[styles.textArea, { borderColor: Colors[colorScheme ?? 'light'].border }]}>
              <Text
                style={[styles.textAreaInput, { color: Colors[colorScheme ?? 'light'].text }]}
                onPress={() => {
                  // This would open a text input modal or navigate to text input screen
                  Alert.prompt(
                    'Describe Symptoms',
                    'Please describe your other symptoms in detail:',
                    (text) => setSymptomData(prev => ({ ...prev, customSymptoms: text || '' })),
                    'plain-text',
                    symptomData.customSymptoms
                  );
                }}
              >
                {symptomData.customSymptoms || 'Tap to describe your symptoms...'}
              </Text>
            </View>
          </View>
        )}

        {/* Duration */}
        <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            How long have you had these symptoms?
          </Text>
          <View style={styles.durationOptions}>
            {durationOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.durationButton,
                  {
                    backgroundColor: symptomData.duration === option.value
                      ? Colors[colorScheme ?? 'light'].tint + '20'
                      : 'transparent',
                    borderColor: symptomData.duration === option.value
                      ? Colors[colorScheme ?? 'light'].tint
                      : Colors[colorScheme ?? 'light'].border,
                  }
                ]}
                onPress={() => {
                  setSymptomData(prev => ({ ...prev, duration: option.value }));
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={[
                  styles.durationButtonText,
                  {
                    color: symptomData.duration === option.value
                      ? Colors[colorScheme ?? 'light'].tint
                      : Colors[colorScheme ?? 'light'].text
                  }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Severity */}
        <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            How severe are your symptoms?
          </Text>
          <View style={styles.severityOptions}>
            {['mild', 'moderate', 'severe'].map((severity) => (
              <TouchableOpacity
                key={severity}
                style={[
                  styles.severityButton,
                  {
                    backgroundColor: symptomData.severity === severity
                      ? Colors[colorScheme ?? 'light'].tint + '20'
                      : 'transparent',
                    borderColor: symptomData.severity === severity
                      ? Colors[colorScheme ?? 'light'].tint
                      : Colors[colorScheme ?? 'light'].border,
                  }
                ]}
                onPress={() => {
                  setSymptomData(prev => ({ ...prev, severity: severity as any }));
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={[
                  styles.severityButtonText,
                  {
                    color: symptomData.severity === severity
                      ? Colors[colorScheme ?? 'light'].tint
                      : Colors[colorScheme ?? 'light'].text
                  }
                ]}>
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Visible Symptoms */}
        <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Do you have any visible symptoms?
          </Text>
          <Text style={[styles.sectionSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Such as rashes, swelling, discoloration, etc.
          </Text>
          
          <View style={styles.visibleSymptomsOptions}>
            <TouchableOpacity
              style={[
                styles.visibleSymptomButton,
                {
                  backgroundColor: symptomData.hasVisibleSymptoms
                    ? Colors[colorScheme ?? 'light'].tint + '20'
                    : 'transparent',
                  borderColor: symptomData.hasVisibleSymptoms
                    ? Colors[colorScheme ?? 'light'].tint
                    : Colors[colorScheme ?? 'light'].border,
                }
              ]}
              onPress={() => {
                setSymptomData(prev => ({ ...prev, hasVisibleSymptoms: true }));
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[
                styles.visibleSymptomButtonText,
                {
                  color: symptomData.hasVisibleSymptoms
                    ? Colors[colorScheme ?? 'light'].tint
                    : Colors[colorScheme ?? 'light'].text
                }
              ]}>
                Yes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.visibleSymptomButton,
                {
                  backgroundColor: !symptomData.hasVisibleSymptoms
                    ? Colors[colorScheme ?? 'light'].tint + '20'
                    : 'transparent',
                  borderColor: !symptomData.hasVisibleSymptoms
                    ? Colors[colorScheme ?? 'light'].tint
                    : Colors[colorScheme ?? 'light'].border,
                }
              ]}
              onPress={() => {
                setSymptomData(prev => ({ ...prev, hasVisibleSymptoms: false, imageUri: undefined }));
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[
                styles.visibleSymptomButtonText,
                {
                  color: !symptomData.hasVisibleSymptoms
                    ? Colors[colorScheme ?? 'light'].tint
                    : Colors[colorScheme ?? 'light'].text
                }
              ]}>
                No
              </Text>
            </TouchableOpacity>
          </View>

          {/* Image Upload for Visible Symptoms */}
          {symptomData.hasVisibleSymptoms && (
            <View style={styles.imageUploadSection}>
              {!symptomData.imageUri ? (
                <TouchableOpacity
                  style={[styles.imageUploadButton, { borderColor: Colors[colorScheme ?? 'light'].border }]}
                  onPress={handleImagePicker}
                >
                  <Ionicons name="camera" size={32} color={Colors[colorScheme ?? 'light'].tint} />
                  <Text style={[styles.imageUploadText, { color: Colors[colorScheme ?? 'light'].tint }]}>
                    Add Photo of Visible Symptoms
                  </Text>
                  <Text style={[styles.imageUploadSubtext, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    This helps our AI provide better analysis
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: symptomData.imageUri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={[styles.removeImageButton, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
                    onPress={() => setSymptomData(prev => ({ ...prev, imageUri: undefined }))}
                  >
                    <Ionicons name="close" size={20} color={Colors[colorScheme ?? 'light'].text} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Additional Information */}
        <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Additional Information (Optional)
          </Text>
          <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Any other relevant details about your symptoms or medical history
          </Text>
          <View style={[styles.textArea, { borderColor: Colors[colorScheme ?? 'light'].border }]}>
            <Text
              style={[styles.textAreaInput, { color: Colors[colorScheme ?? 'light'].text }]}
              onPress={() => {
                Alert.prompt(
                  'Additional Information',
                  'Please provide any additional relevant details:',
                  (text) => setSymptomData(prev => ({ ...prev, additionalInfo: text || '' })),
                  'plain-text',
                  symptomData.additionalInfo
                );
              }}
            >
              {symptomData.additionalInfo || 'Tap to add additional information...'}
            </Text>
          </View>
        </View>

        {/* Analyze Button */}
        <View style={styles.analyzeButtonContainer}>
          <TouchableOpacity
            style={[styles.analyzeButton, { 
              backgroundColor: Colors[colorScheme ?? 'light'].tint,
              opacity: isAnalyzing ? 0.6 : 1
            }]}
            onPress={handleAnalyzeSymptoms}
            disabled={isAnalyzing}
          >
            <Ionicons name="search" size={20} color="white" />
            <Text style={styles.analyzeButtonText}>
              {isAnalyzing ? 'Analyzing...' : 'Analyze Symptoms'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

// Add the rest of your existing styles...
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    opacity: 0.8,
  },
  section: {
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginTop: -8,
    marginBottom: 16,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  symptomButton: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  symptomButtonText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 80,
  },
  textAreaInput: {
    fontSize: 16,
    lineHeight: 22,
  },
  durationOptions: {
    gap: 8,
  },
  durationButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  durationButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  severityOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  severityButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  severityButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  visibleSymptomsOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  visibleSymptomButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  visibleSymptomButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  imageUploadSection: {
    marginTop: 16,
  },
  imageUploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  imageUploadText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  imageUploadSubtext: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
  },
  imagePreview: {
    position: 'relative',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzeButtonContainer: {
    padding: 20,
    paddingTop: 0,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    gap: 8,
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
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
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  urgencyCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
  },
  urgencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  urgencyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  conditionText: {
    fontSize: 16,
    flex: 1,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  recommendationText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  disclaimerCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    margin: 20,
    marginTop: 0,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12, 
    gap: 6,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});