'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = { user, isLoading };

  if (isLoading) {
    return (
       <div className="flex flex-col h-screen bg-background">
         <div className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 md:px-6">
           <div className="flex items-center gap-3">
             <Icons.logo className="h-7 w-7 text-primary" />
             <Skeleton className="h-6 w-32" />
           </div>
           <Skeleton className="h-8 w-64 hidden md:block" />
           <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-full" />
           </div>
         </div>
         <main className="flex-1 overflow-auto p-4 md:p-6 space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Skeleton className="h-24 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
         </main>
       </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
