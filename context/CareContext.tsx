// context/CareContext.tsx

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes
} from 'firebase/storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, storage } from '../utils/Firebase';
import { AuthContext } from './AuthContext';

export interface PatientData {
  id: string;
  cedula: string;           // cédula completa
  code: string;             // últimos 3 dígitos de la cédula
  name: string;
  surname: string;
  age: number;
  bloodType: string;
  contactName: string;
  contactPhone: string;
  photoUrl: string;
  assignedGame?: 'game1' | 'game2';
  createdAt: Date;
}

export interface MedicationData {
  id: string;
  type: 'Tableta' | 'Capsula' | 'Gotas' | 'Inyeccion';
  name: string;
  dailyDose: number;
  schedule: string[];
  startDate: Date;
  daysOfWeek: string[];
  durationDays: number;
}

export interface HealthRecordData {
  id: string;
  bloodPressure?: { sys: number; dia: number };
  heartRate?: number;
  oxygen?: number;
  weight?: number;
  glucose?: number;
  temperature?: number;
  dateTime: Date;
}

export interface AppointmentData {
  id: string;
  doctorName: string;
  specialization: string;
  dateTime: Date;
}

export type GameType = 'game1' | 'game2';

interface CareContextInterface {
  patients: PatientData[];
  loadingPatients: boolean;
  reloadPatients: () => Promise<void>;
  addPatient: (opts: {
    cedula: string;
    photoUri: string;
    name: string;
    surname: string;
    age: number;
    bloodType: string;
    contactName: string;
    contactPhone: string;
  }) => Promise<string | null>;
  updatePatient: (
    patientId: string,
    data: Partial<
      Omit<
        PatientData,
        'id' | 'cedula' | 'code' | 'createdAt' | 'assignedGame' | 'photoUrl'
      >
    >
  ) => Promise<boolean>;
  assignMedication: (
    patientId: string,
    med: Omit<MedicationData, 'id'>
  ) => Promise<string | null>;
  updateMedication: (
    patientId: string,
    medId: string,
    data: Partial<Omit<MedicationData, 'id'>>
  ) => Promise<boolean>;
  removeMedication: (
    patientId: string,
    medId: string
  ) => Promise<boolean>;
  addHealthRecord: (
    patientId: string,
    rec: Partial<Omit<HealthRecordData, 'id' | 'dateTime'>>
  ) => Promise<string | null>;
  updateHealthRecord: (
    patientId: string,
    recId: string,
    data: Partial<Omit<HealthRecordData, 'id' | 'dateTime'>>
  ) => Promise<boolean>;
  removeHealthRecord: (
    patientId: string,
    recId: string
  ) => Promise<boolean>;
  assignAppointment: (
    patientId: string,
    app: Omit<AppointmentData, 'id'>
  ) => Promise<string | null>;
  updateAppointment: (
    patientId: string,
    appId: string,
    data: Partial<Omit<AppointmentData, 'id'>>
  ) => Promise<boolean>;
  removeAppointment: (
    patientId: string,
    appId: string
  ) => Promise<boolean>;
  assignGame: (patientId: string, game: GameType) => Promise<boolean>;
}

export const CareContext = createContext<CareContextInterface>(
  {} as CareContextInterface
);

export const CareProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { currentUser } = useContext(AuthContext);
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  // Recarga pacientes desde Firestore
  const reloadPatients = async () => {
    setLoadingPatients(true);
    try {
      if (!currentUser?.uid) {
        setPatients([]);
        return;
      }
      const colRef = collection(db, 'patients');
      const q = query(colRef, where('caregiverId', '==', currentUser.uid));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => {
        const data = d.data() as any;
        return {
          id: d.id,
          cedula: data.cedula,
          code: data.code,
          name: data.name,
          surname: data.surname,
          age: data.age,
          bloodType: data.bloodType,
          contactName: data.contactName,
          contactPhone: data.contactPhone,
          photoUrl: data.photoUrl,
          assignedGame: data.assignedGame,
          createdAt: data.createdAt.toDate()
        } as PatientData;
      });
      setPatients(list);
    } catch (e) {
      console.error('reloadPatients error', e);
      setPatients([]);
    } finally {
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    reloadPatients();
  }, [currentUser]);

  const addPatient = async (opts: {
    cedula: string;
    photoUri: string;
    name: string;
    surname: string;
    age: number;
    bloodType: string;
    contactName: string;
    contactPhone: string;
  }): Promise<string | null> => {
    try {
      if (!currentUser?.uid) throw new Error('No caregiver logged in');

      const {
        cedula,
        photoUri,
        name,
        surname,
        age,
        bloodType,
        contactName,
        contactPhone
      } = opts;

      // identifier: last 3 digits of cedula
      const code = cedula.slice(-3);

      // upload photo
      const resp = await fetch(photoUri);
      const blob = await resp.blob();
      const imgRef = storageRef(
        storage,
        `patients/${currentUser.uid}/${cedula}.jpg`
      );
      await uploadBytes(imgRef, blob);
      const photoUrl = await getDownloadURL(imgRef);

      // create patient doc
      const patientRef = doc(collection(db, 'patients'));
      await setDoc(patientRef, {
        caregiverId: currentUser.uid,
        cedula,
        code,
        name,
        surname,
        age,
        bloodType,
        contactName,
        contactPhone,
        photoUrl,
        createdAt: new Date()
      });

      const newPatient: PatientData = {
        id: patientRef.id,
        cedula,
        code,
        name,
        surname,
        age,
        bloodType,
        contactName,
        contactPhone,
        photoUrl,
        createdAt: new Date()
      };
      setPatients(prev => [...prev, newPatient]);
      return patientRef.id;
    } catch (e) {
      console.error('addPatient error', e);
      return null;
    }
  };

  const updatePatient = async (
    patientId: string,
    data: Partial<
      Omit<
        PatientData,
        'id' | 'cedula' | 'code' | 'createdAt' | 'assignedGame' | 'photoUrl'
      >
    >
  ): Promise<boolean> => {
    try {
      const ref = doc(db, 'patients', patientId);
      await updateDoc(ref, data as any);
      await reloadPatients();
      return true;
    } catch (e) {
      console.error('updatePatient error', e);
      return false;
    }
  };

  const assignMedication = async (
    patientId: string,
    med: Omit<MedicationData, 'id'>
  ): Promise<string | null> => {
    try {
      const col = collection(db, 'patients', patientId, 'medications');
      const medRef = doc(col);
      await setDoc(medRef, { ...med, createdAt: new Date() });
      return medRef.id;
    } catch (e) {
      console.error('assignMedication error', e);
      return null;
    }
  };

  const updateMedication = async (
    patientId: string,
    medId: string,
    data: Partial<Omit<MedicationData, 'id'>>
  ): Promise<boolean> => {
    try {
      const ref = doc(
        db,
        'patients',
        patientId,
        'medications',
        medId
      );
      await updateDoc(ref, data as any);
      return true;
    } catch (e) {
      console.error('updateMedication error', e);
      return false;
    }
  };

  const removeMedication = async (
    patientId: string,
    medId: string
  ): Promise<boolean> => {
    try {
      const ref = doc(
        db,
        'patients',
        patientId,
        'medications',
        medId
      );
      await deleteDoc(ref);
      return true;
    } catch (e) {
      console.error('removeMedication error', e);
      return false;
    }
  };

  const addHealthRecord = async (
    patientId: string,
    rec: Partial<Omit<HealthRecordData, 'id' | 'dateTime'>>
  ): Promise<string | null> => {
    try {
      const col = collection(db, 'patients', patientId, 'healthRecords');
      const recRef = doc(col);
      await setDoc(recRef, { ...rec, dateTime: new Date() });
      return recRef.id;
    } catch (e) {
      console.error('addHealthRecord error', e);
      return null;
    }
  };

  const updateHealthRecord = async (
    patientId: string,
    recId: string,
    data: Partial<Omit<HealthRecordData, 'id' | 'dateTime'>>
  ): Promise<boolean> => {
    try {
      const ref = doc(
        db,
        'patients',
        patientId,
        'healthRecords',
        recId
      );
      await updateDoc(ref, data as any);
      return true;
    } catch (e) {
      console.error('updateHealthRecord error', e);
      return false;
    }
  };

  const removeHealthRecord = async (
    patientId: string,
    recId: string
  ): Promise<boolean> => {
    try {
      const ref = doc(
        db,
        'patients',
        patientId,
        'healthRecords',
        recId
      );
      await deleteDoc(ref);
      return true;
    } catch (e) {
      console.error('removeHealthRecord error', e);
      return false;
    }
  };

  const assignAppointment = async (
    patientId: string,
    app: Omit<AppointmentData, 'id'>
  ): Promise<string | null> => {
    try {
      const col = collection(
        db,
        'patients',
        patientId,
        'appointments'
      );
      const appRef = doc(col);
      await setDoc(appRef, { ...app });
      return appRef.id;
    } catch (e) {
      console.error('assignAppointment error', e);
      return null;
    }
  };

  const updateAppointment = async (
    patientId: string,
    appId: string,
    data: Partial<Omit<AppointmentData, 'id'>>
  ): Promise<boolean> => {
    try {
      const ref = doc(
        db,
        'patients',
        patientId,
        'appointments',
        appId
      );
      await updateDoc(ref, data as any);
      return true;
    } catch (e) {
      console.error('updateAppointment error', e);
      return false;
    }
  };

  const removeAppointment = async (
    patientId: string,
    appId: string
  ): Promise<boolean> => {
    try {
      const ref = doc(
        db,
        'patients',
        patientId,
        'appointments',
        appId
      );
      await deleteDoc(ref);
      return true;
    } catch (e) {
      console.error('removeAppointment error', e);
      return false;
    }
  };

  const assignGame = async (
    patientId: string,
    game: GameType
  ): Promise<boolean> => {
    try {
      const ref = doc(db, 'patients', patientId);
      await updateDoc(ref, { assignedGame: game });
      setPatients(prev =>
        prev.map(p => (p.id === patientId ? { ...p, assignedGame: game } : p))
      );
      return true;
    } catch (e) {
      console.error('assignGame error', e);
      return false;
    }
  };

  return (
    <CareContext.Provider
      value={{
        patients,
        loadingPatients,
        reloadPatients,
        addPatient,
        updatePatient,
        assignMedication,
        updateMedication,
        removeMedication,
        addHealthRecord,
        updateHealthRecord,
        removeHealthRecord,
        assignAppointment,
        updateAppointment,
        removeAppointment,
        assignGame
      }}
    >
      {children}
    </CareContext.Provider>
  );
};