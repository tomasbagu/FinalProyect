// app/(app)/cuidador/addPatient.tsx
import { Ionicons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { CareContext } from '../../../context/CareContext';

const BLOOD_TYPES = ['A+', 'A−', 'B+', 'B−', 'O+', 'O−', 'AB+', 'AB−'] as const;
type BloodType = typeof BLOOD_TYPES[number];

export default function AddPatientScreen() {
  const router = useRouter();
  const { addPatient } = useContext(CareContext);

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [age, setAge] = useState('');
  const [bloodType, setBloodType] = useState<BloodType>('A+');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasMediaPermission, setHasMediaPermission] = useState(false);

  // 1) Pedir permisos al montar
  useEffect(() => {
    (async () => {
      const camPerm = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(camPerm.status === 'granted');
      if (camPerm.status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara.');
      }

      const mediaPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasMediaPermission(mediaPerm.status === 'granted');
      if (mediaPerm.status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita acceso a la galería.');
      }
    })();
  }, []);

  // 2) Abrir cámara
  // 2) Abrir cámara
const takePhoto = async () => {
  if (!hasCameraPermission) {
    Alert.alert('Sin permiso', 'Activa el permiso de cámara primero.');
    return;
  }
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });
  if (!result.canceled && result.assets.length > 0) {
    setPhotoUri(result.assets[0].uri);
  }
};

// 3) Abrir galería
const pickImage = async () => {
  if (!hasMediaPermission) {
    Alert.alert('Sin permiso', 'Activa el permiso de galería primero.');
    return;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });
  if (!result.canceled && result.assets.length > 0) {
    setPhotoUri(result.assets[0].uri);
  }
};


  // 4) Registrar paciente
  const handleAdd = async () => {
    if (!photoUri || !name || !surname || !age || !contactName || !contactPhone) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }
    setLoading(true);
    const patientId = await addPatient({
      photoUri,
      name: name.trim(),
      surname: surname.trim(),
      age: Number(age),
      bloodType,
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
    });
    setLoading(false);

    if (patientId) {
      router.replace('/cuidador/caregiver');
    } else {
      Alert.alert('Error', 'No se pudo registrar el paciente.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registra Paciente</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        {/* Botones Cámara/Galería */}
        <View style={styles.photoButtonsContainer}>
          <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
            <Ionicons name="camera" size={24} color="#666" />
            <Text style={styles.photoButtonText}>Tomar Foto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
            <Ionicons name="image" size={24} color="#666" />
            <Text style={styles.photoButtonText}>Galería</Text>
          </TouchableOpacity>
        </View>

        {/* Vista previa */}
        {photoUri && (
          <Image source={{ uri: photoUri }} style={styles.photo} />
        )}

        {/* Campos de texto */}
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Apellido"
          value={surname}
          onChangeText={setSurname}
        />
        <TextInput
          style={styles.input}
          placeholder="Edad"
          keyboardType="number-pad"
          value={age}
          onChangeText={setAge}
        />

        {/* Tipo de sangre */}
        <Text style={styles.label}>Tipo de Sangre</Text>
        <View style={styles.pillsContainer}>
          {BLOOD_TYPES.map((bt) => (
            <TouchableOpacity
              key={bt}
              style={[
                styles.pill,
                bloodType === bt && styles.pillSelected,
              ]}
              onPress={() => setBloodType(bt)}
            >
              <Text
                style={[
                  styles.pillText,
                  bloodType === bt && styles.pillTextSelected,
                ]}
              >
                {bt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Contacto de familiar */}
        <TextInput
          style={styles.input}
          placeholder="Nombre Familiar"
          value={contactName}
          onChangeText={setContactName}
        />
        <TextInput
          style={styles.input}
          placeholder="Teléfono Familiar"
          keyboardType="phone-pad"
          value={contactPhone}
          onChangeText={setContactPhone}
        />

        {/* Botón Agregar */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAdd}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.addButtonText}>Agregar Paciente</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const PURPLE = '#5526C9';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  photoButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  photoButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#F1F1F1',
    borderRadius: 12,
  },
  photoButtonText: {
    marginTop: 4,
    fontSize: 12,
    color: '#333',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F1F1F1',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  pill: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  pillSelected: {
    backgroundColor: PURPLE,
    borderColor: PURPLE,
  },
  pillText: {
    fontSize: 14,
    color: '#333',
  },
  pillTextSelected: {
    color: '#fff',
  },
  addButton: {
    backgroundColor: PURPLE,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
