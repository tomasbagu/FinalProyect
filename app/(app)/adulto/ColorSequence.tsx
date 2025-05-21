import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';

const COLORS = [
  { name: 'Rojo', hex: '#D32F2F' },
  { name: 'Azul', hex: '#1976D2' },
  { name: 'Verde', hex: '#388E3C' },
  { name: 'Amarillo', hex: '#FBC02D' }
];

export default function ColorSequenceGame() {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const newSeq = [Math.floor(Math.random() * COLORS.length)];
    setSequence(newSeq);
    setUserInput([]);
    setIsShowing(true);
    setTimeout(() => setIsShowing(false), 1000 * newSeq.length);
  };

  const nextRound = () => {
    const nextSeq = [...sequence, Math.floor(Math.random() * COLORS.length)];
    setSequence(nextSeq);
    setUserInput([]);
    setIsShowing(true);
    setTimeout(() => setIsShowing(false), 1000 * nextSeq.length);
  };

  const handlePress = (index: number) => {
    if (isShowing) return;

    const newInput = [...userInput, index];
    setUserInput(newInput);

    if (sequence[newInput.length - 1] !== index) {
      Alert.alert('Error', 'Te equivocaste. Intenta de nuevo.');
      startNewGame();
      return;
    }

    if (newInput.length === sequence.length) {
      Alert.alert('¡Correcto!', 'Bien hecho. Vamos con otra secuencia.');
      setTimeout(() => nextRound(), 1000);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Memoriza la Secuencia</Text>
      <Text style={styles.subtitle}>
        Toca los colores en el mismo orden que se iluminaron
      </Text>

      <View style={styles.grid}>
        {COLORS.map((color, index) => {
          const isLit = isShowing && sequence.includes(index);
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.colorButton,
                { backgroundColor: color.hex },
                isLit && styles.lit
              ]}
              onPress={() => handlePress(index)}
            />
          );
        })}
      </View>

      <Text style={styles.level}>Nivel: {sequence.length}</Text>
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
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  colorButton: {
    width: 100,
    height: 100,
    margin: 10,
    borderRadius: 12
  },
  lit: {
    borderWidth: 4,
    borderColor: '#FFF'
  },
  level: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600'
  }
});
