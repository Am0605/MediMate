import React, { useState } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import DocumentUploader from '@/components/ai/DocumentUploader';
import SimplifiedResult from '@/components/ai/SimplifiedResult';
import LoadingIndicator from '@/components/ai/LoadingIndicator';
import { geminiService } from '@/services/geminiService';
import { ocrService } from '@/services/ocrService';
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
}

export default function MedSimplifyScreen() {
  const colorScheme = useColorScheme();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedDocument, setProcessedDocument] = useState<ProcessedDocument | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'extracting' | 'simplifying' | 'complete'>('upload');

  const handleDocumentSelected = async (imageUri: string, documentType: string) => {
    try {
      setIsProcessing(true);
      setCurrentStep('extracting');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Step 1: Extract text using OCR
      const extractedText = await ocrService.extractTextFromImage(imageUri);
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text found in the document. Please try with a clearer image.');
      }

      setCurrentStep('simplifying');

      // Step 2: Simplify using Gemini AI with enhanced prompt
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
        documentType
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

  // Update the main container to handle dynamic content better
  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }} // Add this for better scrolling
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

// Update the styles for better scrolling
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
});