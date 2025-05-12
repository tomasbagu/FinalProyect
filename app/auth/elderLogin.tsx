// app/auth/elderLogin.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

export default function ElderLoginScreen() {
  const router = useRouter();
  const { loginElder } = useContext(AuthContext);
  const [code, setCode] = useState('');

  const handleLogin = async () => {
    const ok = await loginElder(code.trim().toUpperCase());
    if (ok) {
      router.replace('//(app)/adulto/mainElder');
    } else {
      Alert.alert('Error', 'Código inválido. Verifica con tu cuidador.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Ionicons name="person-circle-outline" size={64} color="white" />
        <Text style={styles.greeting}>Adulto Mayor</Text>
      </View>
      <View style={styles.bottomSection}>
        <Text style={styles.title}>Iniciar con Código</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="key" size={20} color="#555" style={styles.icon} />
          <TextInput
            placeholder="Código asignado"
            style={styles.input}
            autoCapitalize="characters"
            value={code}
            onChangeText={setCode}
          />
        </View>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const PURPLE = '#5526C9';
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PURPLE },
  topSection: { flex: 2, justifyContent: 'center', alignItems: 'center' },
  greeting: { color: 'white', fontSize: 28, fontWeight: 'bold', marginTop: 10 },
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
  loginButton: {
    backgroundColor: PURPLE,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center'
  },
  loginButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
