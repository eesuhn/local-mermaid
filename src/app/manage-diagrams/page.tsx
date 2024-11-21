'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { Diagram } from '@/types/diagram';

const LOCAL_STORAGE_KEY = 'mermaid-diagrams';

export default function ManageDiagrams() {
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const router = useRouter();

  useEffect(() => {
    const savedDiagrams = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedDiagrams) {
      setDiagrams(
        JSON.parse(savedDiagrams).sort(
          (a: Diagram, b: Diagram) =>
            new Date(b.lastUpdated || 0).getTime() -
            new Date(a.lastUpdated || 0).getTime()
        )
      );
    }
  }, []);

  const deleteDiagram = (name: string) => {
    const updatedDiagrams = diagrams.filter((diagram) => diagram.name !== name);
    setDiagrams(updatedDiagrams);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedDiagrams));
  };

  const loadDiagram = (name: string) => {
    router.push(`/?diagram=${encodeURIComponent(name)}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Manage Saved Diagrams</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Diagram Name</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {diagrams.map((diagram) => (
            <TableRow key={diagram.name}>
              <TableCell>{diagram.name}</TableCell>
              <TableCell>
                {diagram.lastUpdated
                  ? new Date(diagram.lastUpdated).toLocaleString()
                  : 'N/A'}
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => loadDiagram(diagram.name)}
                  className="mr-2"
                >
                  Load
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteDiagram(diagram.name)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={() => router.push('/')} className="mt-4">
        Back to Editor
      </Button>
    </div>
  );
}
