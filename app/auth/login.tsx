// app/auth/login.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  BackHandler,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { loginCaregiver } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Deshabilita el botón “atrás” (hardware) en Android
  useEffect(() => {
    const onBackPress = () => true;
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, []);

  const handleLogin = async () => {
    const ok = await loginCaregiver(email, password);
    if (ok) {
      // Reemplaza la ruta al área de cuidador y limpia el historial
      router.replace('/cuidador/caregiver');
    } else {
      Alert.alert('Error', 'Email o contraseña incorrectos.');
    }
  };

  const goToRegister = () => {
    // Reemplaza la ruta a registro y limpia el historial
    router.replace('/auth/register');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.logo}>💜</Text>
        <Text style={styles.greeting}>¡Hola!</Text>
      </View>
      <View style={styles.bottomSection}>
        <Text style={styles.title}>Inicio de Sesión</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={20} color="#555" style={styles.icon} />
          <TextInput
            placeholder="Email"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed" size={20} color="#555" style={styles.icon} />
          <TextInput
            placeholder="Contraseña"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity onPress={goToRegister}>
          <Text style={styles.registerText}>
            ¿No tienes cuenta? <Text style={styles.registerLink}>Regístrate</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const PURPLE = '#5526C9';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PURPLE
  },
  topSection: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logo: {
    fontSize: 40
  },
  greeting: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 10
  },
  bottomSection: {
    flex: 3,
    backgroundColor: 'white',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30
  },
  title: {
    fontSize: 20,
    color: PURPLE,
    fontWeight: 'bold',
    marginBottom: 20
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F1F1',
    borderRadius: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 15
  },
  icon: {
    marginRight: 8
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16
  },
  registerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    marginBottom: 20
  },
  registerLink: {
    color: PURPLE,
    fontWeight: '600'
  },
  loginButton: {
    backgroundColor: PURPLE,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center'
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
