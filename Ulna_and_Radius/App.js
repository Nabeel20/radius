import React from 'react';
import {StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Game from './Game';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.main}>
      <Game />
    </GestureHandlerRootView>
  );
}
const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
});
