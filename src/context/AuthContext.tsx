import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, getDocs, query, collection, limit } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isLoggingIn: boolean;
  isAdmin: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalMode: 'signin' | 'signup';
  setAuthModalMode: (mode: 'signin' | 'signup') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser(fbUser);
        const docRef = doc(db, 'users', fbUser.uid);
        try {
          const docSnap = await getDoc(docRef);
          const isAdminEmail = fbUser.email === 'antonchakma6@gmail.com';
          
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            if (isAdminEmail && data.role !== 'admin') {
              const updatedProfile = { ...data, role: 'admin' as const };
              await setDoc(docRef, updatedProfile);
              setProfile(updatedProfile);
            } else {
              setProfile(data);
            }
          } else {
            const usersSnap = await getDocs(query(collection(db, 'users'), limit(1)));
            const isFirstUser = usersSnap.empty;

            const newProfile: UserProfile = {
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'User'),
              role: (isFirstUser || isAdminEmail) ? 'admin' : 'user',
              createdAt: new Date(),
            };
            await setDoc(docRef, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${fbUser.uid}`);
        }
      } else {
        // No Firebase user, check for backend token
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (savedToken && savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            setProfile({
              uid: parsedUser.id,
              email: parsedUser.email,
              displayName: parsedUser.name,
              role: parsedUser.role,
              createdAt: new Date(),
            });
            setUser({ uid: parsedUser.id, email: parsedUser.email } as User);
          } catch (e) {
            console.error("Failed to parse saved user", e);
          }
        } else {
          setProfile(null);
          setUser(null);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        console.error('Login error:', error);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    profile,
    loading,
    isLoggingIn,
    isAdmin: profile?.role === 'admin',
    login,
    logout,
    isAuthModalOpen,
    setAuthModalOpen,
    authModalMode,
    setAuthModalMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
