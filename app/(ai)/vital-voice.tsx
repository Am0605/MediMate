import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function VitalVoice() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const colorScheme = useColorScheme();

  const handleStartRecording = () => {
    setIsRecording(true);
    // Implement voice recording logic
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
    }, 3000);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={[styles.card, { backgroundColor: Colors[colorScheme].card }]}>
          <View style={styles.header}>
            <Ionicons name="mic" size={32} color={Colors[colorScheme].tint} />
            <Text style={[styles.title, { color: Colors[colorScheme].text }]}>
              Vital Voice
            </Text>
            <Text style={[styles.subtitle, { color: Colors[colorScheme].textSecondary }]}>
              Voice-powered health monitoring and analysis
            </Text>
          </View>

          <View style={styles.recordingSection}>
            <TouchableOpacity
              style={[
                styles.recordButton,
                { 
                  backgroundColor: isRecording ? '#ff4444' : Colors[colorScheme].tint,
                  transform: [{ scale: isRecording ? 1.1 : 1 }]
                }
              ]}
              onPress={isRecording ? handleStopRecording : handleStartRecording}
              disabled={isProcessing}
            >
              <Ionicons 
                name={isRecording ? "stop" : "mic"} 
                size={32} 
                color="#fff" 
              />
            </TouchableOpacity>
            
            <Text style={[styles.recordingText, { color: Colors[colorScheme].text }]}>
              {isProcessing ? 'Processing...' : 
               isRecording ? 'Recording... Tap to stop' : 
               'Tap to start recording'}
            </Text>
          </View>

          {isProcessing && (
            <View style={styles.processingIndicator}>
              <Ionicons name="sync" size={24} color={Colors[colorScheme].tint} />
              <Text style={[styles.processingText, { color: Colors[colorScheme].textSecondary }]}>
                Analyzing your voice patterns...
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
    textAlign: 'center',
  },
  recordingSection: {
    alignItems: 'center',
    marginVertical: 40,
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  processingIndicator: {
    alignItems: 'center',
    marginTop: 20,
  },
  processingText: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
});