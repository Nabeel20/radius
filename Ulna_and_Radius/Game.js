import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  useWindowDimensions,
  ToastAndroid,
  Modal,
} from 'react-native';
import Disease from './components/Disease';
import SymptomCard from './components/SymptomCard';
import Timer from './components/Timer';
import {data as Database} from './components/database';
import FinishModal from './components/FinishModal';
const HEADER_HEIGHT = 50;
const CARD_HEIGHT = 100;

function shuffle(arr) {
  let i = arr.length;
  while (--i > 0) {
    let randIndex = Math.floor(Math.random() * (i + 1));
    [arr[randIndex], arr[i]] = [arr[i], arr[randIndex]];
  }
  return arr;
}

export default function () {
  const {width, height} = useWindowDimensions();
  const diseases_refs = React.useRef(new Map());
  const symptomButton = React.useRef(null);
  const y_coordinates = React.useRef(new Map());
  const excluded_coordinates = React.useRef([]);
  const footer = React.useRef(0);
  const [finishModal, setFinishModal] = React.useState(false);
  const data = React.useRef([]);

  function getDataOnInit() {
    let _data = shuffle(Database);
    let output = _data.slice(0, 4);
    _data = _data.slice(4, _data.length);

    let indexes = shuffle([0, 1, 2, 3]);
    let symptoms = shuffle(output[indexes[0]].symptoms);
    symptomButton?.current?.updateText(symptoms[0]);
    diseases_refs.current.forEach((item, index) => {
      item.init(output[index]);
    });
    data.current = _data;
  }
  React.useLayoutEffect(() => {
    getDataOnInit();
  }, []);

  function updateSymptomButtonText() {
    let temp_symptoms_store = [];
    diseases_refs.current.forEach(item =>
      temp_symptoms_store.push(item.getNextSymptom()),
    );
    temp_symptoms_store = shuffle(
      temp_symptoms_store.flat().filter(item => item !== undefined),
    );
    if (temp_symptoms_store.length === 0) {
      return symptomButton.current.updateText('done');
    }
    symptomButton.current.updateText(temp_symptoms_store[0]);
  }
  function newDiseaseCard(index) {
    const new_disease = data.current[0];
    diseases_refs.current.get(index).init(new_disease);
    data.current = data.current.shift();
  }
  function handleDeadEnd(index) {
    updateSymptomButtonText();
    diseases_refs.current.get(index).hide();
    excluded_coordinates.current = [...excluded_coordinates.current, index];
  }
  function showHint() {
    for (let i = 0; i < diseases_refs.current.size; i++) {
      const element = diseases_refs.current.get(i).getSymptoms();
      if (element.includes(symptomButton.current.getText())) {
        diseases_refs.current.get(i).flashRight();
        break;
      }
    }
  }
  function dragEventHandler(pointer) {
    const excluded_cord = excluded_coordinates.current;
    const y_cord = y_coordinates.current;
    const cards = diseases_refs.current;
    const button = symptomButton.current;
    try {
      if (excluded_cord.length === y_cord.size) {
        return button.resetPosition();
      }
      for (let index = 0; index < y_cord.size; index++) {
        if (excluded_cord.includes(index)) {
          continue;
        }
        const top_border = y_cord.get(index);
        const pointer_actual_position = footer.current - pointer;
        if (
          pointer_actual_position >= top_border + HEADER_HEIGHT &&
          pointer_actual_position <= top_border + HEADER_HEIGHT + CARD_HEIGHT
        ) {
          const buttonText = button.getText();
          let status = cards.get(index).check(buttonText);

          if (status === 'finished') {
            button.resetPosition();
            if (data.current[0] === undefined) {
              return handleDeadEnd(index);
            }
            newDiseaseCard(index);
            updateSymptomButtonText();
            return;
          }
          if (status) {
            updateSymptomButtonText();
            button.resetPosition();
          } else {
            showHint();
            cards.get(index).playError();
            button.resetPosition();
          }
          break;
        } else {
          button.resetPosition();
        }
      }
    } catch (error) {
      console.log('ERROR', error);
    }
  }

  if (width > height) {
    return (
      <View style={styles.landscape}>
        <Text style={styles.landscapeText}>
          من فضلك قم بتدوير الجهاز للوضعية الشاقولية
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FinishModal visible={false} />
      <Text onPress={getDataOnInit}>new Game</Text>
      <View style={styles.header}>
        <Timer targetMinutes={1} onFinish={() => getDataOnInit()} />
      </View>
      <View style={styles.tray}>
        {[0, 1, 2, 4].map((item, index) => {
          return (
            <Disease
              index={index}
              key={item}
              onLayout={y => y_coordinates.current.set(index, y)}
              ref={ref => diseases_refs.current.set(index, ref)}
            />
          );
        })}
      </View>
      <View
        style={styles.footer}
        onLayout={({nativeEvent: {layout}}) => {
          const HALF_SYMPTOM_BUTTON_HEIGHT = 30;
          const POINTER_MARGIN = 20;
          footer.current =
            layout.y - HALF_SYMPTOM_BUTTON_HEIGHT + POINTER_MARGIN;
        }}>
        <SymptomCard ref={symptomButton} onDragEnd={dragEventHandler} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF7F4',
  },
  footer: {
    height: 50,
    borderTopWidth: 4,
    borderColor: 'black',
  },
  header: {
    height: 50,
    borderColor: '#212121',
    borderBottomWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tray: {
    flexDirection: 'column-reverse',
    justifyContent: 'center',
    flex: 1,
    padding: 16,
  },
  landscape: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBF7F4',
  },
  landscapeText: {
    fontFamily: 'IBM-bold',
    textAlign: 'center',
    fontSize: 32,
    color: '#212121',
  },
});
