'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { user, isLoading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };
  
  if (isLoading || (!isLoading && user)) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="flex w-full max-w-sm flex-col items-center space-y-6 rounded-lg border p-10 shadow-lg">
        <div className="flex items-center gap-3">
          <Icons.logo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-semibold text-foreground">CloudWeaver</h1>
        </div>
        <p className="text-center text-muted-foreground">
          Sign in to access your personal cloud storage.
        </p>
        <Button onClick={handleGoogleSignIn} className="w-full">
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 172.9 60.7l-67.4 67.4C293.7 114.5 272.7 104 248 104c-73.6 0-134.3 60.3-134.3 134.9s60.7 134.9 134.3 134.9c83.3 0 119.2-64.2 122.7-96.5H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
