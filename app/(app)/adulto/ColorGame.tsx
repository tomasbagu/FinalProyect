import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';

const COLORS = [
  { name: 'Rojo', hex: '#D32F2F' },
  { name: 'Azul', hex: '#1976D2' },
  { name: 'Verde', hex: '#388E3C' },
  { name: 'Amarillo', hex: '#FBC02D' }
];

export default function ColorGame() {
  const [targetColor, setTargetColor] = useState('');
  const [score, setScore] = useState(0);

  const pickNewColor = () => {
    const random = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTargetColor(random.name);
  };

  useEffect(() => {
    pickNewColor();
  }, []);

  const handlePress = (colorName: string) => {
    if (colorName === targetColor) {
      setScore(prev => prev + 1);
      pickNewColor(); // ¡Esto cambia el color de inmediato!
      Alert.alert('¡Correcto!', 'Muy bien hecho.');
    } else {
      Alert.alert('Ups', 'Ese no es el color correcto.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Toque el color: <Text style={styles.targetText}>{targetColor}</Text></Text>
      <View style={styles.grid}>
        {COLORS.map((color) => (
          <TouchableOpacity
            key={color.name}
            style={[styles.colorButton, { backgroundColor: color.hex }]}
            onPress={() => handlePress(color.name)}
          />
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  title: {
    fontSize: 24,
    marginBottom: 20
  },
  targetText: {
    fontWeight: 'bold',
    color: '#000'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  colorButton: {
    width: 100,
    height: 100,
    borderRadius: 16,
    margin: 10
  },
  score: {
    marginTop: 30,
    fontSize: 20,
    fontWeight: '600'
  }
});

