'use client';

import dynamic from 'next/dynamic';

const DiagramManager = dynamic(() => import('@/components/diagram-manager'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center">
      <div className="text-lg">Loading Diagram Manager...</div>
    </div>
  ),
});

export default function ManageDiagrams() {
  return <DiagramManager />;
}
