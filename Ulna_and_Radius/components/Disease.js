import React, {useState, useRef} from 'react';
import {StyleSheet, Text} from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  useSharedValue,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import ErrorSound from '../assets/lose.mp3';
import SuccessSound from '../assets/win.mp3';
import Big from '../assets/big.mp3';
import Sound from 'react-native-sound';
Sound.setCategory('Playback');

var Error = new Sound(ErrorSound, () => {});
var Success = new Sound(SuccessSound, () => {});
var BigSound = new Sound(Big, () => {});

const Disease = React.forwardRef(
  (
    {
      disease = 'disease',
      symptoms = [],
      color = 'grey',
      index = 0,
      onLayout = () => {},
    },
    ref,
  ) => {
    const error_animation = useSharedValue(0);
    const opacity_animation = useSharedValue(0);
    const correct_animation = useSharedValue(1);
    const scale_animation = useSharedValue(1);
    const [doneCount, setDone] = useState(0);
    const [localDisease, setLocalDisease] = React.useState(disease);
    const [localSymptoms, setLocalSymptoms] = React.useState(symptoms);
    const [localColor, setLocalColor] = React.useState(color);
    const symptoms_store = useRef([]);

    React.useImperativeHandle(ref, () => ({
      playError() {
        Error.play();
        error_animation.value = 0;
        error_animation.value = withTiming(2);
      },
      check(selectedSymptom = '') {
        if (localSymptoms.includes(selectedSymptom) === false) {
          return false;
        }
        symptoms_store.current = symptoms_store.current.filter(
          item => item !== selectedSymptom,
        );
        scale_animation.value = withSequence(withTiming(1.04), withTiming(1));
        setDone(d => (d += 1));
        if (doneCount === localSymptoms.length - 1) {
          BigSound.play();
          opacity_animation.value = 0;
          opacity_animation.value = withTiming(1);
          symptoms_store.current = [];
          return 'finished';
        }
        Success.play();
        return true;
      },
      init(updateData) {
        setLocalDisease(updateData.disease);
        setLocalSymptoms(updateData.symptoms);
        setLocalColor(updateData.color);
        symptoms_store.current = updateData.symptoms;
        opacity_animation.value = withSequence(
          withTiming(0, {duration: 0}),
          withTiming(1, {
            duration: index * 450 + 350,
          }),
        );
        setDone(0);
      },
      flashRight() {
        correct_animation.value = withSequence(
          withTiming(0, {duration: 100}),
          withTiming(1, {duration: 100}),
          withTiming(0, {duration: 100}),
          withTiming(1, {duration: 100}),
        );
      },
      hide() {
        opacity_animation.value = withTiming(0);
      },
      getCurrentSymptoms() {
        return symptoms_store.current;
      },
    }));
    const container_animation = useAnimatedStyle(() => {
      return {
        opacity: opacity_animation.value,
        transform: [
          {
            translateX: interpolate(
              error_animation.value,
              [0, 0.5, 1, 1.5, 2],
              [0, -15, 0, 15, 0],
            ),
          },
          {scale: scale_animation.value},
        ],
      };
    });
    const correct_animated = useAnimatedStyle(() => {
      return {
        opacity: correct_animation.value,
      };
    });

    return (
      <Animated.View
        ref={ref}
        pointerEvents="none"
        style={[styles.box, container_animation]}
        onLayout={({nativeEvent: {layout}}) => {
          onLayout(Math.floor(layout.y));
        }}>
        <Text style={styles.text}>{localDisease}</Text>
        <Animated.Text
          style={[styles.number, correct_animated, {color: localColor}]}>
          {doneCount}/{localSymptoms.length}
        </Animated.Text>
      </Animated.View>
    );
  },
);

const styles = StyleSheet.create({
  box: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    borderWidth: 4,
    borderColor: '#212121',
    backgroundColor: '#FBF7F4',
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  text: {
    fontSize: 32,
    position: 'absolute',
    right: 16,
    color: '#212121',
    fontFamily: 'IBM-bold',
    textShadowOffset: {width: 0, height: 3},
    textShadowColor: '#FBF7F4',
    textShadowRadius: 1,
  },
  number: {
    fontFamily: 'SpaceMono',
    fontSize: 72,
    position: 'absolute',
    zIndex: -1,
    left: 16,
  },
});

export default Disease;
