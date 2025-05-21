import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, query } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { AppointmentData, CareContext } from '../../../../context/CareContext';
import { db } from '../../../../utils/Firebase';

import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons
} from '@expo/vector-icons';

const PURPLE = '#5526C9';
const LIGHT_PURPLE = '#E6DEFF';
const DARK_PURPLE = '#6A4EC9';
const YELLOW = '#F6E8B1';
const DARK_YELLOW = '#D4C270';
const PINK = '#F9D5E5';
const DARK_PINK = '#C48899';
const BLUE = '#D3F0FF';
const DARK_BLUE = '#77C9E4';

export default function PatientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { patients } = useContext(CareContext);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [showContactModal, setShowContactModal] = useState(false);

  const patient = patients.find(p => p.id === id);

  useEffect(() => {
    const loadAppointments = async () => {
      if (!id) return;
      const col = collection(db, 'patients', id.toString(), 'appointments');
      const q = query(col);
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => {
        const data = doc.data() as any;
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
    <>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Volver a Home */}
        <TouchableOpacity
          onPress={() => router.push("/(app)/cuidador/caregiver")}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>{'< Home'}</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.headerContainer}>
          <Image
            source={{ uri: patient.photoUrl }}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>
              {patient.name} {patient.surname}
            </Text>
          </View>
        </View>

        {/* Datos */}
        <View style={styles.info}>
          <View style={styles.data}>
            <Text style={styles.label}>Tipo de sangre</Text>
            <Text style={styles.value}>{patient.bloodType}</Text>
          </View>
          <View style={styles.data}>
            <Text style={styles.label}>Edad</Text>
            <Text style={styles.value}>{patient.age}</Text>
          </View>
          <TouchableOpacity
            style={styles.data}
            onPress={() => setShowContactModal(true)}
          >
            <Text style={styles.label}>Contactos</Text>
            <Ionicons name="person-outline" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Servicios */}
        <Text style={styles.sectionTitle}>Servicios</Text>
        <View style={styles.cardRow}>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: LIGHT_PURPLE }]}
            onPress={() => router.push(`/cuidador/medications/${id}`)}
          >
            <Ionicons name="medkit-outline" size={28} color={DARK_PURPLE} />
            <Text style={[styles.cardText, { color: DARK_PURPLE }]}>
              Medicamentos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, { backgroundColor: YELLOW }]}
            onPress={() => router.push(`/cuidador/healthRecords/${id}`)}
          >
            <FontAwesome5
              name="file-medical-alt"
              size={28}
              color={DARK_YELLOW}
            />
            <Text style={[styles.cardText, { color: DARK_YELLOW }]}>
              Registros Salud
            </Text>
          </TouchableOpacity>
        </View>

        {/* Actividades */}
        <Text style={styles.sectionTitle}>Actividades</Text>
        <View style={styles.cardRow}>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: BLUE }]}
            onPress={() => router.push(`/cuidador/assignGame/${id}`)}
          >
            <Ionicons
              name="game-controller-outline"
              size={28}
              color={DARK_BLUE}
            />
            <Text style={[styles.cardText, { color: DARK_BLUE }]}>
              Asignar Juego
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, { backgroundColor: PINK }]}
            onPress={() => router.push(`/cuidador/appointments/${id}`)}
          >
            <MaterialCommunityIcons
              name="hospital-box-outline"
              size={28}
              color={DARK_PINK}
            />
            <Text style={[styles.cardText, { color: DARK_PINK }]}>
              Citas Médicas
            </Text>
          </TouchableOpacity>
        </View>

        {/* Próximas Citas */}
        <Text style={styles.sectionTitle}>Próximas Citas</Text>
        {appointments.length === 0 ? (
          <Text style={{ color: '#000' }}>
            No hay citas próximas registradas.
          </Text>
        ) : (
          appointments.map(app => {
            const date = new Date(app.dateTime);
            const day = date.getDate();
            const weekday = date.toLocaleDateString('en-US', {
              weekday: 'short'
            });
            const time = date.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });

            return (
              <View style={styles.appointmentCard} key={app.id}>
                <View
                  style={{ alignItems: 'center', marginRight: 16 }}
                >
                  <Text style={styles.appointmentDate}>{day}</Text>
                  <Text style={styles.appointmentWeekday}>{weekday}</Text>
                </View>
                <View style={styles.appointmentDetails}>
                  <Text style={styles.appointmentTime}>{time}</Text>
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

      {/* Modal de Contacto */}
      <Modal
        visible={showContactModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowContactModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Contacto</Text>
            <Text style={styles.modalLabel}>Nombre:</Text>
            <Text style={styles.modalValue}>
              {patient.contactName}
            </Text>
            <Text style={styles.modalLabel}>Teléfono:</Text>
            <Text style={styles.modalValue}>
              {patient.contactPhone}
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowContactModal(false)}
            >
              <Text style={styles.modalButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 30,
    backgroundColor: '#fff'
  },
  backButton: {
    marginBottom: 10
  },
  backButtonText: {
    fontSize: 20,
    color: '#000'
  },
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center'
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 30,
    marginRight: 20
  },
  name: {
    fontSize: 27,
    fontWeight: 'bold',
    marginTop: 25,
    color: '#000',
    fontFamily: 'QuickSand'
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  data: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  label: {
    fontSize: 12,
    color: '#000',
    fontWeight: 'bold',
    fontFamily: 'QuickSand'
  },
  value: {
    fontSize: 16,
    marginBottom: 5,
    fontFamily: 'QuickSand',
    color: '#000'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    fontFamily: 'QuickSand',
    color: '#000'
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
    alignItems: 'center',
    justifyContent: 'center',
    height: 120
  },
  cardText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'QuickSand',
    marginTop: 13
  },
  appointmentCard: {
    flexDirection: 'row',
    backgroundColor: LIGHT_PURPLE,
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12
  },
  appointmentDetails: {
    flex: 1,
    justifyContent: 'center'
  },
  appointmentDate: {
    fontSize: 28,
    fontWeight: 'bold',
    color: PURPLE,
    fontFamily: 'QuickSand',
    lineHeight: 30
  },
  appointmentWeekday: {
    fontSize: 14,
    fontWeight: '600',
    color: PURPLE,
    fontFamily: 'QuickSand'
  },
  appointmentTime: {
    fontSize: 12,
    color: PURPLE,
    fontWeight: 'bold',
    fontFamily: 'QuickSand',
    marginBottom: 2
  },
  appointmentDoctor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PURPLE,
    fontFamily: 'QuickSand'
  },
  appointmentSpecialty: {
    fontSize: 14,
    color: PURPLE,
    fontFamily: 'QuickSand'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    fontFamily: 'QuickSand'
  },
  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8
  },
  modalValue: {
    fontSize: 16,
    marginTop: 4
  },
  modalButton: {
    alignSelf: 'flex-end',
    marginTop: 20
  },
  modalButtonText: {
    fontSize: 16,
    color: PURPLE,
    fontWeight: 'bold'
  }
});
