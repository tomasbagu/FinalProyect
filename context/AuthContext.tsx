// context/AuthContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where
} from 'firebase/firestore';
import React, { createContext, useEffect, useState } from 'react';
import { auth, db } from '../utils/Firebase';

type Role = 'familiar' | 'caregiver' | 'elder';

interface ElderData {
  uid: string;
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
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextInterface>({} as any);

const ELDER_CODE_KEY = '@elder_code';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  // Al montar, rehidratar sesión (firebase o adulto mayor)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async fbUser => {
      if (fbUser) {
        const snap = await getDoc(doc(db, 'users', fbUser.uid));
        if (snap.exists()) {
          setCurrentUser(fbUser);
          return;
        }
      }
      // Si no hay firebase-user, intento login elder con código guardado
      const savedCode = await AsyncStorage.getItem(ELDER_CODE_KEY);
      if (savedCode) {
        const ok = await _loginElderInternal(savedCode);
        if (!ok) setCurrentUser(null);
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsub();
  }, []);

  // Registro familiar/caregiver
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
  const registerFamiliar  = (n: string, e: string, p: string) => _registerCommon(n, e, p, 'familiar');
  const registerCaregiver = (n: string, e: string, p: string) => _registerCommon(n, e, p, 'caregiver');

  // Login común para familiar/caregiver
  const loginCommon = async (email: string, pass: string): Promise<boolean> => {
    try {
      const resp = await signInWithEmailAndPassword(auth, email, pass);
      const uid = resp.user.uid;
      const snap = await getDoc(doc(db, 'users', uid));
      if (!snap.exists()) return false;
      await setDoc(doc(db, 'users', uid), { lastLogin: new Date() }, { merge: true });
      setCurrentUser(resp.user);
      return true;
    } catch (e) {
      console.error('Login error', e);
      return false;
    }
  };
  const loginFamiliar  = (e: string, p: string) => loginCommon(e, p);
  const loginCaregiver = (e: string, p: string) => loginCommon(e, p);

  // Login Adulto Mayor: buscamos en "patients" por su code (últimos 3 dígitos de cédula)
  const _loginElderInternal = async (code: string): Promise<boolean> => {
    const col = collection(db, 'patients');
    const q = query(col, where('code', '==', code));
    const snap = await getDocs(q);
    if (snap.empty) return false;

    const docSnap = snap.docs[0];
    const data = docSnap.data() as any;
    const elder: ElderData = {
      uid: docSnap.id,
      name: `${data.name} ${data.surname}`,
      role: 'elder',
      code: data.code,
      caregiverId: data.caregiverId
    };
    setCurrentUser(elder);
    return true;
  };

  const loginElder = async (code: string): Promise<boolean> => {
    const ok = await _loginElderInternal(code);
    if (ok) {
      await AsyncStorage.setItem(ELDER_CODE_KEY, code);
    }
    return ok;
  };

  // Logout
  const logout = async () => {
    await AsyncStorage.removeItem(ELDER_CODE_KEY);
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
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
