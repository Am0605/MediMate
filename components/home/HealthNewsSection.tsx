import React from 'react';
import { StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, Card } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { HealthNewsItem } from '@/types/home';
import * as Haptics from 'expo-haptics';

type HealthNewsSectionProps = {
  healthNews: HealthNewsItem[];
  loading: boolean;
};

export default function HealthNewsSection({ healthNews, loading }: HealthNewsSectionProps) {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  
  const handleViewAllPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/news');
  };

  const handleNewsPress = (newsId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(tabs)/news/${newsId}`);
  };
  
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>
          Health Updates
        </Text>
        <TouchableOpacity onPress={handleViewAllPress}>
          <Text style={[styles.viewAllText, { color: Colors[colorScheme].tint }]}>
            View All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme].text }]}>
            Loading health updates...
          </Text>
        </View>
      ) : (
        /* News Cards */
        healthNews.map(news => (
          <NewsCard
            key={news.id}
            news={news}
            onPress={() => handleNewsPress(news.id)}
          />
        ))
      )}
    </View>
  );
}

// Sub-component for individual news cards
function NewsCard({ news, onPress }: { news: HealthNewsItem; onPress: () => void }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Card style={styles.newsCard}>
      <Image 
        source={news.image} 
        style={styles.newsImage}
        resizeMode="cover"
      />
      <View style={[styles.newsContent, { backgroundColor: Colors[colorScheme].card }]}>
        <Text style={[styles.newsDate, { color: isDark ? '#A0B4C5' : '#666' }]}>
          {news.date}
        </Text>
        <Text style={[styles.newsTitle, { color: Colors[colorScheme].text }]}>
          {news.title}
        </Text>
        <Text style={[styles.newsSummary, { color: isDark ? '#A0B4C5' : '#666' }]} numberOfLines={3}>
          {news.summary}
        </Text>

        <TouchableOpacity 
          style={styles.readMoreButton}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Text style={[styles.readMoreText, { color: Colors[colorScheme].tint }]}>
            Read more
          </Text>
          <Ionicons name="chevron-forward" size={14} color={Colors[colorScheme].tint} />
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  newsCard: {
    marginHorizontal: 20,
    marginBottom: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  newsImage: {
    width: '100%',
    height: 150,
  },
  newsContent: {
    padding: 15,
  },
  newsDate: {
    fontSize: 12,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 24,
  },
  newsSummary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
});