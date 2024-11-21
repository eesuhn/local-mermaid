import { Suspense } from 'react';
import MermaidEditor from '@/components/MermaidEditor';

export default function Home() {
  return (
    <>
      <MermaidEditorWrapper />
    </>
  );
}

function MermaidEditorWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MermaidEditor />
    </Suspense>
  );
}
