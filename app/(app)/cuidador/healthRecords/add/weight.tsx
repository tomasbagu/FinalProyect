

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../../../../utils/Firebase';
import { CareContext } from '../../../../../context/CareContext';

export default function AddWeightScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addHealthRecord } = useContext(CareContext);

  const [value, setValue] = useState('');
  const [records, setRecords] = useState<{ id: string; weight: number; date: Date }[]>([]);

  // suscripción en tiempo real a todos los registros de peso
  useEffect(() => {
    if (!id) return;
    const col = collection(db, 'patients', id, 'healthRecords');
    const q = query(col, orderBy('dateTime', 'desc'));
    const unsub = onSnapshot(q, snap => {
      const list = snap.docs
        .map(d => {
          const data = d.data() as any;
          if (data.weight == null) return null;
          return {
            id: d.id,
            weight: data.weight,
            date: data.dateTime.toDate()
          };
        })
        .filter((x): x is { id: string; weight: number; date: Date } => !!x);
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
    await addHealthRecord(id, { weight: num });
    setValue('');
  };

  // promedio de pesos
  const avg =
    records.length > 0
      ? records.reduce((sum, r) => sum + r.weight, 0) / records.length
      : 0;

  const fmtDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Registro de Peso</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Peso (kg)</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ingrese el peso en kg"
            keyboardType="numeric"
            value={value}
            onChangeText={setValue}
          />
          <Text style={styles.unit}>kg</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.btn, styles.btnAdd]} onPress={onSubmit}>
        <Text style={styles.btnText}>Agregar</Text>
      </TouchableOpacity>

      {/* --- Resumen promedio y lista --- */}
      {records.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Resumen Registros</Text>
          <View style={styles.averageCard}>
            <Text style={styles.averageLabel}>Promedio</Text>
            <Text style={styles.averageValue}>{avg.toFixed(1)} kg</Text>
          </View>

          <Text style={styles.sectionTitle}>Historial</Text>
          <View style={styles.historyGrid}>
            {records.slice(0, 6).map(r => (
              <View key={r.id} style={styles.historyCard}>
                <Text style={styles.historyDate}>{fmtDate(r.date)}</Text>
                <Text style={styles.historyLabel}>Registro</Text>
                <Text style={styles.historyValue}>{r.weight} kg</Text>
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

  averageCard:   {
    backgroundColor: '#F6E8B1',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  averageLabel:  { fontSize: 14, color: '#666' },
  averageValue:  { fontSize: 24, fontWeight: 'bold', color: '#333' },

  historyGrid:   { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  historyCard:   {
    width: '48%',
    backgroundColor: '#F6E8B1',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 12,
    alignItems: 'center'
  },
  historyDate:   { fontSize: 12, color: '#666', marginBottom: 4 },
  historyLabel:  { fontSize: 12, color: '#333' },
  historyValue:  { fontSize: 16, fontWeight: 'bold', marginTop: 4 }
});