import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

interface OptionSelectorProps {
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  required?: boolean;
}

export default function OptionSelector({
  title,
  options,
  selectedValue,
  onSelect,
  required = false
}: OptionSelectorProps) {
  const colorScheme = useColorScheme();

  return (
    <View style={styles.selectorContainer}>
      <Text style={[styles.selectorLabel, { color: Colors[colorScheme].text }]}>
        {title} {required && '*'}
      </Text>
      <View style={styles.optionsGrid}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              { 
                backgroundColor: selectedValue === option 
                  ? Colors[colorScheme].tint 
                  : Colors[colorScheme].card,
                borderColor: selectedValue === option 
                  ? Colors[colorScheme].tint 
                  : Colors[colorScheme].border,
              }
            ]}
            onPress={() => onSelect(option)}
          >
            <Text
              style={[
                styles.optionText,
                { 
                  color: selectedValue === option 
                    ? '#fff' 
                    : Colors[colorScheme].text 
                }
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  selectorContainer: {
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});