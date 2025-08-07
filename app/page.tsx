'use client';

import dynamic from 'next/dynamic';

const MermaidEditor = dynamic(() => import('@/components/mermaid-editor'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center">
      <div className="text-lg">Loading Mermaid Editor...</div>
    </div>
  ),
});

export default function Home() {
  return <MermaidEditor />;
}
