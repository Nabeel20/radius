import React from 'react';
import {StyleSheet, View} from 'react-native';
import Game from './Game';

export default function App() {
  return (
    <View style={styles.main}>
      <Game />
    </View>
  );
}
const styles = StyleSheet.create({
  main: {
    flex: 1,
    height: '100%',
  },
});
