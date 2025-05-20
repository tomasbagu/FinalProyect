// app/auth/WelcomeScreen.js

import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
        {/* Reemplaza source por la ruta de tu logo si lo tienes como asset */}
      </View>

      {/* Sección inferior blanca con texto y botones */}
      <View style={styles.bottom}>
        <Text style={styles.subtitle}>¡Ingresa a Vivo+!</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.primaryButtonText}>Inicio de Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/register')}>
          <Text style={styles.linkText}>
            Ya tienes cuenta? <Text style={styles.linkHighlight}>Regístrate</Text>
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
  logo: {
    width: 80,
    height: 80,
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
  title: {
    fontFamily: "Quicksand",
    fontSize: 40,
    fontWeight: "700",
    color: "white",
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
    marginBottom: 20,
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
