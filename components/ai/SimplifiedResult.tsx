import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Share, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { ProcessedDocument } from '@/app/(ai)/medsimplify';
import * as Haptics from 'expo-haptics';

interface SimplifiedResultProps {
  processedDocument: ProcessedDocument;
  onSave: () => void;
  onStartOver: () => void;
}

export default function SimplifiedResult({ 
  processedDocument, 
  onSave, 
  onStartOver 
}: SimplifiedResultProps) {
  const colorScheme = useColorScheme();
  const [activeTab, setActiveTab] = useState<'simplified' | 'original'>('simplified');

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const shareContent = `MedSimplify Result\n\nOriginal Document Type: ${processedDocument.documentType}\nDate: ${processedDocument.timestamp.toLocaleDateString()}\n\nSimplified Version:\n${processedDocument.simplifiedText}`;
      
      await Share.share({
        message: shareContent,
        title: 'MedSimplify Result',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const formatDocumentType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <View style={styles.container}>
      {/* Document Info Card */}
      <View style={[styles.infoCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
        <View style={styles.infoHeader}>
          <View style={styles.documentInfo}>
            <Text style={[styles.documentType, { color: Colors[colorScheme ?? 'light'].text }]}>
              {formatDocumentType(processedDocument.documentType)}
            </Text>
            <Text style={[styles.timestamp, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Processed on {processedDocument.timestamp.toLocaleDateString()} at {processedDocument.timestamp.toLocaleTimeString()}
            </Text>
          </View>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Ionicons name="share-outline" size={20} color={Colors[colorScheme ?? 'light'].tint} />
          </TouchableOpacity>
        </View>

        {/* Document Image Preview */}
        <Image source={{ uri: processedDocument.imageUri }} style={styles.documentImage} />
      </View>

      {/* Tab Switcher */}
      <View style={[styles.tabContainer, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'simplified' && { backgroundColor: Colors[colorScheme ?? 'light'].tint }
          ]}
          onPress={() => {
            setActiveTab('simplified');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Ionicons 
            name="sparkles" 
            size={16} 
            color={activeTab === 'simplified' ? 'white' : Colors[colorScheme ?? 'light'].textSecondary} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'simplified' ? 'white' : Colors[colorScheme ?? 'light'].textSecondary }
          ]}>
            Simplified
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'original' && { backgroundColor: Colors[colorScheme ?? 'light'].tint }
          ]}
          onPress={() => {
            setActiveTab('original');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Ionicons 
            name="document-text" 
            size={16} 
            color={activeTab === 'original' ? 'white' : Colors[colorScheme ?? 'light'].textSecondary} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'original' ? 'white' : Colors[colorScheme ?? 'light'].textSecondary }
          ]}>
            Original
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {activeTab === 'simplified' ? (
            <View>
              <View style={styles.contentHeader}>
                <Ionicons name="sparkles" size={20} color="#059669" />
                <Text style={[styles.contentTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Simplified Version
                </Text>
              </View>
              <Text style={[styles.contentText, { color: Colors[colorScheme ?? 'light'].text }]}>
                {processedDocument.simplifiedText}
              </Text>
              
              {/* Health Tips Section */}
              {processedDocument.healthTips && processedDocument.healthTips.length > 0 && (
                <View style={[styles.healthTipsContainer,
                  { borderTopColor: Colors[colorScheme ?? 'light'].border + '50' }
                ]}>
                  <View style={styles.contentHeader}>
                    <Ionicons name="heart" size={20} color="#DC2626" />
                    <Text style={[styles.contentTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                      Health Tips
                    </Text>
                  </View>
                  {processedDocument.healthTips.map((tip, index) => (
                    <View key={index} style={styles.tipItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#059669" />
                      <Text style={[styles.tipText, { color: Colors[colorScheme ?? 'light'].text }]}>
                        {tip}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Diagnosis Section if available */}
              {processedDocument.diagnosis && (
                <View style={[styles.diagnosisContainer,
                  { borderTopColor: Colors[colorScheme ?? 'light'].border + '50' }
                ]}>
                  <View style={styles.contentHeader}>
                    <Ionicons name="medical" size={20} color="#4F46E5" />
                    <Text style={[styles.contentTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                      Key Diagnosis
                    </Text>
                  </View>
                  <Text style={[styles.contentText, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {processedDocument.diagnosis}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View>
              <View style={styles.contentHeader}>
                <Ionicons name="document-text" size={20} color="#4F46E5" />
                <Text style={[styles.contentTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Original Text
                </Text>
              </View>
              <Text style={[styles.contentText, { color: Colors[colorScheme ?? 'light'].text }]}>
                {processedDocument.originalText}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: Colors[colorScheme ?? 'light'].border }]}
          onPress={onStartOver}
        >
          <Ionicons name="refresh" size={16} color={Colors[colorScheme ?? 'light'].text} />
          <Text style={[styles.secondaryButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Start Over
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
          onPress={onSave}
        >
          <Ionicons name="bookmark" size={16} color="white" />
          <Text style={styles.primaryButtonText}>
            Save Document
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentType: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.7,
  },
  shareButton: {
    padding: 8,
    borderRadius: 20,
  },
  documentImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  contentCard: {
    borderRadius: 16,
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  contentText: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 8,
  },
  healthTipsContainer: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  diagnosisContainer: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
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
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});