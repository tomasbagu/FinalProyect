// app/(app)/cuidador/caregiver.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { AuthContext } from '../../../context/AuthContext';
import { CareContext, PatientData } from '../../../context/CareContext';

export default function CaregiverHomeScreen() {
  const router = useRouter();
  const { currentUser } = useContext(AuthContext);
  const { patients, loadingPatients } = useContext(CareContext);
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);

  const userName = currentUser
    ? 'displayName' in currentUser && currentUser.displayName
      ? currentUser.displayName
      : (currentUser as { name: string }).name
    : '';

  // Selecciona el primero solo cuando cambian los pacientes
  useEffect(() => {
    if (patients.length > 0) {
      setSelectedPatient(ps => ps ?? patients[0]);
    }
  }, [patients]);

  const handleAddPatient = () => router.push('/cuidador/addPatient');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.greeting}>¡Hola!</Text>
          <Text style={styles.name}>{userName}</Text>
        </View>
        <TouchableOpacity onPress={() => {/* perfil/logout */}}>
          <Ionicons name="person-circle" size={40} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Pacientes */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>Pacientes</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddPatient}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {loadingPatients ? (
          <ActivityIndicator size="large" color={PURPLE} />
        ) : patients.length === 0 ? (
          <View style={styles.noPatientsContainer}>
            <Text style={styles.noPatientsText}>
              No tienes pacientes registrados.
            </Text>
            <TouchableOpacity
              style={styles.registerPrompt}
              onPress={handleAddPatient}
            >
              <Text style={styles.registerPromptText}>Registra uno</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={patients}
            keyExtractor={i => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10 }}
            renderItem={({ item }) => {
              const isSel = selectedPatient?.id === item.id;
              return (
                <TouchableOpacity
                  style={[
                    styles.patientCard,
                    isSel && styles.patientCardSelected
                  ]}
                  onPress={() => setSelectedPatient(item)}
                >
                  <Image
                    source={{ uri: item.photoUrl }}
                    style={styles.patientAvatar}
                  />
                  <View style={styles.patientInfo}>
                    <Text style={styles.patientName}>
                      {item.name} {item.surname}
                    </Text>
                    <Text style={styles.patientAge}>Edad: {item.age}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>

      {/* Help */}
      <TouchableOpacity style={styles.helpButton}>
        <Text style={styles.helpButtonText}>?</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const PURPLE = '#5526C9';
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  headerContainer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20
  },
  greeting: { fontSize: 18, color: '#333' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#000' },

  sectionContainer: { marginBottom: 20 },
  sectionHeaderContainer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },

  addButton: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: PURPLE, alignItems: 'center', justifyContent: 'center'
  },
  addButtonText: { color: '#fff', fontSize: 20, lineHeight: 20 },

  noPatientsContainer: {
    alignItems: 'center', padding: 20, backgroundColor: '#F1F1F1', borderRadius: 12
  },
  noPatientsText: { fontSize: 16, color: '#666', marginBottom: 10 },
  registerPrompt: {
    backgroundColor: PURPLE, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20
  },
  registerPromptText: { color: '#fff', fontSize: 14 },

  patientCard: {
    flexDirection: 'row', backgroundColor: '#B388FF',
    borderRadius: 16, padding: 16, alignItems: 'center', marginRight: 12
  },
  patientCardSelected: {
    borderWidth: 2, borderColor: PURPLE
  },
  patientAvatar: {
    width: 60, height: 60, borderRadius: 30, marginRight: 16
  },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  patientAge: { fontSize: 14, color: '#fff' },

  helpButton: {
    position: 'absolute', bottom: 20, right: 20,
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: PURPLE, alignItems: 'center', justifyContent: 'center',
    elevation: 5, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 3.84
  },
  helpButtonText: { color: '#fff', fontSize: 24, fontWeight: 'bold' }
});
