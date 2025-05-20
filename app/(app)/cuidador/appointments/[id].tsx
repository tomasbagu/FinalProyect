// app/(app)/cuidador/appointments/add.tsx

import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { CareContext } from '../../../../context/CareContext';

const PURPLE = '#5526C9';
const LIGHT_PURPLE = '#E6DEFF';

export default function AddAppointmentScreen() {
  const { id: patientId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { assignAppointment } = useContext(CareContext);

  const [doctor, setDoctor] = useState('');
  const [specialty, setSpecialty] = useState('');

  // próximo 7 días
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState(days[0]);

  // franjas horarias
  const SLOTS = ['08:00 am','10:00 am','12:00 pm','02:00 pm','04:00 pm','06:00 pm'];
  const [selectedTime, setSelectedTime] = useState(SLOTS[0]);

  const onSubmit = async () => {
    if (!patientId || !doctor.trim() || !specialty.trim()) {
      router.back();
      return;
    }
    // construir Date de cita
    let [time, ampm] = selectedTime.split(' ');
    let [h, m] = time.split(':').map(n => +n);
    if (ampm === 'pm' && h < 12) h += 12;
    if (ampm === 'am' && h === 12) h = 0;
    const dateTime = new Date(selectedDate);
    dateTime.setHours(h, m);

    await assignAppointment(patientId, {
      doctorName: doctor.trim(),
      specialization: specialty.trim(),
      dateTime
    });
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Agendar Cita Médica</Text>

      {/* Doctor y Especialidad */}
      <View style={styles.field}>
        <Text style={styles.label}>Doctor</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre del doctor"
          value={doctor}
          onChangeText={setDoctor}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Especialidad</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Cardiología"
          value={specialty}
          onChangeText={setSpecialty}
        />
      </View>

      {/* Selector de fecha */}
      <Text style={styles.sectionLabel}>Fecha</Text>
      <View style={styles.calendar}>
        {days.map((d, i) => {
          const sel = d.toDateString() === selectedDate.toDateString();
          return (
            <TouchableOpacity
              key={i}
              style={[styles.dayBox, sel && styles.dayBoxSel]}
              onPress={() => setSelectedDate(d)}
            >
              <Text style={styles.dayWeek}>
                {d.toLocaleDateString('es-ES',{weekday:'short'})}
              </Text>
              <Text style={styles.dayNum}>{d.getDate()}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selector de hora */}
      <View style={styles.field}>
        <Text style={styles.label}>Hora</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedTime}
            onValueChange={setSelectedTime}
            style={Platform.OS==='ios'?{height:120}:{height:40}}
          >
            {SLOTS.map(s => <Picker.Item key={s} label={s} value={s} />)}
          </Picker>
        </View>
      </View>

      {/* Botón Agregar */}
      <TouchableOpacity style={styles.btnAdd} onPress={onSubmit}>
        <Text style={styles.btnAddText}>Agregar Cita</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:     { padding: 16, backgroundColor: '#fff' },
  back:          { marginBottom: 12 },
  backText:      { fontSize: 16, color: PURPLE },
  title:         { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },

  field:         { marginBottom: 16 },
  label:         { fontSize: 14, color: '#333', marginBottom: 6 },
  input:         {
    borderWidth: 1,
    borderColor: LIGHT_PURPLE,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44
  },

  sectionLabel: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  calendar:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  dayBox:        {
    borderWidth: 1,
    borderColor: LIGHT_PURPLE,
    borderRadius: 8,
    width: 40,
    paddingVertical: 6,
    alignItems: 'center'
  },
  dayBoxSel:     { backgroundColor: LIGHT_PURPLE },
  dayWeek:       { fontSize: 10, color: '#333' },
  dayNum:        { fontSize: 14, fontWeight: 'bold', color: '#333' },

  pickerWrapper: {
    borderWidth: 1,
    borderColor: LIGHT_PURPLE,
    borderRadius: 8,
    overflow: 'hidden'
  },

  btnAdd:        {
    backgroundColor: PURPLE,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12
  },
  btnAddText:    { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
