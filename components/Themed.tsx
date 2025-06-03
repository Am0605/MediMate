/**
 * Medical Blue Theme
 * A professional medical theme based on blue color palettes.
 */

import { 
  Text as DefaultText, 
  View as DefaultView, 
  TouchableOpacity as DefaultTouchableOpacity,
  ScrollView as DefaultScrollView,
  TextInput as DefaultTextInput,
  StyleSheet
} from 'react-native';
import * as React from 'react';

import Colors from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type TouchableOpacityProps = ThemeProps & DefaultTouchableOpacity['props'];
export type ScrollViewProps = ThemeProps & DefaultScrollView['props'];
export type TextInputProps = ThemeProps & DefaultTextInput['props'];

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function Card(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'card');
  const borderColor = useThemeColor({ light: lightColor, dark: darkColor }, 'border');

  return (
    <DefaultView 
      style={[
        styles.card,
        { backgroundColor, borderColor },
        style
      ]} 
      {...otherProps} 
    />
  );
}

export function TouchableOpacity(props: TouchableOpacityProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <DefaultTouchableOpacity 
      style={[{ backgroundColor }, style]} 
      {...otherProps} 
    />
  );
}

export function PrimaryButton(props: TouchableOpacityProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'tint');

  return (
    <DefaultTouchableOpacity 
      style={[styles.primaryButton, { backgroundColor }, style]} 
      {...otherProps} 
    />
  );
}

export function ScrollView(props: ScrollViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <DefaultScrollView 
      style={[{ backgroundColor }, style]} 
      {...otherProps} 
    />
  );
}

export function TextInput(props: TextInputProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const backgroundColor = useThemeColor({ light: '#F5F9FC', dark: '#132F4C' }, 'subtle');
  const borderColor = useThemeColor({ light: lightColor, dark: darkColor }, 'border');

  return (
    <DefaultTextInput 
      style={[
        styles.input, 
        { 
          color,
          backgroundColor,
          borderColor,
        }, 
        style
      ]} 
      placeholderTextColor={Colors[useColorScheme() ?? 'light'].tabIconDefault}
      {...otherProps} 
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    borderWidth: 1,
  },
  primaryButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  }
});
