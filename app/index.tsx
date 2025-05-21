// app/auth/WelcomeScreen.js
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image
} from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  // Bloquear “atrás” tras entrar aquí
  useEffect(() => {
    const onBack = () => true;
    const sub = BackHandler.addEventListener("hardwareBackPress", onBack);
    return () => sub.remove();
  }, []);

  return (
    <View style={styles.container}>
      {/* Sección superior púrpura con logo */}
      <View style={styles.top}>
        <Image
          source={require("../assets/images/logo-white.png")}
          style={{ width: 50, height: 50 }}
        />
        <Text style={styles.title}>Bienvenido</Text>
      </View>

      {/* Sección inferior blanca con texto y botones */}
      <View style={styles.bottom}>
        <Text style={styles.subtitle}>Ingresa como un...</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace("/auth/login")}
        >
          <Text style={styles.primaryButtonText}> Cuidador</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace("/auth/elderLogin")}
        >
          <Text style={styles.primaryButtonText}>Adulto Mayor</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace("/auth/register")}>
          <Text style={styles.linkText}>
            ¿No tienes cuenta?{" "}
            <Text style={styles.linkHighlight}>Regístrate</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const PURPLE = "#4716B9";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PURPLE,
  },
  top: {
    flex: 2,
    justifyContent: "center",
    alignItems: "flex-start",
    marginLeft: 40
  },
  bottom: {
    flex: 3,
    backgroundColor: "white",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  title:{
    fontFamily: "Quicksand-Semibold",
    fontSize: 40,
    fontWeight: "700",
    color: "white",
    marginTop: 30,
  },
  subtitle: {
    fontFamily: "Quicksand-Semibold",
    fontSize: 28,
    fontWeight: "700",
    color: PURPLE,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: PURPLE,
    width: "100%",
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  primaryButtonText: {
    fontFamily: "Quicksand-Semibold",
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkText: {
    fontFamily: "Quicksand",
    fontSize: 14,
    color: "#555",
    marginLeft: 140,
  },
  linkHighlight: {
    color: PURPLE,
    fontWeight: "600",
  },
  image:{
    marginTop:30
  }
});
