// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { auth, db } from '../utils/Firebase';

type Role = 'familiar' | 'caregiver' | 'elder';

interface ElderData {
  uid: string;          // Firestore doc ID
  name: string;
  role: 'elder';
  code: string;
  caregiverId: string;
}

export type UserData = FirebaseUser | ElderData;

interface AuthContextInterface {
  currentUser: UserData | null;
  loginFamiliar: (email: string, pass: string) => Promise<boolean>;
  loginCaregiver: (email: string, pass: string) => Promise<boolean>;
  loginElder: (code: string) => Promise<boolean>;
  registerFamiliar: (name: string, email: string, pass: string) => Promise<boolean>;
  registerCaregiver: (name: string, email: string, pass: string) => Promise<boolean>;
  registerElder: (name: string, caregiverId: string, code?: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextInterface>({} as any);

const ELDER_CODE_KEY = '@elder_code';

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  // 1) Reactiva sesión al arrancar:
  useEffect(() => {
    // a) Chequea sesión Firebase (familiar / caregiver)
    const unsub = onAuthStateChanged(auth, async fbUser => {
      if (fbUser) {
        // trae datos de perfil + role
        const docSnap = await getDoc(doc(db, 'users', fbUser.uid));
        if (docSnap.exists()) {
          setCurrentUser(fbUser);
          return;
        }
      }
      // b) Si no hay usuario Firebase, mira si hay código de adultomayor en AsyncStorage
      const savedCode = await AsyncStorage.getItem(ELDER_CODE_KEY);
      if (savedCode) {
        await _loginElderInternal(savedCode);
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsub();
  }, []);

  // ——— Familiar / Caregiver ———
  const _registerCommon = async (
    name: string,
    email: string,
    pass: string,
    role: Exclude<Role, 'elder'>
  ): Promise<boolean> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName: name });
      await setDoc(doc(db, 'users', cred.user.uid), {
        name,
        email,
        role,
        createdAt: new Date()
      });
      setCurrentUser(cred.user);
      return true;
    } catch (e) {
      console.error('Register error', e);
      return false;
    }
  };

  const registerFamiliar = (name: string, email: string, pass: string) =>
    _registerCommon(name, email, pass, 'familiar');

  const registerCaregiver = (name: string, email: string, pass: string) =>
    _registerCommon(name, email, pass, 'caregiver');

  const loginCommon = async (email: string, pass: string) => {
    try {
      const resp = await signInWithEmailAndPassword(auth, email, pass);
      return !!resp.user;
    } catch (e) {
      console.error('Login error', e);
      return false;
    }
  };

  const loginFamiliar = (email: string, pass: string) => loginCommon(email, pass);
  const loginCaregiver = (email: string, pass: string) => loginCommon(email, pass);

  // ——— Elder (Adulto Mayor) ———
  // Interno: busca en Firestore el doc de elder by code y setea currentUser
  const _loginElderInternal = async (code: string): Promise<boolean> => {
    const q = query(collection(db, 'elders'), where('code', '==', code));
    const snap = await getDocs(q);
    if (snap.empty) {
      return false;
    }
    const docSnap = snap.docs[0];
    const data = docSnap.data() as Omit<ElderData, 'uid'>;
    setCurrentUser({
      uid: docSnap.id,
      ...data
    });
    return true;
  };

  const loginElder = async (code: string): Promise<boolean> => {
    const ok = await _loginElderInternal(code);
    if (ok) {
      await AsyncStorage.setItem(ELDER_CODE_KEY, code);
    }
    return ok;
  };

  // Registra un adulto mayor: genera o usa un code, lo guarda en 'elders'
  const registerElder = async (
    name: string,
    caregiverId: string,
    code?: string
  ): Promise<string | null> => {
    try {
      const newCode = code || Math.random().toString(36).substring(2, 8).toUpperCase();
      const ref = doc(collection(db, 'elders'));
      await setDoc(ref, {
        name,
        role: 'elder',
        code: newCode,
        caregiverId,
        createdAt: new Date()
      });
      return newCode;
    } catch (e) {
      console.error('Error registrando elder', e);
      return null;
    }
  };

  // ——— Logout para todos ———
  const logout = async () => {
    // Borra sesión elder
    await AsyncStorage.removeItem(ELDER_CODE_KEY);
    // Cierra sesión Firebase
    await signOut(auth);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loginFamiliar,
        loginCaregiver,
        loginElder,
        registerFamiliar,
        registerCaregiver,
        registerElder,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
