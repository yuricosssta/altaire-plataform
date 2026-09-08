'use client';

import { useParams, redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function RoteirosRedirectPage() {
  const params = useParams<{ projectId: string }>();
  useEffect(() => {
    redirect(`/dashboard/editorial/${params.projectId}?tab=roteiros`);
  }, [params.projectId]);
  return null;
}