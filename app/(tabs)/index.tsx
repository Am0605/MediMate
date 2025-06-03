import { StyleSheet } from 'react-native';

import HomeScreen from '@/components/HomeScreen';
import {View } from '@/components/Themed';

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <HomeScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: -50, 
  }
});
