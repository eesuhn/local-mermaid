'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Trash2, Edit, Calendar } from 'lucide-react';

// Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Notification } from '@/components/notification';

// Hooks
import { useNotification } from '@/hooks/use-notification';

// Utils and types
import { DiagramProps } from '@/types/diagram';
import {
  loadDiagrams,
  deleteDiagram,
  getDiagramType,
  formatDate,
} from '@/lib/diagram-utils';

export default function DiagramManager() {
  const [diagrams, setDiagrams] = useState<DiagramProps[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { notification, showNotification } = useNotification();

  useEffect(() => {
    loadDiagramsList();
  }, []);

  const loadDiagramsList = () => {
    const loadedDiagrams = loadDiagrams();
    setDiagrams(loadedDiagrams);
  };

  const handleDeleteDiagram = (name: string) => {
    try {
      const updatedDiagrams = deleteDiagram(name);
      setDiagrams(updatedDiagrams);

      showNotification({
        variant: 'success',
        title: 'Success',
        description: 'Diagram deleted successfully',
      });
    } catch {
      showNotification({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete diagram',
      });
    }
  };

  const openDiagram = (name: string) => {
    router.push(`/?diagram=${encodeURIComponent(name)}`);
  };

  const filteredDiagrams = diagrams.filter((diagram) =>
    diagram.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Editor
              </Button>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Manage Diagrams
                </h1>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              {diagrams.length} diagram{diagrams.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              type="text"
              placeholder="Search diagrams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Diagrams Grid */}
        {filteredDiagrams.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200">
              <span className="text-2xl text-gray-400">📊</span>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              {searchTerm ? 'No diagrams found' : 'No diagrams yet'}
            </h3>
            <p className="mb-6 text-gray-500">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Create your first diagram to get started'}
            </p>
            {!searchTerm && (
              <Button onClick={() => router.push('/')}>
                Create New Diagram
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDiagrams.map((diagram) => (
              <Card
                key={diagram.name}
                className="transition-shadow hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="truncate text-lg">
                        {diagram.name}
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {formatDate(diagram.lastUpdated)}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {getDiagramType(diagram.content)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="mb-4 rounded-md bg-gray-50 p-3">
                    <code className="line-clamp-3 text-xs text-gray-600">
                      {diagram.content.split('\n').slice(0, 3).join('\n')}
                      {diagram.content.split('\n').length > 3 && '...'}
                    </code>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => openDiagram(diagram.name)}
                      className="flex-1"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Diagram</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete &quot;{diagram.name}
                            &quot;? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteDiagram(diagram.name)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Notification */}
      {notification && (
        <Notification
          variant={notification.variant}
          title={notification.title}
          description={notification.description}
        />
      )}
    </div>
  );
}
