import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  useWindowDimensions,
  ToastAndroid,
} from 'react-native';
import Disease from './components/Disease';
import SymptomCard from './components/SymptomCard';
import Timer from './components/Timer';

const HEADER_HEIGHT = 70;
const CARD_HEIGHT = 100;
const POINTER_MARGIN = 20;

function shuffle(arr) {
  let i = arr.length;
  while (--i > 0) {
    let randIndex = Math.floor(Math.random() * (i + 1));
    [arr[randIndex], arr[i]] = [arr[i], arr[randIndex]];
  }
  return arr;
}

let data = [
  {
    id: '1-d',
    disease: 'فقر الدم',
    color: '#FBBA22',
    symptoms: ['فقر دم 1', 'فقر دم 2', 'فقر دم 3'],
  },
  {
    id: '2-d',
    disease: 'داء مينيير',
    color: '#EE4445',
    symptoms: ['منير1', 'منير2', 'منير3'],
  },
  {
    id: '3-d',
    disease: 'لانظميات',
    color: '#FA77BC',
    symptoms: ['نظم1', 'نظم2', 'نظم3'],
  },
  {
    id: '4-d',
    disease: 'انخفاض سكر الدم',
    color: '#1BBA5F',

    symptoms: ['سكر1', 'سكر2', 'سكر3', 'سكر4'],
  },
  {
    id: '5-d',
    disease: 'أمراض القلب الدسامية',
    color: '#9CFF2E',
    symptoms: ['قلب1', 'قلب2', 'قلب3'],
  },
  {
    id: '6-d',
    disease: 'متلازمة كون',
    color: '#B93160',
    symptoms: ['كون1', 'كون2', 'كون3'],
  },
];

data = shuffle(data);
let output = data.slice(0, 4);
data = data.slice(4, data.length);

let indexes = [0, 1, 2, 3];
indexes = shuffle(indexes);
let symptoms = output[indexes[0]].symptoms;
symptoms = shuffle(symptoms);
let mainSymptom = 'main symptom';
mainSymptom = symptoms[0] ?? 'main';

export default function () {
  const {width, height} = useWindowDimensions();
  const [score, setScore] = React.useState(0);
  const diseases_refs = React.useRef(new Map());
  const symptomButton = React.useRef(null);
  const y_coordinates = React.useRef(new Map());
  const excluded_coordinates = React.useRef([]);
  const footer = React.useRef(0);

  function updateMainSymptom() {
    let temp_symptoms_store = [];
    diseases_refs.current.forEach(item =>
      temp_symptoms_store.push(item.getNextSymptom()),
    );
    temp_symptoms_store = shuffle(
      temp_symptoms_store.flat().filter(item => item !== undefined),
    );
    if (temp_symptoms_store.length === 0) {
      mainSymptom = 'done';
      return symptomButton.current.updateText(mainSymptom);
    }
    mainSymptom = temp_symptoms_store[0];
    symptomButton.current.updateText(mainSymptom);
  }
  function updateDisease(index) {
    diseases_refs.current
      .get(index)
      .update(data[0].disease, data[0].symptoms, data[0].color);
    output[index] = data[0];
    data.shift();
  }
  function handleDeadEnd(index) {
    updateMainSymptom();
    diseases_refs.current.get(index).hide();
    excluded_coordinates.current = [...excluded_coordinates.current, index];
  }
  function showHint() {
    for (let i = 0; i < diseases_refs.current.size; i++) {
      const element = diseases_refs.current.get(i).getSymptoms();
      if (element.includes(mainSymptom)) {
        diseases_refs.current.get(i).flashRight(output[i].color);
        break;
      }
    }
  }
  function dragEventHandler(pointer) {
    try {
      if (excluded_coordinates.current.length === y_coordinates.current.size) {
        return symptomButton.current.resetPosition();
      }
      for (let index = 0; index < y_coordinates.current.size; index++) {
        if (excluded_coordinates.current.includes(index)) {
          continue;
        }
        const top_border = y_coordinates.current.get(index);
        const pointer_actual_position =
          footer.current - pointer + POINTER_MARGIN;
        if (
          pointer_actual_position >= top_border + HEADER_HEIGHT &&
          pointer_actual_position <= top_border + HEADER_HEIGHT + CARD_HEIGHT
        ) {
          let status = diseases_refs.current.get(index).check(mainSymptom);
          if (status === 'finished') {
            symptomButton.current.resetPosition();
            if (data[0] === undefined) {
              return handleDeadEnd(index);
            }
            updateDisease(index);
            updateMainSymptom();
            setScore(prev => (prev += 200));
            return;
          }
          if (status) {
            updateMainSymptom();
            symptomButton.current.resetPosition();
            setScore(prev => (prev += 50));
          } else {
            showHint();
            diseases_refs.current.get(index).playError();
            symptomButton.current.resetPosition();
          }
          break;
        } else {
          symptomButton.current.resetPosition();
        }
      }
    } catch (error) {
      ToastAndroid.showWithGravity(
        `Error: ${error.toString()}`,
        ToastAndroid.LONG,
        ToastAndroid.TOP,
      );
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
      <View style={styles.header}>
        <Timer
          targetMinutes={3}
          report_finish={() =>
            ToastAndroid.showWithGravity(
              'Game over',
              ToastAndroid.LONG,
              ToastAndroid.CENTER,
            )
          }
        />

        <Text style={styles.point}>
          <Text style={styles.score}>{score}</Text>نقطة
        </Text>
      </View>
      <View style={styles.tray}>
        {output.map((item, index) => {
          return (
            <Disease
              disease={item.disease}
              symptoms={item.symptoms}
              color={item.color}
              index={index}
              onLayout={y => y_coordinates.current.set(index, y)}
              ref={ref => diseases_refs.current.set(index, ref)}
              key={item.id}
            />
          );
        })}
      </View>
      <View
        style={styles.footer}
        onLayout={({nativeEvent: {layout}}) => {
          footer.current = layout.y - 30;
        }}>
        <SymptomCard
          ref={symptomButton}
          onDragEnd={dragEventHandler}
          text={mainSymptom}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF7F4',
  },
  score: {
    fontFamily: 'IBM-bold',
    color: '#212121',
    fontSize: 32,
    fontWeight: 'bold',
    margin: 8,
    alignSelf: 'flex-end',
  },
  point: {
    fontFamily: 'IBM-medium',
    fontSize: 24,
    color: '#212121',
  },
  footer: {
    height: 80,
    borderTopWidth: 4,
    borderColor: 'black',
  },
  header: {
    height: 70,
    borderColor: '#212121',
    borderBottomWidth: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
