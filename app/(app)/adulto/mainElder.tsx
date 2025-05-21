
import React, { useEffect, useState, useContext } from 'react';
import { SafeAreaView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../../context/AuthContext';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../utils/Firebase';

export default function MainElder() {
  const router = useRouter();
  const { currentUser } = useContext(AuthContext);

  const [time, setTime] = useState('');
  const [currentPatient, setCurrentPatient] = useState<any>(null);

  // Actualizar la hora cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
      const formattedTime = `${String(hours % 12 || 12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
      setTime(formattedTime);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

useEffect(() => {
  const fetchPatient = async () => {
    if (!currentUser) return;

    // 1) Si es ElderData (loginElder), uid **es** el ID del paciente
    if ('role' in currentUser && currentUser.role === 'elder') {
      const snap = await getDoc(doc(db, 'patients', currentUser.uid));
      if (snap.exists()) {
        setCurrentPatient({ id: snap.id, ...snap.data() });
        console.log('Paciente (elder) encontrado:', snap.id);
      } else {
        console.warn('❌ ElderData sin documento en patients/', currentUser.uid);
      }
      return;
    }

    // 2) Si es usuario Firebase (caregiver/familiar), buscamos por caregiverId
    const col = collection(db, 'patients');
    const q = query(col, where('caregiverId', '==', currentUser.uid));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const docSnap = snap.docs[0];
      setCurrentPatient({ id: docSnap.id, ...docSnap.data() });
      console.log('Paciente (caregiver) encontrado:', docSnap.id);
    } else {
      console.warn('❌ Ningún paciente asociado a este cuidador:', currentUser.uid);
    }
  };

  fetchPatient();
}, [currentUser]);
  const assignedGame = currentPatient?.assignedGame;

  const goToGame = () => {
    switch (assignedGame) {
      case 'game1':
        router.push('/adulto/ColorGame');
        break;
      case 'game2':
        router.push('/adulto/MemoryGame');
        break;
      case 'game3':
        router.push('/adulto/ColorSequence');
        break;
      case 'game4':
        router.push('/adulto/NumberGame');
        break;
      default:
        console.warn(`Juego no reconocido: ${assignedGame}`);
        break;
    }
  };

  if (!currentUser || !currentPatient) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Cargando datos del paciente...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.time}>{time}</Text>

      <TouchableOpacity
        style={[styles.activityButton, !assignedGame && styles.disabledButton]}
        onPress={goToGame}
        disabled={!assignedGame}
      >
        <Text style={styles.activityText}>Actividad</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.emergencyButton}>
        <Text style={styles.emergencyText}>🔔 EMERGENCIA!</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  time: {
    fontSize: 64,
    fontWeight: 'bold',
    marginBottom: 40
  },
  loadingText: {
    fontSize: 20,
    color: '#555'
  },
  activityButton: {
    backgroundColor: '#0397A7',
    paddingVertical: 20,
    paddingHorizontal: 50,
    borderRadius: 20,
    marginBottom: 30
  },
  disabledButton: {
    backgroundColor: '#CCC'
  },
  activityText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold'
  },
  emergencyButton: {
    backgroundColor: '#B71C1C',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 20
  },
  emergencyText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold'
  }
});

