import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CareContext } from '../../../../context/CareContext';

const PURPLE = '#5526C9';

export default function EditScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { patients } = useContext(CareContext);

  // Verificación en consola
  useEffect(() => {
    console.log('ID recibido en detalle:', id);
  }, [id]);

  const patient = patients.find(p => p.id === id);

  if (!patient) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Paciente no encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: patient.photoUrl }} style={styles.avatar} />

      <Text style={styles.name}>{patient.name} {patient.surname}</Text>
      <Text style={styles.code}>Código: {patient.code}</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Edad:</Text>
        <Text style={styles.value}>{patient.age} años</Text>

        <Text style={styles.label}>Tipo de sangre:</Text>
        <Text style={styles.value}>{patient.bloodType}</Text>

        <Text style={styles.label}>Contacto:</Text>
        <Text style={styles.value}>{patient.contactName} ({patient.contactPhone})</Text>

        <Text style={styles.label}>Juego asignado:</Text>
        <Text style={styles.value}>{patient.assignedGame ?? 'Ninguno'}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
      >
        <Text style={styles.buttonText}>Editar información</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center'
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  code: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666'
  },
  infoBox: {
    width: '100%',
    padding: 20,
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333'
  },
  value: {
    fontSize: 16,
    color: '#000'
  },
  button: {
    backgroundColor: PURPLE,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    color: 'red',
    fontSize: 16
  }
});
