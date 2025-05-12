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
  registerElder: (name: string, caregiverId: string, code?: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextInterface>({} as any);

const ELDER_CODE_KEY = '@elder_code';

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async fbUser => {
      if (fbUser) {
        const docSnap = await getDoc(doc(db, 'users', fbUser.uid));
        if (docSnap.exists()) {
          setCurrentUser(fbUser);
          return;
        }
      }
      // si no es firebase-user, intento elder
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

  const registerFamiliar = (n: string, e: string, p: string) =>
    _registerCommon(n, e, p, 'familiar');
  const registerCaregiver = (n: string, e: string, p: string) =>
    _registerCommon(n, e, p, 'caregiver');

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

  const loginFamiliar   = (e: string, p: string) => loginCommon(e, p);
  const loginCaregiver  = (e: string, p: string) => loginCommon(e, p);

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
      console.error(e);
      return null;
    }
  };

  const _loginElderInternal = async (code: string): Promise<boolean> => {
    const q = query(collection(db, 'elders'), where('code', '==', code));
    const snap = await getDocs(q);
    if (snap.empty) return false;
    const d = snap.docs[0].data() as Omit<ElderData, 'uid'>;
    setCurrentUser({ uid: snap.docs[0].id, ...d });
    return true;
  };

  const loginElder = async (code: string): Promise<boolean> => {
    const ok = await _loginElderInternal(code);
    if (ok) await AsyncStorage.setItem(ELDER_CODE_KEY, code);
    return ok;
  };

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
        registerElder,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
