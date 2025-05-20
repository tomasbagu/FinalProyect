import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView, ScrollView as RNScrollView } from 'react-native';
import { useState, useContext, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CareContext, MedicationData } from '../../../../../../context/CareContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../../../utils/Firebase';

const PURPLE = '#5526C9';
const LIGHT_PURPLE = '#E6DEFF';

const typeOptions: MedicationData['type'][] = ['Tableta', 'Capsula', 'Gotas', 'Inyeccion'];
const weekdayLabels = [
  { label: 'Lun', value: 'Mon' },
  { label: 'Mar', value: 'Tue' },
  { label: 'Mié', value: 'Wed' },
  { label: 'Jue', value: 'Thu' },
  { label: 'Vie', value: 'Fri' },
  { label: 'Sáb', value: 'Sat' },
  { label: 'Dom', value: 'Sun' },
];

const durationOptions = [
  { label: '1 semana', value: 7 },
  { label: '2 semanas', value: 14 },
  { label: '1 mes', value: 30 },
  { label: '3 meses', value: 90 },
];

export default function EditMedicationScreen() {
  const { id, medId } = useLocalSearchParams();
  const router = useRouter();
  const { updateMedication } = useContext(CareContext);

  const [type, setType] = useState<MedicationData['type']>('Capsula');
  const [name, setName] = useState('');
  const [dailyDose, setDailyDose] = useState(1);
  const [schedule, setSchedule] = useState<string[]>(['']);
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [durationDays, setDurationDays] = useState(30);
  const [durationDropdownOpen, setDurationDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchMedication = async () => {
      if (!id || !medId) return;
      const ref = doc(collection(db, 'patients', id.toString(), 'medications'), medId.toString());
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as MedicationData;
        setType(data.type);
        setName(data.name);
        setDailyDose(data.dailyDose);
        setSchedule(data.schedule);
        setStartDate(new Date(data.startDate));
        setSelectedDays(data.daysOfWeek);
        setDurationDays(data.durationDays);
      }
    };
    fetchMedication();
  }, [id, medId]);

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleUpdate = async () => {
    if (!id || !medId || !name || selectedDays.length === 0) return;
    const ok = await updateMedication(id.toString(), medId.toString(), {
      type,
      name,
      dailyDose,
      schedule: schedule.slice(0, dailyDose),
      startDate,
      daysOfWeek: selectedDays,
      durationDays
    });
    if (ok) router.back();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>{'<'} </Text>
          </TouchableOpacity>
          <Text style={styles.title}>Editar Medicamento</Text>

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

          <Text style={styles.label}>Nombre Medicamento</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ej: Aspirina"
          />

          <Text style={styles.label}>Dosificación (diaria)</Text>
          <View style={styles.doseRow}>
            <TouchableOpacity onPress={() => setDailyDose(Math.max(1, dailyDose - 1))}>
              <Text style={styles.doseControl}>-</Text>
            </TouchableOpacity>
            <Text style={styles.doseNumber}>{dailyDose}</Text>
            <TouchableOpacity onPress={() => setDailyDose(dailyDose + 1)}>
              <Text style={styles.doseControl}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Horario</Text>
          <RNScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
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
          </RNScrollView>

          <Text style={styles.label}>Comienzo</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
            <Text>{startDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(e, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setStartDate(selectedDate);
              }}
            />
          )}

          <Text style={styles.label}>Días</Text>
          <View style={styles.daysRow}>
            {weekdayLabels.map(day => (
              <TouchableOpacity
                key={day.value}
                onPress={() => toggleDay(day.value)}
                style={[styles.dayButton, selectedDays.includes(day.value) && styles.dayButtonSelected]}
              >
                <Text style={{ color: selectedDays.includes(day.value) ? '#fff' : '#000' }}>{day.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Duración</Text>
          <View style={{ zIndex: 1000 }}>
            <DropDownPicker
              open={durationDropdownOpen}
              value={durationDays}
              items={durationOptions}
              setOpen={setDurationDropdownOpen}
              setValue={setDurationDays}
              style={styles.input}
              dropDownContainerStyle={{ borderColor: '#ccc' }}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleUpdate}>
            <Text style={styles.buttonText}>Guardar Cambios</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff'
  },
  backButton: {
    marginBottom: 10
  },
  backButtonText: {
    fontSize: 24
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20
  },
  typeButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#eee',
    marginRight: 8
  },
  typeSelected: {
    backgroundColor: LIGHT_PURPLE
  },
  label: {
    marginTop: 10,
    marginBottom: 4,
    fontSize: 14,
    fontWeight: 'bold'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10
  },
  dayButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12
  },
  dayButtonSelected: {
    backgroundColor: PURPLE,
    borderColor: PURPLE
  },
  doseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10
  },
  doseControl: {
    fontSize: 28,
    paddingHorizontal: 16
  },
  doseNumber: {
    fontSize: 18
  },
  button: {
    marginTop: 30,
    backgroundColor: PURPLE,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
