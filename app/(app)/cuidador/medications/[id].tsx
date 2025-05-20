import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import { useContext, useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CareContext, MedicationData } from "../../../../context/CareContext";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../../../utils/Firebase";

const PURPLE = "#5526C9";
const LIGHT_PURPLE = "#E6DEFF";

export default function MedicationsScreen() {
  const { id, medId } = useLocalSearchParams();
  const router = useRouter();
  const [medications, setMedications] = useState<MedicationData[]>([]);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

  const weekdays = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
  const today = new Date();
  const dates = [...Array(7)].map((_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i - today.getDay());
    return date;
  });

  useEffect(() => {
    const fetchMeds = async () => {
      if (!id) return;
      const col = collection(db, "patients", id.toString(), "medications");
      const q = query(col);
      const snap = await getDocs(q);
      const meds = snap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate.toDate(),
        } as MedicationData;
      });
      setMedications(meds);
    };
    fetchMeds();
  }, [id]);

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const filtered = medications.filter((med) =>
    med.daysOfWeek.includes(dayNames[selectedDay])
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>{"<"}</Text>
      </TouchableOpacity>
      <Text style={styles.title}>💊 Medicamentos</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.daysScroll}
      >
        {dates.map((date, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.dayItem,
              selectedDay === i && styles.dayItemSelected,
            ]}
            onPress={() => setSelectedDay(i)}
          >
            <Text style={styles.dayText}>{weekdays[i]}</Text>
            <Text style={styles.dateText}>{date.getDate()}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 20 }}
        renderItem={({ item }) => (
          <View style={styles.medCard}>
            <View style={styles.medInfo}>
              <Text style={styles.medIcon}>💊</Text>
              <View>
                <Text style={styles.medName}>{item.name}</Text>
                <Text style={styles.medTime}>{item.schedule[0]}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() =>
                router.push(`../../cuidador/medications/${id}/edit/${medId}`)
              }
            >
              <Text style={styles.arrow}>{">"}</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push(`../../cuidador/medications/${id}/add`)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  daysScroll: {
    marginBottom: 20,
  },
  dayItem: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: PURPLE,
    borderRadius: 12,
    padding: 10,
    marginRight: 8,
  },
  dayItemSelected: {
    backgroundColor: LIGHT_PURPLE,
  },
  dayText: {
    fontSize: 14,
    color: "#333",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  medCard: {
    flexDirection: "row",
    backgroundColor: LIGHT_PURPLE,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    justifyContent: "space-between",
  },
  medInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  medIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  medName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  medTime: {
    fontSize: 14,
    color: "#333",
  },
  arrow: {
    fontSize: 24,
    color: PURPLE,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: PURPLE,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  fabText: {
    color: "#fff",
    fontSize: 28,
    lineHeight: 30,
  },
});
