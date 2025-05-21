
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { CareContext } from '../../../../../context/CareContext';
import { db } from '../../../../../utils/Firebase';

export default function AddTemperatureScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addHealthRecord } = useContext(CareContext);

  const [value, setValue] = useState('');
  const [records, setRecords] = useState<{ id: string; temperature: number; date: Date }[]>([]);

  // suscripción en tiempo real a todos los registros de temperatura
  useEffect(() => {
    if (!id) return;
    const col = collection(db, 'patients', id, 'healthRecords');
    const q = query(col, orderBy('dateTime', 'desc'));
    const unsub = onSnapshot(q, snap => {
      const list = snap.docs
        .map(d => {
          const data = d.data() as any;
          if (data.temperature == null) return null;
          return {
            id: d.id,
            temperature: data.temperature,
            date: data.dateTime.toDate()
          };
        })
        .filter((x): x is { id: string; temperature: number; date: Date } => !!x);
      setRecords(list);
    });
    return () => unsub();
  }, [id]);

  const onSubmit = async () => {
    if (!id || !value) {
      router.back();
      return;
    }
    const num = parseFloat(value);
    await addHealthRecord(id, { temperature: num });
    setValue('');
  };

  // calcular promedio de temperaturas
  const avg =
    records.length > 0
      ? records.reduce((sum, r) => sum + r.temperature, 0) / records.length
      : 0;

  const fmtDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Registro de Temperatura</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Temperatura (°C)</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ingrese temperatura en °C"
            keyboardType="numeric"
            value={value}
            onChangeText={setValue}
          />
          <Text style={styles.unit}>°C</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.btn, styles.btnAdd]} onPress={onSubmit}>
        <Text style={styles.btnText}>Agregar</Text>
      </TouchableOpacity>

      {/* --- Resumen promedio y lista de históricos --- */}
      {records.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Resumen Registros</Text>
          <View style={styles.averageCard}>
            <Text style={styles.averageLabel}>Promedio</Text>
            <Text style={styles.averageValue}>{avg.toFixed(1)} °C</Text>
          </View>

          <Text style={styles.sectionTitle}>Historial</Text>
          <View style={styles.historyGrid}>
            {records.slice(0, 6).map(r => (
              <View key={r.id} style={styles.historyCard}>
                <Text style={styles.historyDate}>{fmtDate(r.date)}</Text>
                <Text style={styles.historyLabel}>Registro</Text>
                <Text style={styles.historyValue}>{r.temperature} °C</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:     { padding: 16, backgroundColor: '#fff' },
  back:          { marginBottom: 12 },
  backText:      { fontSize: 24 },
  title:         { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },

  field:         { marginBottom: 20 },
  label:         { fontSize: 14, marginBottom: 6, color: '#333' },
  inputRow:      {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#C9A84F',
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 8
  },
  input:         { flex: 1, height: 40 },
  unit:          { marginLeft: 8, color: '#333' },

  btn:           { padding: 12, borderRadius: 8, alignItems: 'center' },
  btnAdd:        { backgroundColor: '#C9A84F', marginBottom: 24 },
  btnText:       { color: '#fff', fontWeight: 'bold' },

  sectionTitle:  { fontSize: 18, fontWeight: 'bold', marginVertical: 12, color: '#333' },

  averageCard: {
  backgroundColor: '#F6E8B1',
  borderRadius: 24,
  padding: 20,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20,
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 5,
  elevation: 2
},
averageLabel: {
  fontSize: 14,
  color: '#333',
  fontWeight: '600'
},
averageValue: {
  fontSize: 32,
  fontWeight: 'bold',
  color: '#000'
},

historyGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between'
},
historyCard: {
  width: '48%',
  backgroundColor: '#F6E8B1',
  borderRadius: 24,
  paddingVertical: 20,
  paddingHorizontal: 16,
  marginBottom: 12,
  alignItems: 'flex-start'
},
historyDate: {
  fontSize: 12,
  color: '#000',
  fontWeight: 'bold',
  alignSelf: 'flex-end'
},
historyLabel: {
  fontSize: 12,
  color: '#555',
  marginTop: 8
},
historyValue: {
  fontSize: 20,
  fontWeight: 'bold',
  marginTop: 2,
  color: '#000'
}

});