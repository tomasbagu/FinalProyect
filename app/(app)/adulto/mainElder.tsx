// app/(app)/adulto/index.tsx

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import { db } from '../../../utils/Firebase';

export default function MainElder() {
  const router = useRouter();
  const { currentUser, logout } = useContext(AuthContext);

  const [time, setTime] = useState('');
  const [currentPatient, setCurrentPatient] = useState<any>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Actualizar la hora cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
      const formattedTime = `${String(hours % 12 || 12).padStart(2, '0')}:${String(
        minutes
      ).padStart(2, '0')} ${ampm}`;
      setTime(formattedTime);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cargar datos del paciente
  useEffect(() => {
    const fetchPatient = async () => {
      if (!currentUser) return;
      if ('role' in currentUser && currentUser.role === 'elder') {
        const snap = await getDoc(doc(db, 'patients', currentUser.uid));
        if (snap.exists()) {
          setCurrentPatient({ id: snap.id, ...snap.data() });
        }
        return;
      }
      const col = collection(db, 'patients');
      const q = query(col, where('caregiverId', '==', currentUser.uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        setCurrentPatient({ id: docSnap.id, ...docSnap.data() });
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
      {/* Botón del sidebar */}
      <TouchableOpacity
        style={styles.menuIcon}
        onPress={() => setSidebarVisible(true)}
      >
        <Ionicons name="menu-outline" size={32} color="#333" />
      </TouchableOpacity>

      {/* Hora centrada */}
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

      {/* Sidebar */}
      <Modal
        visible={sidebarVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSidebarVisible(false)}
      >
        <TouchableOpacity
          style={styles.sidebarOverlay}
          activeOpacity={1}
          onPress={() => setSidebarVisible(false)}
        />
        <View style={styles.sidebar}>
          <Text style={styles.sidebarTitle}>Menú</Text>
          <TouchableOpacity
            style={styles.sidebarItem}
            onPress={async () => {
              await logout();
              router.replace('/');
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="#333" />
            <Text style={styles.sidebarItemText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  menuIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10
  },
  time: {
    fontSize: 64,
    fontWeight: 'bold',
    textAlign: 'center'
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
    marginTop: 40,
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
  },
  sidebarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '70%',
    backgroundColor: '#fff',
    padding: 20,
    elevation: 5
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12
  },
  sidebarItemText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333'
  }
});
