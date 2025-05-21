import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';

function generateNumbers() {
  const nums = Array.from({ length: 4 }, () => Math.floor(Math.random() * 100));
  return nums;
}

export default function NumberPickGame() {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [target, setTarget] = useState<'max' | 'min'>('max');
  const [score, setScore] = useState(0);
  const [pendingReset, setPendingReset] = useState(false);

  const resetGame = () => {
    const newNumbers = generateNumbers();
    setNumbers(newNumbers);
    setTarget(Math.random() > 0.5 ? 'max' : 'min');
  };

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    if (pendingReset) {
      resetGame();
      setPendingReset(false);
    }
  }, [pendingReset]);

  const handlePress = (num: number) => {
    const correct =
      (target === 'max' && num === Math.max(...numbers)) ||
      (target === 'min' && num === Math.min(...numbers));

    if (correct) {
      setScore(score + 1);
      Alert.alert('¡Correcto!', 'Muy bien hecho.', [
        { text: 'Siguiente', onPress: () => setPendingReset(true) }
      ]);
    } else {
      Alert.alert('Incorrecto', 'Ese no era.', [
        { text: 'Intentar de nuevo', onPress: () => setPendingReset(true) }
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Toca el número {target === 'max' ? 'MÁS ALTO' : 'MÁS BAJO'}</Text>
      <View style={styles.grid}>
        {numbers.map((num, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.card}
            onPress={() => handlePress(num)}
          >
            <Text style={styles.number}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.score}>Puntaje: {score}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: 'center',
    paddingTop: 50
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  card: {
    width: 80,
    height: 80,
    margin: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  number: {
    fontSize: 28,
    fontWeight: '700'
  },
  score: {
    marginTop: 30,
    fontSize: 18
  }
});
