import React, {useState} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useAnimatedGestureHandler,
  withSpring,
} from 'react-native-reanimated';
import {PanGestureHandler} from 'react-native-gesture-handler';

const SymptomCard = React.forwardRef(
  ({text = 'Symptom', onDragEnd = () => {}}, ref) => {
    const pressed = useSharedValue(false);
    const originY = useSharedValue(0);
    const x = useSharedValue(0);
    const y = useSharedValue(0);
    const [localText, setLocalText] = useState(text);

    React.useImperativeHandle(ref, () => ({
      resetPosition() {
        x.value = withSpring(0);
        y.value = withSpring(0);
      },
      updateText(new_text) {
        setLocalText(new_text);
      },
    }));

    const eventHandler = useAnimatedGestureHandler({
      onStart: () => {
        pressed.value = true;
      },
      onActive: event => {
        x.value = event.translationX;
        y.value = event.translationY;
      },
      onEnd: event => {
        const touch_position = Math.floor(
          originY.value - Math.abs(event.translationY),
        );
        onDragEnd(touch_position);
        pressed.value = false;
      },
    });
    const animated_touch = useAnimatedStyle(() => {
      return {
        backgroundColor: pressed.value ? '#FEEF86' : '#FBF7F4',
        transform: [{translateX: x.value}, {translateY: y.value}],
      };
    });

    return (
      <Animated.View
        onLayout={({nativeEvent: {layout}}) => {
          originY.value = layout.top;
        }}>
        <PanGestureHandler onGestureEvent={eventHandler}>
          <Animated.View style={[styles.box, animated_touch]}>
            <Text style={styles.text}>{localText}</Text>
          </Animated.View>
        </PanGestureHandler>
        <View style={[styles.box, styles.shadow]}>
          <Text style={styles.text}>(◠‿◠)</Text>
        </View>
      </Animated.View>
    );
  },
);

const styles = StyleSheet.create({
  box: {
    minWidth: '50%',
    height: 60,
    borderRadius: 99,
    borderColor: '#212121',
    borderWidth: 4,
    padding: 8,
    marginTop: -30,
    backgroundColor: '#FBF7F4',
    alignItems: 'center',
    flex: 1,
    alignSelf: 'center',
  },
  shadow: {
    position: 'absolute',
    zIndex: -1,
    backgroundColor: '#DBE2EF',
  },
  text: {
    fontFamily: 'IBM-medium',
    fontSize: 24,
    fontWeight: '500',
    color: '#212121',
  },
});

export default SymptomCard;
