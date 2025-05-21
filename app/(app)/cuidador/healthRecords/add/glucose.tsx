// app/(app)/cuidador/healthRecords/add/glucose.tsx

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

export default function AddGlucoseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addHealthRecord } = useContext(CareContext);

  const [value, setValue] = useState('');
  const [records, setRecords] = useState<{ id: string; glucose: number; date: Date }[]>([]);

  // Suscripción en tiempo real a todos los registros de glucosa
  useEffect(() => {
    if (!id) return;
    const col = collection(db, 'patients', id, 'healthRecords');
    const q = query(col, orderBy('dateTime', 'desc'));
    const unsub = onSnapshot(q, snap => {
      const list = snap.docs
        .map(d => {
          const data = d.data() as any;
          if (data.glucose == null) return null;
          return {
            id: d.id,
            glucose: data.glucose,
            date: data.dateTime.toDate()
          };
        })
        .filter(
          (x): x is { id: string; glucose: number; date: Date } => !!x
        );
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
    if (isNaN(num)) {
      setValue('');
      return;
    }
    await addHealthRecord(id, { glucose: num });
    setValue('');
  };

  const fmtDate = (d: Date) =>
    d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Registro de Glucosa</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Glucosa (mg/dL)</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ingrese glucosa en mg/dL"
            keyboardType="numeric"
            value={value}
            onChangeText={setValue}
          />
          <Text style={styles.unit}>mg/dL</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.btn, styles.btnAdd]} onPress={onSubmit}>
        <Text style={styles.btnText}>Agregar</Text>
      </TouchableOpacity>

      {/* Historial de registros */}
      {records.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Historial de Glucosa</Text>
          <View style={styles.historyGrid}>
            {records.map(r => (
              <View key={r.id} style={styles.historyCard}>
                <Text style={styles.historyDate}>{fmtDate(r.date)}</Text>
                <Text style={styles.historyValue}>{r.glucose} mg/dL</Text>
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

  sectionTitle:  { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333' },

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
  historyValue:  { fontSize: 16, fontWeight: 'bold', color: '#333' }
});
