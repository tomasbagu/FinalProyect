import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import { CareContext, AppointmentData } from '../../../../context/CareContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../../../utils/Firebase';

const PURPLE = '#5526C9';
const LIGHT_PURPLE = '#E6DEFF';
const YELLOW = '#F6E8B1';
const PINK = '#F9D5E5';
const BLUE = '#D3F0FF';

export default function PatientDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { patients } = useContext(CareContext);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);

  const patient = patients.find(p => p.id === id);

  useEffect(() => {
    const loadAppointments = async () => {
      if (!id) return;
      const col = collection(db, 'patients', id.toString(), 'appointments');
      const q = query(col);
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          doctorName: data.doctorName,
          specialization: data.specialization,
          dateTime: data.dateTime.toDate()
        } as AppointmentData;
      });
      setAppointments(list);
    };
    loadAppointments();
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
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>{'<'} </Text>
      </TouchableOpacity>

      <View style={styles.headerContainer}>
        <Image source={{ uri: patient.photoUrl }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{patient.name} {patient.surname}</Text>
          <Text style={styles.label}>Tipo de sangre</Text>
          <Text style={styles.value}>{patient.bloodType}</Text>
          <Text style={styles.label}>Edad</Text>
          <Text style={styles.value}>{patient.age}</Text>
          <Text style={styles.label}>Contactos</Text>
          <Text style={styles.valueIcon}>👤</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Servicios</Text>
      <View style={styles.cardRow}>
        <TouchableOpacity style={[styles.card, { backgroundColor: LIGHT_PURPLE }]} onPress={() => router.replace(`../../cuidador/medications/${patient.id}`)}>
          <Text style={styles.cardIcon}>💊</Text>
          <Text style={styles.cardText}>Medicamentos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.card, { backgroundColor: YELLOW }]} onPress={() => router.push(`../../cuidador/healthRecords/${patient.id}`)}>
          <Text style={styles.cardIcon}>📊</Text>
          <Text style={styles.cardText}>Registros de Salud</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.card, { backgroundColor: PINK }]} onPress={() => router.push(`../../cuidador/appointments/${patient.id}`)}>
          <Text style={styles.cardIcon}>🏥</Text>
          <Text style={styles.cardText}>Citas Médicas</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Actividades</Text>
      <View style={styles.cardRow}>
        <TouchableOpacity style={[styles.card, { backgroundColor: BLUE }]}>
          <Text style={styles.cardIcon}>🏃‍♂️</Text>
          <Text style={styles.cardText}>Actualizar Estado</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.card, { backgroundColor: YELLOW }]}>
          <Text style={styles.cardIcon}>🎮</Text>
          <Text style={styles.cardText}>Asignar Juego</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Próximas Citas</Text>
      {appointments.length === 0 ? (
        <Text style={{ color: '#666' }}>No hay citas próximas registradas.</Text>
      ) : (
        appointments.map(app => {
          const date = new Date(app.dateTime);
          const day = date.getDate();
          const weekday = date.toLocaleDateString('es-ES', { weekday: 'short' });
          const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

          return (
            <View style={styles.appointmentCard} key={app.id}>
              <Text style={styles.appointmentDate}>{day}</Text>
              <View style={styles.appointmentDetails}>
                <Text style={styles.appointmentTime}>{weekday.toUpperCase()} {time}</Text>
                <Text style={styles.appointmentDoctor}>Dr. {app.doctorName}</Text>
                <Text style={styles.appointmentSpecialty}>{app.specialization}</Text>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff'
  },
  backButton: {
    marginBottom: 10
  },
  backButtonText: {
    fontSize: 24
  },
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center'
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  label: {
    fontSize: 12,
    color: '#999'
  },
  value: {
    fontSize: 16,
    marginBottom: 5
  },
  valueIcon: {
    fontSize: 20,
    marginBottom: 5
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  card: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center'
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: 8
  },
  cardText: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  appointmentCard: {
    flexDirection: 'row',
    backgroundColor: LIGHT_PURPLE,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10
  },
  appointmentDate: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 20
  },
  appointmentDetails: {
    flex: 1
  },
  appointmentTime: {
    fontSize: 14,
    color: '#333'
  },
  appointmentDoctor: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  appointmentSpecialty: {
    fontSize: 14,
    color: '#666'
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
