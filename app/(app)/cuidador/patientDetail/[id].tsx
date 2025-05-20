// app/(app)/cuidador/patient/[id].tsx

import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  collection,
  onSnapshot,
  orderBy,
  query
} from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { AppointmentData, CareContext } from '../../../../context/CareContext';
import { db } from '../../../../utils/Firebase';

const PURPLE = '#5526C9';
const LIGHT_PURPLE = '#E6DEFF';
const YELLOW = '#F6E8B1';
const PINK = '#F9D5E5';
const BLUE = '#D3F0FF';

export default function PatientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { patients } = useContext(CareContext);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);

  const patient = patients.find(p => p.id === id);

  useEffect(() => {
    if (!id) return;
    const colRef = collection(db, 'patients', id, 'appointments');
    // opcionalmente ordena por fecha si quieres:
    const q = query(colRef, orderBy('dateTime', 'asc'));
    const unsub = onSnapshot(q, snap => {
      const list = snap.docs.map(d => {
        const data = d.data() as any;
        return {
          id: d.id,
          doctorName: data.doctorName,
          specialization: data.specialization,
          dateTime: data.dateTime.toDate()
        } as AppointmentData;
      });
      setAppointments(list);
    });
    return () => unsub();
  }, [id]);

  if (!patient) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Paciente no encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Volver atrás */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Volver</Text>
      </TouchableOpacity>

      {/* Header: foto y datos */}
      <View style={styles.headerContainer}>
        <Image source={{ uri: patient.photoUrl }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>
            {patient.name} {patient.surname}
          </Text>
          <Text style={styles.label}>Cédula</Text>
          <Text style={styles.value}>{patient.cedula}</Text>
          <Text style={styles.label}>Edad</Text>
          <Text style={styles.value}>{patient.age}</Text>
          <Text style={styles.label}>Tipo de sangre</Text>
          <Text style={styles.value}>{patient.bloodType}</Text>
          <Text style={styles.label}>Contacto</Text>
          <Text style={styles.value}>
            {patient.contactName} 📞 {patient.contactPhone}
          </Text>
        </View>
      </View>

      {/* Servicios */}
      <Text style={styles.sectionTitle}>Servicios</Text>
      <View style={styles.cardRow}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: LIGHT_PURPLE }]}
          onPress={() => router.push(`/cuidador/medications/${id}`)}
        >
          <Text style={styles.cardIcon}>💊</Text>
          <Text style={styles.cardText}>Medicamentos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: YELLOW }]}
          onPress={() => router.push(`/cuidador/healthRecords/${id}`)}
        >
          <Text style={styles.cardIcon}>📊</Text>
          <Text style={styles.cardText}>Registros de Salud</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: PINK }]}
          onPress={() => router.push(`/cuidador/appointments/${id}`)}
        >
          <Text style={styles.cardIcon}>🏥</Text>
          <Text style={styles.cardText}>Citas Médicas</Text>
        </TouchableOpacity>
      </View>

      {/* Actividades */}
      <Text style={styles.sectionTitle}>Actividades</Text>
      <View style={styles.cardRow}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: BLUE }]}
          onPress={() => router.push(`/cuidador/healthRecords/${id}`)}
        >
          <Text style={styles.cardIcon}>🏃‍♂️</Text>
          <Text style={styles.cardText}>Actualizar Estado</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: YELLOW }]}
          onPress={() => router.push(`/cuidador/assignGame/${id}`)}
        >
          <Text style={styles.cardIcon}>🎮</Text>
          <Text style={styles.cardText}>Asignar Juego</Text>
        </TouchableOpacity>
      </View>

      {/* Próximas Citas */}
      <Text style={styles.sectionTitle}>Próximas Citas</Text>
      {appointments.length === 0 ? (
        <Text style={{ color: '#666' }}>No hay citas próximas registradas.</Text>
      ) : (
        appointments.map(app => {
          const dt = new Date(app.dateTime);
          const day = dt.getDate();
          const wd = dt.toLocaleDateString('es-ES', { weekday: 'short' });
          const tm = dt.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          });
          return (
            <View key={app.id} style={styles.appointmentCard}>
              <Text style={styles.appointmentDate}>{day}</Text>
              <View style={styles.appointmentDetails}>
                <Text style={styles.appointmentTime}>
                  {wd.toUpperCase()} {tm}
                </Text>
                <Text style={styles.appointmentDoctor}>
                  Dr. {app.doctorName}
                </Text>
                <Text style={styles.appointmentSpecialty}>
                  {app.specialization}
                </Text>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  backButton: { marginBottom: 10 },
  backButtonText: { fontSize: 16, color: PURPLE },
  headerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginRight: 20 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  label: { fontSize: 12, color: '#999' },
  value: { fontSize: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 12 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  card: { flex: 1, marginHorizontal: 4, borderRadius: 12, padding: 16, alignItems: 'center' },
  cardIcon: { fontSize: 24, marginBottom: 8 },
  cardText: { fontSize: 14, fontWeight: 'bold' },
  appointmentCard: {
    flexDirection: 'row',
    backgroundColor: LIGHT_PURPLE,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center'
  },
  appointmentDate: { fontSize: 24, fontWeight: 'bold', marginRight: 16 },
  appointmentDetails: { flex: 1 },
  appointmentTime: { fontSize: 14, color: '#333' },
  appointmentDoctor: { fontSize: 16, fontWeight: 'bold' },
  appointmentSpecialty: { fontSize: 14, color: '#666' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: 'red' }
});
