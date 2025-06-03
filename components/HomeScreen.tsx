import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, View, Card } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const { width: screenWidth } = Dimensions.get('window');

// Mock data for health news
const healthNews = [
  {
    id: '1',
    title: 'New Research on Medication Adherence',
    summary: 'Study shows that proper medication tracking can increase medical adherence by up to 40%.',
    image: require('@/assets/images/news1.jpeg'),
    date: 'June 2, 2025'
  },
  {
    id: '2',
    title: 'Health Ministry Updates Vaccination Schedule',
    summary: 'New guidelines released for adult vaccination schedules. Check if you\'re up to date!',
    image: require('@/assets/images/news2.jpg'),
    date: 'June 1, 2025'
  },
  {
    id: '3',
    title: 'Seasonal Allergies: Be Prepared',
    summary: 'Tips to manage your medication during high pollen season.',
    image: require('@/assets/images/news3.jpeg'),
    date: 'May 29, 2025'
  }
];

// App features showcase
const appFeatures = [
  {
    id: '1',
    title: 'Medication Tracking',
    description: 'Never miss a dose with our smart reminders',
    icon: 'medical',
    route: '/(tabs)/medication'
  },
  {
    id: '2',
    title: 'Appointments',
    description: 'Keep track of your doctor appointments',
    icon: 'calendar',
    route: '/(tabs)/calendar'
  },
  {
    id: '3',
    title: 'Health Articles',
    description: 'Stay informed with the latest health news',
    icon: 'newspaper',
    route: '/(tabs)/index'
  },
  {
    id: '4',
    title: 'Health Profile',
    description: 'Manage your health information in one place',
    icon: 'person',
    route: '/(setting)/profile'
  }
];

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  
  useEffect(() => {
    // Simulate initial data loading
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate a refresh action
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
        <Text style={styles.loadingText}>Loading health updates...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors[colorScheme].background }]}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Good Morning,</Text>
          <Text style={styles.userName}>User</Text>
        </View>

        <TouchableOpacity style={styles.notificationIcon}>
          <Ionicons name="notifications" size={24} color={Colors[colorScheme].text} />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationCount}>2</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Quick Access Section */}
      <Text style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>
        Quick Access
      </Text>
      <View style={styles.quickAccessContainer}>
        {appFeatures.map(feature => (
          <TouchableOpacity 
            key={feature.id}
            style={[styles.featureCard, { backgroundColor: Colors[colorScheme].card }]}
            onPress={() => router.push(feature.route)}
          >
            <View style={[styles.iconContainer, { backgroundColor: Colors[colorScheme].tint + '20' }]}>
              <Ionicons name={feature.icon as any} size={24} color={Colors[colorScheme].tint} />
            </View>
            <Text style={[styles.featureTitle, { color: Colors[colorScheme].text }]}>
              {feature.title}
            </Text>
            <Text style={[styles.featureDescription, { color: isDark ? '#A0B4C5' : '#666' }]} numberOfLines={2}>
              {feature.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Health News Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>
          Health Updates
        </Text>
        <TouchableOpacity>
          <Text style={[styles.viewAllText, { color: Colors[colorScheme].tint }]}>
            View All
          </Text>
        </TouchableOpacity>
      </View>

      {/* News Cards */}
      {healthNews.map(news => (
        <Card key={news.id} style={styles.newsCard}>
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
            <Text style={[styles.newsSummary, { color: isDark ? '#A0B4C5' : '#666' }]}>
              {news.summary}
            </Text>
            <TouchableOpacity style={styles.readMoreButton}>
              <Text style={{ color: Colors[colorScheme].tint }}>Read more</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors[colorScheme].tint} />
            </TouchableOpacity>
          </View>
        </Card>
      ))}

      {/* Health Tip of the Day */}
      <Card style={[styles.tipCard, { borderColor: Colors[colorScheme].tint + '50' }]}>
        <View style={[styles.tipIconContainer, { backgroundColor: Colors[colorScheme].tint + '20' }]}>
          <Ionicons name="bulb" size={24} color={Colors[colorScheme].tint} />
        </View>
        <View style={styles.tipContent}>
          <Text style={[styles.tipTitle, { color: Colors[colorScheme].text }]}>
            Tip of the Day
          </Text>
          <Text style={[styles.tipText, { color: isDark ? '#A0B4C5' : '#666' }]}>
            Drinking enough water helps your body absorb medications properly. Aim for 8 glasses daily!
          </Text>
        </View>
      </Card>

      {/* Bottom padding */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    opacity: 0.7,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  notificationIcon: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    right: 5,
    top: 5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 14,
  },
  quickAccessContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  featureCard: {
    width: screenWidth / 2 - 25,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  newsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
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
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  newsSummary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  tipCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 15,
    borderLeftWidth: 4,
    borderRadius: 12,
  },
  tipIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
