// app/auth/register.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { registerCaregiver } = useContext(AuthContext);

  const [name, setName]     = useState('');
  const [email, setEmail]   = useState('');
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
        <Ionicons name="heart-outline" size={48} color="white" />
        <Text style={styles.greeting}>¡Hola!</Text>
      </View>
      <View style={styles.bottomSection}>
        <Text style={styles.title}>Registro Cuidador</Text>
        {/** Nombre **/}
        <View style={styles.inputContainer}>
          <Ionicons name="person" size={20} color="#555" style={styles.icon} />
          <TextInput
            placeholder="Nombre completo"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
        </View>
        {/** Email **/}
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
        {/** Password **/}
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
          <Text style={styles.linkText}>
            ¿Ya tienes cuenta? <Text style={styles.linkHighlight}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Regístrate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const PURPLE = '#5526C9';
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PURPLE },
  topSection: { flex: 2, justifyContent: 'center', alignItems: 'center' },
  greeting: { color: 'white', fontSize: 32, fontWeight: 'bold', marginTop: 10 },
  bottomSection: {
    flex: 3,
    backgroundColor: 'white',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30
  },
  title: { fontSize: 20, color: PURPLE, fontWeight: 'bold', marginBottom: 20 },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F1F1',
    borderRadius: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 15,
    height: 50
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16 },
  linkText: { fontSize: 14, color: '#666', textAlign: 'right', marginBottom: 20 },
  linkHighlight: { color: PURPLE, fontWeight: '600' },
  registerButton: {
    backgroundColor: PURPLE,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center'
  },
  registerButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
