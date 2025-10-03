"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLoader from '@/components/dashboard-loader';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return <DashboardLoader />;
}
