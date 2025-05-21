// app/(app)/adulto/mainElder.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../../../../context/AuthContext";
import { CareContext, GameType } from "../../../../context/CareContext";

export default function MainElderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentUser } = useContext(AuthContext);
  const { assignGame } = useContext(CareContext);
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);

  const handleAssign = async () => {
    if (!selectedGame || !currentUser) return;
    const elderId = id; // aquí uid del documento "patients"
    await assignGame(elderId, selectedGame);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      {/* Title */}
      <View style={styles.header}>
        <Ionicons name="game-controller" size={24} color="#000" />
        <Text style={styles.title}>Asignar Juego</Text>
      </View>
      <Text style={styles.subtitle}>
        Selecciona un juego adecuado para el adulto mayor
      </Text>

      {/* Game options */}
      <View style={styles.gamesContainer}>
        <TouchableOpacity
          style={[styles.card, selectedGame === "game1" && styles.cardSelected]}
          onPress={() => setSelectedGame("game1")}
        >
          {/* aquí podrías poner una imagen o ícono real */}
          <View style={styles.iconPlaceholder}>
            <Text style={styles.iconEmoji}>🎨</Text>
          </View>
          <Text style={styles.cardLabel}>Juego Colores</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, selectedGame === "game2" && styles.cardSelected]}
          onPress={() => setSelectedGame("game2")}
        >
          <View style={styles.iconPlaceholder}>
            <Text style={styles.iconEmoji}>🧠</Text>
          </View>
          <Text style={styles.cardLabel}>Memoria</Text>
        </TouchableOpacity>
      </View>

      {/* Assign button */}
      <TouchableOpacity
        style={[
          styles.assignButton,
          !selectedGame && styles.assignButtonDisabled,
        ]}
        onPress={handleAssign}
        disabled={!selectedGame}
      >
        <Text style={styles.assignButtonText}>Asignar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const GOLD = "#CDA30E";
const PURPLE = "#5526C9";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 8,
    color: "#000",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  gamesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  card: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: PURPLE,
  },
  iconPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EEE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  iconEmoji: {
    fontSize: 32,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  assignButton: {
    backgroundColor: GOLD,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  assignButtonDisabled: {
    backgroundColor: "#CCC",
  },
  assignButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
