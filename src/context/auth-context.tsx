'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// When you re-enable Firebase, uncomment the following lines:
// import { onAuthStateChanged, User } from 'firebase/auth';
// import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

// Mock User type for local development.
// When you re-enable Firebase, you can get the User type from 'firebase/auth'
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
});

// A mock user for local development.
const mockUser: User = {
  uid: 'local-user-123',
  displayName: 'Local User',
  email: 'user@example.com',
  photoURL: 'https://placehold.co/100x100.png',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This is the mock authentication logic.
    // It immediately sets a mock user.
    setUser(mockUser);
    setIsLoading(false);

    /*
    // When you re-enable Firebase, comment out the mock logic above
    // and uncomment this block to use real authentication.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
    */
  }, []);

  // The loading screen is kept for a seamless transition when switching back to Firebase.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isLoading: false }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
