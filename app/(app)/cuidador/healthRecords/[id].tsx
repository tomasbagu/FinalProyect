// app/(app)/cuidador/healthRecords/[id].tsx

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    collection,
    onSnapshot,
    orderBy,
    query
} from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { CareContext } from '../../../../context/CareContext';
import { db } from '../../../../utils/Firebase';

const CARD_BG = '#F6E8B1';
const TEXT_COLOR = '#333';

type HealthRecordData = {
    id: string;
    bloodPressure?: { sys: number; dia: number };
    heartRate?: number;
    oxygen?: number;
    weight?: number;
    glucose?: number;
    temperature?: number;
    dateTime: Date;
};

export default function HealthRecordsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { patients } = useContext(CareContext);
    const patient = patients.find(p => p.id === id);

    const [records, setRecords] = useState<HealthRecordData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const col = collection(db, 'patients', id, 'healthRecords');
        const q = query(col, orderBy('dateTime', 'desc'));
        const unsub = onSnapshot(q, snap => {
            const list = snap.docs.map(d => {
                const data = d.data() as any;
                return {
                    id: d.id,
                    bloodPressure: data.bloodPressure,
                    heartRate: data.heartRate,
                    oxygen: data.oxygen,
                    weight: data.weight,
                    glucose: data.glucose,
                    temperature: data.temperature,
                    dateTime: data.dateTime.toDate(),
                } as HealthRecordData;
            });
            setRecords(list);
            setLoading(false);
        });
        return () => unsub();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={TEXT_COLOR} />
            </View>
        );
    }

    if (!patient) {
        return (
            <View style={styles.centered}>
                <Text style={{ color: 'red' }}>Paciente no encontrado.</Text>
            </View>
        );
    }

    // buscar el registro más reciente de cada métrica
    const lastBP      = records.find(r => r.bloodPressure);
    const lastOxygen  = records.find(r => r.oxygen      != null);
    const lastWeight  = records.find(r => r.weight      != null);
    const lastGlucose = records.find(r => r.glucose     != null);
    const lastTemp    = records.find(r => r.temperature != null);
    const lastHR      = records.find(r => r.heartRate   != null);

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            {/* FLECHA DE REGRESO */}
            <TouchableOpacity
                style={styles.backArrow}
                onPress={() => router.back()}
            >
                <Ionicons name="arrow-back" size={24} color={TEXT_COLOR} />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.container}>
                {/* Header Paciente */}
                <TouchableOpacity
                    style={styles.header}
                    onPress={() => router.push({
                        pathname: '/cuidador/patientDetail/[id]',
                        params: { id }
                    })}
                >
                    <Image source={{ uri: patient.photoUrl }} style={styles.avatar} />
                    <View style={styles.info}>
                        <Text style={styles.name}>
                            {patient.name} {patient.surname}
                        </Text>
                        <Text style={styles.meta}>
                            Edad: {patient.age}  •  Grupo sanguíneo: {patient.bloodType}
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Últimos Registros */}
                <Text style={styles.title}>Registros de Salud</Text>
                <View style={styles.summaryCard}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Presión Arterial</Text>
                        <Text style={styles.summaryValue}>
                            {lastBP
                                ? `${lastBP.bloodPressure!.sys} SYS – ${lastBP.bloodPressure!.dia} DIA`
                                : '--'
                            }
                        </Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Oximetría</Text>
                        <Text style={styles.summaryValue}>
                            {lastOxygen ? `${lastOxygen.oxygen}%` : '--'}
                        </Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Peso Corporal</Text>
                        <Text style={styles.summaryValue}>
                            {lastWeight ? `${lastWeight.weight} kg` : '--'}
                        </Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Glucosa</Text>
                        <Text style={styles.summaryValue}>
                            {lastGlucose ? `${lastGlucose.glucose} mg/dL` : '--'}
                        </Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Temperatura</Text>
                        <Text style={styles.summaryValue}>
                            {lastTemp ? `${lastTemp.temperature} °C` : '--'}
                        </Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Frecuencia cardiaca</Text>
                        <Text style={styles.summaryValue}>
                            {lastHR ? `${lastHR.heartRate} bpm` : '--'}
                        </Text>
                    </View>
                </View>

                {/* Botones de Añadir Registro */}
                <Text style={styles.sectionTitle}>Añadir Registro</Text>
                <View style={styles.grid}>
                    <TouchableOpacity
                        style={styles.metricCard}
                        onPress={() =>
                            router.push({
                                pathname: '/cuidador/healthRecords/add/weight',
                                params: { id }
                            })
                        }
                    >
                        <View style={styles.folderTab} />
                        <Text style={styles.metricTitle}>Peso corporal</Text>
                        <Text style={styles.metricSub}>(kg)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.metricCard}
                        onPress={() =>
                            router.push({
                                pathname: '/cuidador/healthRecords/add/temperature',
                                params: { id }
                            })
                        }
                    >
                        <View style={styles.folderTab} />
                        <Text style={styles.metricTitle}>Temperatura corporal</Text>
                        <Text style={styles.metricSub}>(°C)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.metricCard}
                        onPress={() =>
                            router.push({
                                pathname: '/cuidador/healthRecords/add/glucose',
                                params: { id }
                            })
                        }
                    >
                        <View style={styles.folderTab} />
                        <Text style={styles.metricTitle}>Glucosa</Text>
                        <Text style={styles.metricSub}>(mg/dL)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.metricCard}
                        onPress={() =>
                            router.push({
                                pathname: '/cuidador/healthRecords/add/oximetry',
                                params: { id }
                            })
                        }
                    >
                        <View style={styles.folderTab} />
                        <Text style={styles.metricTitle}>Oximetría</Text>
                        <Text style={styles.metricSub}>(% sat.)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.metricCard}
                        onPress={() =>
                            router.push({
                                pathname: '/cuidador/healthRecords/add/heartRate',
                                params: { id }
                            })
                        }
                    >
                        <View style={styles.folderTab} />
                        <Text style={styles.metricTitle}>Frecuencia cardiaca</Text>
                        <Text style={styles.metricSub}>(bpm)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.metricCard}
                        onPress={() =>
                            router.push({
                                pathname: '/cuidador/healthRecords/add/pressure',
                                params: { id }
                            })
                        }
                    >
                        <View style={styles.folderTab} />
                        <Text style={styles.metricTitle}>Presión Arterial</Text>
                        <Text style={styles.metricSub}>(SYS/DIA)</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    backArrow: {
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 10
    },
    container:         { padding: 16, backgroundColor: '#fff', paddingTop: 50 },
    header:            { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    avatar:            { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
    info:              { flex: 1 },
    name:              { fontSize: 18, fontWeight: 'bold', color: TEXT_COLOR },
    meta:              { fontSize: 12, color: '#666', marginTop: 4 },

    title:             { fontSize: 24, fontWeight: 'bold', marginVertical: 12, color: TEXT_COLOR, marginBottom: 40 },
    sectionTitle:      { fontSize: 18, fontWeight: 'bold', marginVertical: 12, color: TEXT_COLOR, marginBottom: 40 },
    summaryCard:       {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    summaryItem:       { width: '30%', marginBottom: 12, alignItems: 'center' },
    summaryLabel:      { fontSize: 12, color: '#666', marginBottom: 4, textAlign: 'center' },
    summaryValue:      { fontSize: 16, fontWeight: 'bold', color: TEXT_COLOR, textAlign: 'center' },

    grid:              { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    metricCard:        {
        width: '48%',
        backgroundColor: CARD_BG,
        borderRadius: 20,
        paddingTop: 30,
        paddingBottom: 20,
        paddingHorizontal: 12,
        marginBottom: 30,
        alignItems: 'center',
        position: 'relative',
        height: 100
    },
    folderTab:         {
        position: 'absolute',
        top: -9,
        left: 1,
        width: 50,
        height: 30,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        backgroundColor: CARD_BG,
    },
    metricTitle:       { fontSize: 14, fontWeight: 'bold', color: TEXT_COLOR, textAlign: 'center', marginBottom: 6 },
    metricSub:         { fontSize: 12, color: '#666', textAlign: 'center' },
    centered:          { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
