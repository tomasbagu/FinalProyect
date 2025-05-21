// app/(app)/cuidador/addPatient.tsx
import { Ionicons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
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

  useEffect(() => {
    (async () => {
      const camPerm = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(camPerm.status === 'granted');
      const mediaPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasMediaPermission(mediaPerm.status === 'granted');
    })();
  }, []);

  const takePhoto = async () => {
    if (!hasCameraPermission) return Alert.alert('Sin permiso', 'Activa la cámara.');
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled && result.assets.length > 0) setPhotoUri(result.assets[0].uri);
  };

  const pickImage = async () => {
    if (!hasMediaPermission) return Alert.alert('Sin permiso', 'Activa la galería.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled && result.assets.length > 0) setPhotoUri(result.assets[0].uri);
  };

  const handleAdd = async () => {
    if (!photoUri || !name || !surname || !age || !contactName || !contactPhone) {
      return Alert.alert('Error', 'Completa todos los campos.');
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
      cedula: ''
    });
    setLoading(false);

    if (patientId) router.replace('/cuidador/caregiver');
    else Alert.alert('Error', 'No se pudo registrar el paciente.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 30 }}>
      <TouchableOpacity onPress={() => router.push("/(app)/cuidador/caregiver")} style={{ marginBottom: 20 }}>
        <Ionicons name="arrow-back" size={28} color={"black"} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Nuevo Paciente</Text>
      </View>

      <View style={styles.photoButtonsContainer}>
        <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
          <Ionicons name="camera" size={24} color="#000" />
          <Text style={styles.photoButtonText}>Tomar Foto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
          <Ionicons name="image" size={24} color="#000" />
          <Text style={styles.photoButtonText}>Galería</Text>
        </TouchableOpacity>
      </View>
      {photoUri && <Image source={{ uri: photoUri }} style={styles.photo} />}

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Apellido</Text>
        <TextInput style={styles.input} value={surname} onChangeText={setSurname} />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Edad</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={age} onChangeText={setAge} />
      </View>

      <Text style={styles.label}>Tipo de sangre</Text>
      <View style={styles.bloodContainer}>
        {BLOOD_TYPES.map(bt => (
          <TouchableOpacity key={bt} style={[styles.bloodType, bloodType === bt && styles.bloodTypeSelected]} onPress={() => setBloodType(bt)}>
            <Text style={[styles.bloodText, bloodType === bt && styles.bloodTextSelected]}>{bt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Nombre Familiar</Text>
        <TextInput style={styles.input} value={contactName} onChangeText={setContactName} />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Teléfono Familiar</Text>
        <TextInput style={styles.input} keyboardType="phone-pad" value={contactPhone} onChangeText={setContactPhone} />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleAdd} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Agregar Paciente</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const PURPLE = '#5526C9';
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { alignItems: 'flex-start', marginBottom: 30 },
  title: { color: "black", fontSize: 32, fontWeight: 'bold', marginTop: 10, fontFamily:"QuickSand" },
  fieldContainer: { marginBottom: 15 },
  input: {
    backgroundColor: '#fff',
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 20,
    height: 45,
    fontSize: 16,
    fontFamily:"QuickSand"
  },
  photoButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  photoButton: {
    alignItems: 'center',

    padding: 10,
    borderRadius: 15,
    width:100,
    borderColor: "black",
    borderWidth:1
  },
  photoButtonText: { fontSize: 12, color: '#333', marginTop: 4 },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 20,
  },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 5,fontFamily:"QuickSand" },
  bloodContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  bloodType: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: 'white'
  },
  bloodTypeSelected: { backgroundColor: PURPLE, borderColor: '#fff' },
  bloodText: { fontSize: 14, color: '#333', fontFamily:"QuickSand" },
  bloodTextSelected: { color: '#fff' },
  submitButton: {
    backgroundColor: PURPLE,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold', fontFamily:"QuickSand" },
});
