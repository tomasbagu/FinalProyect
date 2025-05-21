// app/auth/register.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { registerCaregiver } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    const ok = await registerCaregiver(name, email, password);
    if (ok) {
      router.replace('../auth/login');
    } else {
      Alert.alert('Error', 'No se pudo registrar. Verifica tus datos.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Image
          source={require("../../assets/images/logo-white.png")}
          style={{ width: 50, height: 50 }}
        />
        <Text style={styles.greeting}>¡Hola!</Text>
      </View>
      <View style={styles.bottomSection}>
        <Text style={styles.title}>Registro de Cuidador</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="person" size={20} color="#555" style={styles.icon} />
          <TextInput
            placeholder="Nombre completo"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={20} color="#555" style={styles.icon} />
          <TextInput
            placeholder="Email"
            style={styles.input}
            keyboardType="email-address"
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

        <TouchableOpacity onPress={() => router.push('/auth/login')}>
          <Text style={styles.registerText}>
            ¿Ya tienes cuenta? <Text style={styles.registerLink}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleRegister}>
          <Text style={styles.loginButtonText}>Regístrate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const PURPLE = '#5526C9';
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PURPLE },
  topSection: { flex: 2, justifyContent: 'center', alignItems: 'flex-start', marginLeft: '10%' },
  greeting: { color: 'white', fontSize: 40, fontWeight: 'bold', marginTop: 10 },
  bottomSection: {
    flex: 3,
    backgroundColor: 'white',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30,
    justifyContent: 'center',
  },
  title: { fontFamily: "Quicksand", fontSize: 28, color: PURPLE, fontWeight: "800", marginBottom: 60 },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F1F1',
    borderRadius: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: { marginRight: 8 },
  input: { flex: 1, height: 50, fontSize: 16, fontFamily: "Quicksand" },
  registerText: { fontSize: 14, color: 'black', textAlign: 'right', marginBottom: 20, fontFamily: "Quicksand" },
  registerLink: { color: PURPLE, fontWeight: '600', fontFamily: "Quicksand" },
  loginButton: {
    backgroundColor: PURPLE,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 40
  },
  loginButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', fontFamily: "Quicksand" }
});
