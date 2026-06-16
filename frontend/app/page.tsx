'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Page() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.onboardingComplete) {
      router.push('/dashboard');
    } else if (user) {
      router.push('/onboarding');
    } else {
      router.push('/login');
    }
  }, [user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );
}
