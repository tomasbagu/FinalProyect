// app/(app)/cuidador/medications/[id]/addMedication.tsx
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CareContext, MedicationData } from '../../../../../context/CareContext';
import { fetchMedicationSuggestions } from '../../../../../utils/medications';

const PURPLE = '#5526C9';
const LIGHT_PURPLE = '#E6DEFF';

const typeOptions: MedicationData['type'][] = [
  'Tableta',
  'Capsula',
  'Gotas',
  'Inyeccion'
];
const weekdayLabels = [
  { label: 'Lun', value: 'Mon' },
  { label: 'Mar', value: 'Tue' },
  { label: 'Mié', value: 'Wed' },
  { label: 'Jue', value: 'Thu' },
  { label: 'Vie', value: 'Fri' },
  { label: 'Sáb', value: 'Sat' },
  { label: 'Dom', value: 'Sun' }
];
const durationOptions = [
  { label: '1 semana', value: 7 },
  { label: '2 semanas', value: 14 },
  { label: '1 mes', value: 30 },
  { label: '3 meses', value: 90 }
];

export default function AddMedicationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { assignMedication } = useContext(CareContext);

  const [type, setType] = useState<MedicationData['type']>('Capsula');
  const [name, setName] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const [dailyDose, setDailyDose] = useState(3);
  const [schedule, setSchedule] = useState<string[]>(['08:00', '13:00', '19:00']);
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [durationDays, setDurationDays] = useState(30);

  const suggestToken = useRef(0);

  // Al cambiar el nombre, obtener sugerencias
  useEffect(() => {
    if (name.length < 3) {
      setSuggestions([]);
      return;
    }
    const token = ++suggestToken.current;
    setLoadingSuggestions(true);
    fetchMedicationSuggestions(name)
      .then(list => {
        if (token === suggestToken.current) setSuggestions(list);
      })
      .catch(() => {
        if (token === suggestToken.current) setSuggestions([]);
      })
      .finally(() => {
        if (token === suggestToken.current) setLoadingSuggestions(false);
      });
  }, [name]);

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Reemplaza router.back() por router.replace al detalle del paciente
  const goToPatientDetail = () => {
    router.replace({
      pathname: '/cuidador/patientDetail/[id]',
      params: { id }
    });
  };

  const handleAdd = async () => {
    if (!id || !name.trim() || selectedDays.length === 0) return;
    const ok = await assignMedication(id, {
      type,
      name: name.trim(),
      dailyDose,
      schedule: schedule.slice(0, dailyDose),
      startDate,
      daysOfWeek: selectedDays,
      durationDays
    });
    if (ok) {
      goToPatientDetail();
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="always"
        >
          {/* Back */}
          <TouchableOpacity onPress={goToPatientDetail} style={styles.backButton}>
            <Text style={styles.backButtonText}>{'<'} Volver</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Agrega la información del medicamento</Text>

          {/* Tipo */}
          <View style={styles.typeSelector}>
            {typeOptions.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.typeButton, t === type && styles.typeSelected]}
                onPress={() => setType(t)}
              >
                <Text>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Nombre + sugerencias */}
          <Text style={styles.label}>Nombre Medicamento</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ej: Aspirina"
          />
          {loadingSuggestions && (
            <ActivityIndicator size="small" color={PURPLE} />
          )}
          {suggestions.map((s, idx) => (
            <TouchableOpacity
              key={`${s}-${idx}`}
              style={styles.suggestion}
              onPress={() => {
                setName(s);
                setSuggestions([]);
              }}
            >
              <Text>{s}</Text>
            </TouchableOpacity>
          ))}

          {/* Dosificación diaria */}
          <Text style={styles.label}>Dosificación (diaria)</Text>
          <View style={styles.doseRow}>
            <TouchableOpacity onPress={() => setDailyDose(Math.max(1, dailyDose - 1))}>
              <Text style={styles.doseControl}>−</Text>
            </TouchableOpacity>
            <Text style={styles.doseNumber}>{dailyDose}</Text>
            <TouchableOpacity onPress={() => setDailyDose(dailyDose + 1)}>
              <Text style={styles.doseControl}>＋</Text>
            </TouchableOpacity>
          </View>

          {/* Horario */}
          <Text style={styles.label}>Horario</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 10 }}
          >
            {Array.from({ length: dailyDose }).map((_, i) => (
              <TextInput
                key={i}
                style={[styles.input, { width: 100, marginRight: 10 }]}
                value={schedule[i] || ''}
                onChangeText={val => {
                  const copy = [...schedule];
                  copy[i] = val;
                  setSchedule(copy);
                }}
                placeholder="08:00"
              />
            ))}
          </ScrollView>

          {/* Fecha de inicio */}
          <Text style={styles.label}>Comienzo</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.input}
          >
            <Text>{startDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, sel) => {
                setShowDatePicker(false);
                if (sel) setStartDate(sel);
              }}
            />
          )}

          {/* Días */}
          <Text style={styles.label}>Días</Text>
          <View style={styles.daysRow}>
            {weekdayLabels.map(day => (
              <TouchableOpacity
                key={day.value}
                onPress={() => toggleDay(day.value)}
                style={[
                  styles.dayButton,
                  selectedDays.includes(day.value) && styles.dayButtonSelected
                ]}
              >
                <Text
                  style={{
                    color: selectedDays.includes(day.value) ? '#fff' : '#000'
                  }}
                >
                  {day.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Duración */}
          <Text style={styles.label}>Duración</Text>
          <View style={styles.daysRow}>
            {durationOptions.map(opt => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setDurationDays(opt.value)}
                style={[
                  styles.dayButton,
                  durationDays === opt.value && styles.dayButtonSelected
                ]}
              >
                <Text
                  style={{
                    color: durationDays === opt.value ? '#fff' : '#000'
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Agregar */}
          <TouchableOpacity style={styles.button} onPress={handleAdd}>
            <Text style={styles.buttonText}>Agregar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  backButton: { marginBottom: 10 },
  backButtonText: { fontSize: 16, color: PURPLE },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  typeSelector: { flexDirection: 'row', marginBottom: 20 },
  typeButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#eee',
    marginRight: 8
  },
  typeSelected: { backgroundColor: LIGHT_PURPLE },
  label: { marginTop: 10, marginBottom: 4, fontSize: 14, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 4
  },
  suggestion: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderColor: '#eee'
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10
  },
  dayButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8
  },
  dayButtonSelected: {
    backgroundColor: PURPLE,
    borderColor: PURPLE
  },
  doseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  doseControl: { fontSize: 28, paddingHorizontal: 16 },
  doseNumber: { fontSize: 18 },
  button: {
    marginTop: 30,
    backgroundColor: PURPLE,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});