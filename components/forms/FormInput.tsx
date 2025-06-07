import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  icon?: string;
  required?: boolean;
  editable?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  helperText?: string;
  onPress?: () => void;
  rightIcon?: string;
  flex?: number;
}

export default function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  required = false,
  editable = true,
  keyboardType = 'default',
  helperText,
  onPress,
  rightIcon,
  flex
}: FormInputProps) {
  const colorScheme = useColorScheme();

  const InputComponent = onPress ? TouchableOpacity : View;

  return (
    <View style={[styles.formGroup, flex !== undefined ? { flex } : undefined]}>
      <Text style={[styles.label, { color: Colors[colorScheme].text }]}>
        {label} {required && '*'}
      </Text>
      <InputComponent
        style={[styles.inputContainer, { backgroundColor: Colors[colorScheme].background }]}
        onPress={onPress}
      >
        {icon && (
          <Ionicons name={icon as any} size={20} color={Colors[colorScheme].textSecondary} />
        )}
        {onPress ? (
          <Text style={[styles.dateText, { color: Colors[colorScheme].text }]}>
            {value || placeholder}
          </Text>
        ) : (
          <TextInput
            style={[styles.input, { color: editable ? Colors[colorScheme].text : Colors[colorScheme].textSecondary }]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={Colors[colorScheme].textSecondary}
            editable={editable}
            keyboardType={keyboardType}
          />
        )}
        {rightIcon && (
          <Ionicons name={rightIcon as any} size={20} color={Colors[colorScheme].textSecondary} />
        )}
      </InputComponent>
      {helperText && (
        <Text style={[styles.helperText, { color: Colors[colorScheme].textSecondary }]}>
          {helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    paddingVertical: 8,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    paddingVertical: 8,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
});