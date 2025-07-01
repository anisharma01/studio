'use client';

import React, { createContext, useContext, ReactNode } from 'react';

// Mocking the Firebase User type for structure
interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
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

// Create a mock user for demonstration purposes, so the app is usable.
const mockUser: User = {
    uid: 'mock-user-123',
    displayName: 'Demo User',
    email: 'demo@cloudweaver.com',
    photoURL: 'https://placehold.co/100x100.png',
};


export function AuthProvider({ children }: { children: ReactNode }) {
  // Since we can't use real auth, we'll provide a mock user.
  // The login/logout functions will be non-operational but won't crash.
  const value = { user: mockUser, isLoading: false };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
