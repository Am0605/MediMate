import React, { useState } from 'react';
import { StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import DocumentUploader from '@/components/ai/DocumentUploader';
import SimplifiedResult from '@/components/ai/SimplifiedResult';
import LoadingIndicator from '@/components/ai/LoadingIndicator';
import { geminiService } from '@/services/geminiService';
import { ocrService, OCRProvider } from '@/services/ocrService';
import { documentStorage } from '@/services/documentStorage';
import * as Haptics from 'expo-haptics';

export interface ProcessedDocument {
  id: string;
  originalText: string;
  simplifiedText: string;
  healthTips: string[];
  diagnosis?: string;
  imageUri: string;
  timestamp: Date;
  documentType: string;
  ocrProvider: OCRProvider;
}

export default function MedSimplifyScreen() {
  const colorScheme = useColorScheme();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedDocument, setProcessedDocument] = useState<ProcessedDocument | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'extracting' | 'simplifying' | 'complete'>('upload');
  const [selectedOCRProvider, setSelectedOCRProvider] = useState<OCRProvider>('ocr_space');
  const [showOCROptions, setShowOCROptions] = useState(false);

  const availableProviders = ocrService.getAvailableProviders();

  const handleDocumentSelected = async (imageUri: string, documentType: string) => {
    try {
      setIsProcessing(true);
      setCurrentStep('extracting');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Step 1: Extract text using OCR with selected provider
      const extractedText = await ocrService.extractTextFromImage(imageUri, selectedOCRProvider);
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text found in the document. Please try with a clearer image.');
      }

      setCurrentStep('simplifying');

      // Step 2: Simplify using Gemini AI
      const result = await geminiService.simplifyMedicalDocument(extractedText, documentType);

      // Step 3: Create processed document
      const processedDoc: ProcessedDocument = {
        id: Date.now().toString(),
        originalText: extractedText,
        simplifiedText: result.simplifiedText,
        healthTips: result.healthTips,
        diagnosis: result.diagnosis,
        imageUri,
        timestamp: new Date(),
        documentType,
        ocrProvider: selectedOCRProvider
      };

      setProcessedDocument(processedDoc);
      setCurrentStep('complete');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    } catch (error) {
      console.error('Document processing error:', error);
      Alert.alert(
        'Processing Error',
        error instanceof Error ? error.message : 'Failed to process document. Please try again.',
        [{ text: 'OK' }]
      );
      setCurrentStep('upload');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveDocument = async () => {
    if (!processedDocument) return;

    try {
      await documentStorage.saveProcessedDocument(processedDocument);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Document Saved',
        'Your simplified document has been saved successfully.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert(
        'Save Error',
        'Failed to save document. Please try again.',
        [{ text: 'OK' }]
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleStartOver = () => {
    setProcessedDocument(null);
    setCurrentStep('upload');
    setIsProcessing(false);
  };

  const handleOCRProviderSelect = (provider: OCRProvider) => {
    setSelectedOCRProvider(provider);
    setShowOCROptions(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getOCRProviderInfo = (provider: OCRProvider) => {
    switch (provider) {
      case 'ocr_space':
        return {
          name: 'OCR.space',
          description: 'Free service (1MB limit)',
          icon: 'document-text' as const,
          color: '#4F46E5',
        };
      case 'google_cloud_vision':
        return {
          name: 'Google Cloud Vision',
          description: 'High accuracy (20MB limit)',
          icon: 'cloud' as const,
          color: '#059669',
        };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
            MedSimplify
          </Text>
          <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Transform complex medical documents into easy-to-understand language
          </Text>
        </View>

        {/* OCR Provider Selection */}
        {currentStep === 'upload' && !processedDocument && (
          <View style={[styles.ocrSection, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <TouchableOpacity
              style={styles.ocrSelector}
              onPress={() => setShowOCROptions(!showOCROptions)}
            >
              <View style={styles.ocrSelectorContent}>
                <Ionicons 
                  name={getOCRProviderInfo(selectedOCRProvider).icon} 
                  size={20} 
                  color={getOCRProviderInfo(selectedOCRProvider).color} 
                />
                <View style={styles.ocrInfo}>
                  <Text style={[styles.ocrName, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {getOCRProviderInfo(selectedOCRProvider).name}
                  </Text>
                  <Text style={[styles.ocrDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    {getOCRProviderInfo(selectedOCRProvider).description}
                  </Text>
                </View>
              </View>
              <Ionicons 
                name={showOCROptions ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={Colors[colorScheme ?? 'light'].textSecondary} 
              />
            </TouchableOpacity>

            {showOCROptions && (
              <View style={styles.ocrOptions}>
                {availableProviders.map((providerInfo) => (
                  <TouchableOpacity
                    key={providerInfo.provider}
                    style={[
                      styles.ocrOption,
                      !providerInfo.available && styles.ocrOptionDisabled,
                      selectedOCRProvider === providerInfo.provider && {
                        backgroundColor: Colors[colorScheme ?? 'light'].tint + '20'
                      }
                    ]}
                    onPress={() => providerInfo.available && handleOCRProviderSelect(providerInfo.provider)}
                    disabled={!providerInfo.available}
                  >
                    <Ionicons 
                      name={getOCRProviderInfo(providerInfo.provider).icon} 
                      size={18} 
                      color={providerInfo.available ? 
                        getOCRProviderInfo(providerInfo.provider).color : 
                        Colors[colorScheme ?? 'light'].textSecondary
                      } 
                    />
                    <View style={styles.ocrOptionContent}>
                      <Text style={[
                        styles.ocrOptionName, 
                        { color: providerInfo.available ? 
                          Colors[colorScheme ?? 'light'].text : 
                          Colors[colorScheme ?? 'light'].textSecondary 
                        }
                      ]}>
                        {providerInfo.name}
                      </Text>
                      <Text style={[styles.ocrOptionDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        {getOCRProviderInfo(providerInfo.provider).description}
                        {!providerInfo.available && ' (Not configured)'}
                      </Text>
                    </View>
                    {selectedOCRProvider === providerInfo.provider && (
                      <Ionicons 
                        name="checkmark-circle" 
                        size={20} 
                        color={Colors[colorScheme ?? 'light'].tint} 
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Content based on current step */}
        {currentStep === 'upload' && !processedDocument && (
          <DocumentUploader onDocumentSelected={handleDocumentSelected} />
        )}

        {isProcessing && ['extracting', 'simplifying'].includes(currentStep) && (
          <LoadingIndicator step={currentStep as 'extracting' | 'simplifying'} />
        )}

        {processedDocument && currentStep === 'complete' && (
          <SimplifiedResult
            processedDocument={processedDocument}
            onSave={handleSaveDocument}
            onStartOver={handleStartOver}
          />
        )}
      </ScrollView>
    </View>
  );
}

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
  ocrSection: {
    margin: 20,
    borderRadius: 16,
    padding: 16,
  },
  ocrSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ocrSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ocrInfo: {
    marginLeft: 12,
    flex: 1,
  },
  ocrName: {
    fontSize: 16,
    fontWeight: '600',
  },
  ocrDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  ocrOptions: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  ocrOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  ocrOptionDisabled: {
    opacity: 0.5,
  },
  ocrOptionContent: {
    marginLeft: 12,
    flex: 1,
  },
  ocrOptionName: {
    fontSize: 14,
    fontWeight: '500',
  },
  ocrOptionDescription: {
    fontSize: 11,
    marginTop: 2,
  },
});