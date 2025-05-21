// app/(app)/games/MemoryGame.tsx
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';

const symbols = ['🍎', '🎈', '🐶', '🌼']; // se duplicarán

function shuffle(array: string[]) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function MemoryGame() {
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const duplicated = [...symbols, ...symbols];
    const shuffled = shuffle(duplicated);
    setCards(shuffled);
  }, []);

  const handlePress = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      setAttempts((a) => a + 1);

      if (cards[first] === cards[second]) {
        setMatched((prev) => [...prev, first, second]);
        setTimeout(() => {
          setFlipped([]);
          if (matched.length + 2 === cards.length) {
            Alert.alert('¡Felicidades!', `Has completado el juego en ${attempts + 1} intentos.`);
          }
        }, 500);
      } else {
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Juego de Memoria</Text>
      <Text style={styles.subtitle}>Encuentra las parejas iguales</Text>
      <View style={styles.grid}>
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(index);
          return (
            <TouchableOpacity
              key={index}
              style={[styles.card, isFlipped && styles.cardFlipped]}
              onPress={() => handlePress(index)}
              activeOpacity={0.8}
            >
              <Text style={styles.cardText}>{isFlipped ? card : '❓'}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.attempts}>Intentos: {attempts}</Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  card: {
    width: 70,
    height: 70,
    backgroundColor: '#DDD',
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12
  },
  cardFlipped: {
    backgroundColor: '#A5D6A7'
  },
  cardText: {
    fontSize: 28
  },
  attempts: {
    marginTop: 30,
    fontSize: 18,
    fontWeight: '600'
  }
});
