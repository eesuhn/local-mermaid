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
import { DiagramProps } from '@/types/diagram';
import { formatDate } from '@/lib/utils';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Notification } from '@/components/Notification';
import { NotificationProps } from '@/components/Notification';
import { NotificationVariantProps } from '@/types/notification';

const LOCAL_STORAGE_KEY = 'mermaid-diagrams';

export default function ManageDiagrams() {
  const [diagrams, setDiagrams] = useState<DiagramProps[]>([]);
  const [alert, setAlert] = useState<NotificationProps | null>(null);
  const router = useRouter();
  const [variant, setVariant] =
    useState<NotificationVariantProps['variant']>('default');

  useEffect(() => {
    const savedDiagrams = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedDiagrams) {
      setDiagrams(
        JSON.parse(savedDiagrams).sort(
          (a: DiagramProps, b: DiagramProps) =>
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
    setAlert({
      title: 'Success',
      description: `Diagram "${name}" has been deleted.`,
    });
    setVariant('success');
    setTimeout(() => setAlert(null), 3000);
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
                {diagram.lastUpdated ? formatDate(diagram.lastUpdated) : 'N/A'}
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => loadDiagram(diagram.name)}
                  className="mr-2"
                >
                  Load
                </Button>
                <ConfirmationDialog
                  trigger={<Button variant="destructive">Delete</Button>}
                  title="Are you absolutely sure?"
                  description={`This action cannot be undone. This will permanently delete the diagram "${diagram.name}".`}
                  onConfirm={() => deleteDiagram(diagram.name)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={() => router.push('/')} className="mt-4">
        Back to Editor
      </Button>
      {alert && (
        <Notification
          variant={variant}
          title={alert.title}
          description={alert.description}
        />
      )}
    </div>
  );
}
