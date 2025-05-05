import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    // Tu lógica de autenticación aquí
    console.log('Iniciar sesión con:', email, password);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        {/* Aquí puedes reemplazar por tu logo si lo tienes */}
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
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed" size={20} color="#555" style={styles.icon} />
          <TextInput
            placeholder="Password"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity onPress={() => router.push('/auth/register')}>
          <Text style={styles.registerText}>
            ¿Ya tienes cuenta? <Text style={styles.registerLink}>Regístrate</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Inicio de Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const PURPLE = '#5526C9';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PURPLE,
  },
  topSection: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 10,
  },
  logo: {
    fontSize: 40,
  },
  bottomSection: {
    flex: 3,
    backgroundColor: 'white',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30,
  },
  title: {
    fontSize: 20,
    color: PURPLE,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F1F1',
    borderRadius: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  registerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    marginBottom: 20,
  },
  registerLink: {
    color: PURPLE,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: PURPLE,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
