'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Chrome } from 'lucide-react';

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const handleSignIn = async () => {
    // This is a no-op because real authentication is disabled for this environment.
  };

  if (isLoading || user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
            <Icons.logo className="h-12 w-12 text-primary animate-pulse" />
            <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4 rounded-lg border p-8 shadow-lg bg-card">
        <Icons.logo className="h-12 w-12 text-primary" />
        <h1 className="text-2xl font-bold">Welcome to CloudWeaver</h1>
        <p className="text-muted-foreground">Sign in to access your files.</p>
        <Button onClick={handleSignIn} size="lg">
            <Chrome className="mr-2 h-5 w-5" />
            Sign in with Google
        </Button>
      </div>
    </div>
  );
}
