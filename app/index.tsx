// app/auth/WelcomeScreen.js
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { BackHandler, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  // Bloquear “atrás” tras entrar aquí
  useEffect(() => {
    const onBack = () => true;
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, []);

  return (
    <View style={styles.container}>
      {/* Sección superior púrpura con logo */}
      <View style={styles.top}>
        {/* Coloca aquí tu logo si lo tienes */}
      </View>

      {/* Sección inferior blanca con texto y botones */}
      <View style={styles.bottom}>
        <Text style={styles.subtitle}>¡Ingresa a Vivo+!</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace('/auth/login')}
        >
          <Text style={styles.primaryButtonText}>Inicio de Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace('/auth/elderLogin')}
        >
          <Text style={styles.primaryButtonText}>Adulto Mayor</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/auth/register')}>
          <Text style={styles.linkText}>
            ¿No tienes cuenta? <Text style={styles.linkHighlight}>Regístrate</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottom: {
    flex: 3,
    backgroundColor: "white",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 30,
    alignItems: 'center',
  },
  subtitle: {
    fontFamily: "Quicksand-Semibold",
    fontSize: 28,
    fontWeight: "700",
    color: PURPLE,
    marginBottom: 40
  },
  primaryButton: {
    backgroundColor: PURPLE,
    width: "100%",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButtonText: {
    fontFamily: "Quicksand-Semibold",
    color: "white",
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    fontFamily: "Quicksand",
    fontSize: 14,
    color: '#555',
  },
  linkHighlight: {
    color: PURPLE,
    fontWeight: '600',
  },
});
