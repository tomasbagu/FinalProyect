// app/(app)/cuidador/caregiver.tsx

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { collection, getDocs } from "firebase/firestore";
import { AuthContext } from "../../../context/AuthContext";
import { AppointmentData, CareContext } from "../../../context/CareContext";
import { db } from "../../../utils/Firebase";

const GEMINI_API_KEY = "AIzaSyAHE2ekZnimvCMVf1xeHPHgEI8fxTHJF1k";
type Message = { text: string; sender: "user" | "ai" };

export default function CaregiverHomeScreen() {
  const router = useRouter();
  const { currentUser, logout } = useContext(AuthContext);
  const { patients, loadingPatients } = useContext(CareContext);

  // Todas las citas para la sección
  const [appointments, setAppointments] = useState<
    (AppointmentData & { patientName: string })[]
  >([]);
  const [loadingApps, setLoadingApps] = useState(true);

  // sidebar & ayuda AI
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  // bloquear atrás
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, []);

  // Cargar citas de cada paciente siempre que cambie 'patients'
  useEffect(() => {
    if (!patients.length) {
      setAppointments([]);
      setLoadingApps(false);
      return;
    }
    setLoadingApps(true);
    (async () => {
      const all: (AppointmentData & { patientName: string })[] = [];
      for (const p of patients) {
        const snap = await getDocs(collection(db, "patients", p.id, "appointments"));
        snap.docs.forEach((doc) => {
          const data = doc.data() as any;
          all.push({
            id: doc.id,
            doctorName: data.doctorName,
            specialization: data.specialization,
            dateTime: data.dateTime.toDate(),
            patientName: `${p.name} ${p.surname}`,
          });
        });
      }
      // ordenar por fecha ascendente
      all.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
      setAppointments(all);
      setLoadingApps(false);
    })();
  }, [patients]);

  const userName = currentUser
    ? "displayName" in currentUser && currentUser.displayName
      ? currentUser.displayName
      : (currentUser as { name: string }).name
    : "";

  const handleAddPatient = () => {
    router.replace("/cuidador/addPatient");
  };

  const handleLogout = async () => {
    await logout();
    setSidebarVisible(false);
    router.replace("/");
  };

  const sendHelpQuery = async () => {
    if (!userInput.trim()) return;
    const userMsg: Message = { text: userInput.trim(), sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setUserInput("");
    setLoadingAI(true);

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userMsg.text }] }],
          }),
        }
      );
      const data = await res.json();
      const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No se obtuvo respuesta.";
      setMessages((prev) => [...prev, { text: aiText, sender: "ai" }]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        { text: "Error al obtener ayuda.", sender: "ai" },
      ]);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.greeting}>¡Hola!</Text>
          <Text style={styles.name}>{userName}</Text>
        </View>
        <TouchableOpacity onPress={() => setSidebarVisible(true)}>
          <Ionicons name="person-circle" size={40} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Pacientes */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>Pacientes</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddPatient}
          >
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
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.patientCard}
                onPress={() =>
                  router.push({
                    pathname: "/cuidador/patientDetail/[id]",
                    params: { id: item.id },
                  })
                }
              >
                <View style={styles.backgroundShapes}>
                  {[...Array(4)].map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.shape,
                        {
                          top: i,
                          backgroundColor: `rgba(178, 122, 255, ${
                            0.9 - i * 0.25
                          })`,
                          height: 70 + i * 20,
                          width: 70 + i * 20,
                        },
                      ]}
                    />
                  ))}
                </View>
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
            )}
          />
        )}
      </View>

      {/* Citas Médicas */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>Citas Médicas</Text>
          {/* Aquí podrías añadir un botón “+” para crear nueva cita, si quieres */}
        </View>

        {loadingApps ? (
          <ActivityIndicator size="large" color={PURPLE} />
        ) : appointments.length === 0 ? (
          <Text style={styles.noPatientsText}>No hay citas registradas.</Text>
        ) : (
          <FlatList
            data={appointments}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
           renderItem={({ item }) => {
  const dt = new Date(item.dateTime);
  const day = dt.getDate();                              // 20
  const weekday = dt.toLocaleDateString('es-ES', { weekday: 'short' }); // Tue
  const time = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); // 10:00 AM

        return (
          <View style={styles.appointmentRow}>
            {/* Bloque fecha */}
            <View style={styles.appointmentDateBlock}>
              <Text style={styles.appointmentDay}>{day}</Text>
              <Text style={styles.appointmentWeekday}>{weekday.toUpperCase()}</Text>
            </View>
            {/* Info cita */}
            <View style={styles.appointmentInfoBlock}>
              <Text style={styles.appointmentTime}>{time}</Text>
              <Text style={styles.appointmentDoctor}>Dr. {item.doctorName}</Text>
              <Text style={styles.appointmentSpec}>{item.specialization}</Text>
            </View>
          </View>
        )
      }}
          />
        )}
      </View>

      {/* Botón Ayuda */}
      <TouchableOpacity
        style={styles.helpButton}
        onPress={() => setHelpVisible(true)}
      >
        <Text style={styles.helpButtonText}>?</Text>
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
          onPress={() => setSidebarVisible(false)}
        />
        <View style={styles.sidebar}>
          <Text style={styles.sidebarTitle}>Menú</Text>
          <TouchableOpacity style={styles.sidebarItem} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#333" />
            <Text style={styles.sidebarItemText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Modal de Ayuda AI */}
      <Modal
        visible={helpVisible}
        animationType="slide"
        onRequestClose={() => setHelpVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setHelpVisible(false)}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Ayuda AI</Text>
          </View>

          <ScrollView
            style={styles.chatContainer}
            contentContainerStyle={{ padding: 16 }}
          >
            {messages.map((msg, idx) => (
              <View
                key={idx}
                style={[
                  styles.chatBubble,
                  msg.sender === "user"
                    ? styles.userBubble
                    : styles.aiBubble,
                ]}
              >
                <Text
                  style={[
                    styles.chatText,
                    msg.sender === "user" ? styles.userText : styles.aiText,
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
            ))}
            {loadingAI && <ActivityIndicator size="small" color={PURPLE} />}
          </ScrollView>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.inputContainer}
          >
            <TextInput
              style={styles.input}
              placeholder="¿En qué puedo ayudarte?"
              value={userInput}
              onChangeText={setUserInput}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendHelpQuery}
            >
              <Ionicons name="send" size={24} color="#fff" />
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const PURPLE = "#5526C9";
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingLeft: 30,
    paddingRight: 10,
    paddingTop: 10,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
    marginTop: 40,
  },
  greeting: {
    fontSize: 24,
    color: "#333",
    fontFamily: "QuickSand",
    marginTop: 20,
  },
  name: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#000",
    fontFamily: "QuickSand",
  },

  sectionContainer: { marginBottom: 20 },
  sectionHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    fontFamily: "QuickSand",
  },

  addButton: {
    width: 40,
    height: 28,
    borderRadius: 14,
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: { color: "#fff", fontSize: 20, lineHeight: 20 },

  noPatientsContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F1F1F1",
    borderRadius: 12,
  },
  noPatientsText: { fontSize: 16, color: "#666", marginBottom: 10 },
  registerPrompt: {
    backgroundColor: PURPLE,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  registerPromptText: { color: "#fff", fontSize: 14 },

  patientCard: {
    flexDirection: "row",
    backgroundColor: "#e1d1f7",
    borderRadius: 28,
    padding: 16,
    alignItems: "center",
    marginRight: 12,
    height: 140,
  },
  backgroundShapes: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 0,
    zIndex: -1,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingLeft: 20,
  },
  shape: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 30,
  },
  patientAvatar: {
    width: 110,
    height: 90,
    borderRadius: 15,
    marginRight: 16,
  },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 20, fontWeight: "bold", color: PURPLE },
  patientAge: { fontSize: 14, color: PURPLE },

  /* sección de citas */
  appointmentRow: {
  flexDirection: 'row',
  backgroundColor: '#E6E5F8',
  borderRadius: 24,
  marginBottom: 12,
  height: 80,
  overflow: 'hidden'
},
appointmentDateBlock: {
  width:  60,
  backgroundColor: '#898AEF',
  justifyContent: 'center',
  alignItems: 'center'
},
appointmentDay: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#fff',
  lineHeight: 28
},
appointmentWeekday: {
  fontSize: 12,
  color: '#fff',
  marginTop: 4
},
appointmentInfoBlock: {
  flex: 1,
  paddingHorizontal: 16,
  justifyContent: 'center'
},
appointmentTime: {
  fontSize: 14,
  color: '#5E5EAE',
  marginBottom: 4
},
appointmentDoctor: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#333'
},
appointmentSpec: {
  fontSize: 14,
  color: '#666'
},


  helpButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  helpButtonText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  sidebarOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sidebar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    width: "70%",
    backgroundColor: "#fff",
    padding: 20,
    elevation: 5,
  },
  sidebarTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  sidebarItemText: { fontSize: 16, marginLeft: 12, color: "#333" },

  /* Help Modal */
  modalContainer: { flex: 1, backgroundColor: "#fff" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginLeft: 16 },
  chatContainer: { flex: 1 },
  chatBubble: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    maxWidth: "80%",
  },
  userBubble: { backgroundColor: PURPLE, alignSelf: "flex-end" },
  aiBubble: { backgroundColor: "#eee", alignSelf: "flex-start" },
  chatText: { fontSize: 14 },
  userText: { color: "#fff" },
  aiText: { color: "#333" },

  inputContainer: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#F1F1F1",
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: PURPLE,
    borderRadius: 20,
    padding: 8,
  },
});
