import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, Text} from 'react-native';

export default function Timer({targetMinutes = 0, report_finish = () => {}}) {
  const countDownDate = useRef(new Date());
  const [countDown, setCountDown] = useState(0);

  useEffect(() => {
    countDownDate.current.setMinutes(
      countDownDate.current.getMinutes() + targetMinutes,
    );
    const interval = setInterval(() => {
      if (countDownDate.current.getTime() - new Date().getTime() < 500) {
        report_finish();
        return clearInterval(interval);
      }
      setCountDown(countDownDate.current.getTime() - new Date().getTime());
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countDownDate]);
  const getReturnValues = function (count) {
    if (count === 0) {
      return '00:00';
    }
    let minutes = Math.floor(
      (count % (1000 * 60 * 60)) / (1000 * 60),
    ).toString();
    let seconds = Math.floor((count % (1000 * 60)) / 1000).toString();
    return `${minutes.length === 1 ? '0' : ''}${minutes}:${
      seconds.length === 1 ? '0' : ''
    }${seconds}`;
  };

  return <Text style={styles.text}>{getReturnValues(countDown)}</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'IBM Plex Sans Arabic',
    fontSize: 32,
    fontWeight: 'bold',
    margin: 8,
    alignSelf: 'flex-end',
  },
});
