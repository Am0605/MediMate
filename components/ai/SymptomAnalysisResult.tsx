import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

interface SymptomAnalysis {
  assessment: string;
  possibleConditions: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  recommendations: string[];
  disclaimerText: string;
}

interface SymptomAnalysisResultProps {
  analysis: SymptomAnalysis;
  onStartOver: () => void;
  onFindDoctors?: () => void;
}

export default function SymptomAnalysisResult({ 
  analysis, 
  onStartOver, 
  onFindDoctors 
}: SymptomAnalysisResultProps) {
  const colorScheme = useColorScheme();

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const shareContent = `Symptom Analysis Results\n\nUrgency Level: ${analysis.urgencyLevel.toUpperCase()}\n\nAssessment:\n${analysis.assessment}\n\nRecommendations:\n${analysis.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}\n\nDate: ${new Date().toLocaleDateString()}`;
      
      await Share.share({
        message: shareContent,
        title: 'Symptom Analysis Results',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleFindDoctors = () => {
    if (onFindDoctors) {
      onFindDoctors();
    } else {
      Alert.alert('Feature Coming Soon', 'Find nearby doctors feature will be available soon.');
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return '#DC2626';
      case 'high': return '#EA580C';
      case 'medium': return '#D97706';
      case 'low': return '#059669';
      default: return Colors[colorScheme ?? 'light'].text;
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'warning';
      case 'high': return 'alert-circle';
      case 'medium': return 'information-circle';
      case 'low': return 'checkmark-circle';
      default: return 'information-circle';
    }
  };

  const getUrgencyMessage = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'Seek immediate medical attention';
      case 'high': return 'Consider seeing a doctor soon';
      case 'medium': return 'Monitor symptoms and consult if worsening';
      case 'low': return 'Symptoms appear manageable';
      default: return 'Consult healthcare provider if concerned';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
            onPress={onStartOver}
          >
            <Ionicons name="arrow-back" size={24} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
              Analysis Results
            </Text>
            <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              AI-powered health assessment
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.shareButton, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={20} color={Colors[colorScheme ?? 'light'].tint} />
          </TouchableOpacity>
        </View>

        {/* Urgency Level Card */}
        <View style={[styles.urgencyCard, { 
          backgroundColor: Colors[colorScheme ?? 'light'].card,
          borderLeftWidth: 4,
          borderLeftColor: getUrgencyColor(analysis.urgencyLevel)
        }]}>
          <View style={styles.urgencyHeader}>
            <View style={[styles.urgencyIconContainer, { backgroundColor: getUrgencyColor(analysis.urgencyLevel) + '20' }]}>
              <Ionicons 
                name={getUrgencyIcon(analysis.urgencyLevel)} 
                size={28} 
                color={getUrgencyColor(analysis.urgencyLevel)} 
              />
            </View>
            <View style={styles.urgencyContent}>
              <Text style={[styles.urgencyLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Urgency Level
              </Text>
              <Text style={[styles.urgencyTitle, { color: getUrgencyColor(analysis.urgencyLevel) }]}>
                {analysis.urgencyLevel.charAt(0).toUpperCase() + analysis.urgencyLevel.slice(1)}
              </Text>
              <Text style={[styles.urgencyMessage, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {getUrgencyMessage(analysis.urgencyLevel)}
              </Text>
            </View>
          </View>
        </View>

        {/* Assessment Section */}
        <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: '#4F46E5' + '20' }]}>
              <Ionicons name="clipboard" size={20} color="#4F46E5" />
            </View>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Assessment
            </Text>
          </View>
          <Text style={[styles.assessmentText, { color: Colors[colorScheme ?? 'light'].text }]}>
            {analysis.assessment}
          </Text>
        </View>

        {/* Possible Conditions */}
        {analysis.possibleConditions.length > 0 && (
          <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconContainer, { backgroundColor: '#DC2626' + '20' }]}>
                <Ionicons name="list" size={20} color="#DC2626" />
              </View>
              <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Possible Conditions
              </Text>
            </View>
            <Text style={[styles.conditionsNote, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              These are potential conditions that may cause your symptoms:
            </Text>
            <View style={styles.conditionsList}>
              {analysis.possibleConditions.map((condition, index) => (
                <View key={index} style={[styles.conditionItem, { backgroundColor: Colors[colorScheme ?? 'light'].subtle }]}>
                  <View style={[styles.conditionBadge, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}>
                    <Text style={styles.conditionNumber}>{index + 1}</Text>
                  </View>
                  <Text style={[styles.conditionText, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {condition}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recommendations */}
        <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: '#059669' + '20' }]}>
              <Ionicons name="bulb" size={20} color="#059669" />
            </View>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Recommended Actions
            </Text>
          </View>
          <View style={styles.recommendationsList}>
            {analysis.recommendations.map((recommendation, index) => (
              <View key={index} style={styles.recommendationItem}>
                <View style={styles.recommendationIcon}>
                  <Ionicons name="checkmark-circle" size={18} color="#059669" />
                </View>
                <Text style={[styles.recommendationText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {recommendation}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Important Disclaimer */}
        <View style={[styles.disclaimerCard, { 
          backgroundColor: Colors[colorScheme ?? 'light'].card,
          borderWidth: 1,
          borderColor: '#EA580C' + '30'
        }]}>
          <View style={styles.disclaimerHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: '#EA580C' + '20' }]}>
              <Ionicons name="information-circle" size={20} color="#EA580C" />
            </View>
            <Text style={[styles.disclaimerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Important Medical Disclaimer
            </Text>
          </View>
          <Text style={[styles.disclaimerText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            {analysis.disclaimerText}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.secondaryButton, { 
              borderColor: Colors[colorScheme ?? 'light'].border,
              backgroundColor: Colors[colorScheme ?? 'light'].card
            }]}
            onPress={onStartOver}
          >
            <Ionicons name="refresh" size={18} color={Colors[colorScheme ?? 'light'].text} />
            <Text style={[styles.secondaryButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
              New Analysis
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={handleFindDoctors}
          >
            <Ionicons name="location" size={18} color="white" />
            <Text style={styles.primaryButtonText}>
              Find Doctors
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 30 }} />
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  urgencyCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  urgencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgencyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  urgencyContent: {
    flex: 1,
  },
  urgencyLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  urgencyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 2,
  },
  urgencyMessage: {
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
  section: {
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  assessmentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  conditionsNote: {
    fontSize: 14,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  conditionsList: {
    gap: 12,
  },
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  conditionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conditionNumber: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  conditionText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  recommendationsList: {
    gap: 16,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  recommendationIcon: {
    marginTop: 2,
  },
  recommendationText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 24,
  },
  disclaimerCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});