// app/(app)/cuidador/healthRecords/add/heartRate.tsx

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { CareContext } from '../../../../../context/CareContext';

export default function AddHeartRateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addHealthRecord } = useContext(CareContext);

  const [value, setValue] = useState('');

  const onSubmit = async () => {
    if (!id || !value) {
      router.back();
      return;
    }
    const num = parseFloat(value);
    await addHealthRecord(id, { heartRate: num });
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Registro de Frecuencia</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Frecuencia (bpm)</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ingrese latidos por minuto"
            keyboardType="numeric"
            value={value}
            onChangeText={setValue}
          />
          <Text style={styles.unit}>bpm</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.btn, styles.btnAdd]} onPress={onSubmit}>
        <Text style={styles.btnText}>Agregar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:  { padding: 16, backgroundColor: '#fff' },
  back:       { marginBottom: 12 },
  backText:   { fontSize: 24 },
  title:      { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  field:      { marginBottom: 20 },
  label:      { fontSize: 14, marginBottom: 6, color: '#333' },
  inputRow:   {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#C9A84F',
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 8
  },
  input:      { flex: 1, height: 40 },
  unit:       { marginLeft: 8, color: '#333' },
  btn:        { padding: 12, borderRadius: 8, alignItems: 'center' },
  btnAdd:     { backgroundColor: '#C9A84F' },
  btnText:    { color: '#fff', fontWeight: 'bold' }
});
