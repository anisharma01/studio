'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-6 rounded-lg border p-10 shadow-lg">
        <div className="flex items-center gap-3">
          <Icons.logo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-semibold text-foreground">CloudWeaver</h1>
        </div>
        <p className="text-center text-muted-foreground">
          Login is currently disabled.
          <br />
          The application is running in local-only mode.
        </p>
        <Link href="/" passHref>
          <Button>Go to App</Button>
        </Link>
      </div>
    </div>
  );
}
