import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { HealthEntry } from '@/types/healthProfile';

type HealthEntriesProps = {
  entries: HealthEntry[];
};

export default function HealthEntries({ entries }: HealthEntriesProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'voice' | 'document' | 'ai'>('all');

  const filters = [
    { key: 'all', label: 'All', icon: 'apps' },
    { key: 'voice', label: 'Voice Logs', icon: 'mic' },
    { key: 'document', label: 'Documents', icon: 'document-text' },
    { key: 'ai', label: 'AI Responses', icon: 'sparkles' },
  ];

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'voice': return { icon: 'mic', color: '#4CAF50' };
      case 'document': return { icon: 'document-text', color: '#2196F3' };
      case 'symptom_checker': return { icon: 'search', color: '#FF9800' };
      case 'med_simplify': return { icon: 'medkit', color: '#9C27B0' };
      default: return { icon: 'information-circle', color: Colors[colorScheme].tint };
    }
  };

  const filteredEntries = selectedFilter === 'all' 
    ? entries 
    : entries.filter(entry => {
        if (selectedFilter === 'ai') {
          return entry.type === 'symptom_checker' || entry.type === 'med_simplify';
        }
        return entry.type === selectedFilter;
      });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderEntry = ({ item }: { item: HealthEntry }) => {
    const entryInfo = getEntryIcon(item.type);
    
    return (
      <TouchableOpacity style={[styles.entryCard, { backgroundColor: isDark ? '#0A1929' : '#FFFFFF' }]}>
        <View style={[styles.entryIconContainer, { backgroundColor: entryInfo.color + '20' }]}>
          <Ionicons name={entryInfo.icon as any} size={20} color={entryInfo.color} />
        </View>
        
        <View style={styles.entryContent}>
          <Text style={[styles.entryTitle, { color: Colors[colorScheme].text }]}>
            {item.title}
          </Text>
          <Text style={[styles.entryDescription, { color: isDark ? '#A0B4C5' : '#666666' }]} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={[styles.entryDate, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
        
        <Ionicons name="chevron-forward" size={16} color={isDark ? '#A0B4C5' : '#C0C0C0'} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].card }]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Health Entries</Text>
        <TouchableOpacity>
          <Text style={{ color: Colors[colorScheme].tint }}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              selectedFilter === filter.key && { backgroundColor: Colors[colorScheme].tint + '20' }
            ]}
            onPress={() => setSelectedFilter(filter.key as any)}
          >
            <Ionicons 
              name={filter.icon as any} 
              size={16} 
              color={selectedFilter === filter.key ? Colors[colorScheme].tint : (isDark ? '#A0B4C5' : '#666666')} 
            />
            <Text style={[
              styles.filterText,
              { color: selectedFilter === filter.key ? Colors[colorScheme].tint : (isDark ? '#A0B4C5' : '#666666') }
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Entries List */}
      {filteredEntries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons 
            name="document-outline" 
            size={48} 
            color={isDark ? '#1E3A5F' : '#e0e0e0'} 
          />
          <Text style={[styles.emptyText, { color: isDark ? '#A0B4C5' : '#757575' }]}>
            No entries found for the selected filter.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredEntries.slice(0, 5)} // Show only first 5 entries
          renderItem={renderEntry}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  entryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  entryContent: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  entryDescription: {
    fontSize: 12,
    marginBottom: 4,
  },
  entryDate: {
    fontSize: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 14,
  },
});