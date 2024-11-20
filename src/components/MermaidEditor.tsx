'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import mermaid from 'mermaid';
import * as monaco from 'monaco-editor';
import { Editor } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter, useSearchParams } from 'next/navigation';
import { Download } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'mermaid-diagrams';

export default function MermaidEditor() {
  const defaultInput = `graph TD
    A[Client] --> B[Load Balancer]
    B --> C[Server01]
    B --> D[Server02]`;

  const [input, setInput] = useState(defaultInput);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const [separatorPosition, setSeparatorPosition] = useState(50);
  const [diagramName, setDiagramName] = useState('');
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize Mermaid once
  useEffect(() => {
    mermaid.initialize({ startOnLoad: false });
  }, []);

  // Load saved diagrams on component mount or when URL changes
  useEffect(() => {
    const diagramToLoad = searchParams.get('diagram');
    if (diagramToLoad) {
      loadDiagram(diagramToLoad);
    } else {
      const savedDiagrams = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedDiagrams) {
        const parsedDiagrams = JSON.parse(savedDiagrams);
        if (parsedDiagrams.length > 0) {
          setInput(parsedDiagrams[0].content);
          setDiagramName(parsedDiagrams[0].name);
        }
      }
    }
  }, [searchParams]);

  // Debounced diagram rendering
  const renderDiagram = useCallback(async (diagram: string) => {
    try {
      const { svg } = await mermaid.render('mermaid-diagram', diagram);
      setSvg(svg);
      setError('');
    } catch {
      setSvg('');
      setError('Invalid Mermaid syntax. Please check your input.');
    }
  }, []);

  // Trigger diagram rendering on input change with debounce
  useEffect(() => {
    const timeout = setTimeout(() => renderDiagram(input), 300);
    return () => clearTimeout(timeout);
  }, [input, renderDiagram]);

  const handleEditorChange = useCallback((value?: string) => {
    if (value !== undefined) {
      setInput(value);
    }
  }, []);

  const handleEditorDidMount = useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor) => {
      editorRef.current = editor;
    },
    []
  );

  // Handle separator dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = Math.max(
        10,
        Math.min(90, (e.clientX / window.innerWidth) * 100)
      );
      setSeparatorPosition(newPosition);
      editorRef.current?.layout(); // Re-layout the editor after dragging
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  const saveDiagram = useCallback(() => {
    if (!diagramName) {
      alert('Please enter a name for your diagram');
      return;
    }

    const savedDiagrams = localStorage.getItem(LOCAL_STORAGE_KEY);
    let diagrams = savedDiagrams ? JSON.parse(savedDiagrams) : [];

    // Check if a diagram with this name already exists
    const existingIndex = diagrams.findIndex(
      (d: { name: string }) => d.name === diagramName
    );
    if (existingIndex !== -1) {
      // Update existing diagram
      diagrams[existingIndex] = { name: diagramName, content: input };
    } else {
      // Add new diagram
      diagrams.push({ name: diagramName, content: input });
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(diagrams));
    alert('Diagram saved successfully!');
  }, [diagramName, input]);

  const loadDiagram = useCallback((name: string) => {
    const savedDiagrams = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedDiagrams) {
      const diagrams = JSON.parse(savedDiagrams);
      const diagram = diagrams.find((d: { name: string }) => d.name === name);
      if (diagram) {
        setInput(diagram.content);
        setDiagramName(diagram.name);
      } else {
        alert('No diagram found with that name');
      }
    }
  }, []);

  const exportAsPNG = useCallback(() => {
    if (svgRef.current) {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        const scaleFactor = 10;
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;

        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${diagramName || 'mermaid-diagram'}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    }
  }, [diagramName]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-none p-4 bg-gray-100">
        <div className="flex items-center space-x-4">
          <Label htmlFor="diagram-name">Diagram Name:</Label>
          <Input
            id="diagram-name"
            type="text"
            value={diagramName}
            onChange={(e) => setDiagramName(e.target.value)}
            placeholder="Enter diagram name"
            className="w-64"
          />
          <Button onClick={saveDiagram}>Save</Button>
          <Button onClick={() => router.push('/manage-diagrams')}>
            Manage Diagrams
          </Button>
          <Button onClick={error ? undefined : exportAsPNG} disabled={!!error}>
            <Download className="w-4 h-4 mr-2" />
            Export as PNG
          </Button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden relative">
        <div
          className="flex-none overflow-hidden"
          style={{ width: `${separatorPosition}%` }}
        >
          <Editor
            height="100%"
            defaultLanguage="markdown"
            value={input}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              wordWrap: 'on',
            }}
          />
        </div>

        {/* Resizable Separator */}
        <div
          className="bg-gray-500 cursor-col-resize hover:bg-gray-600 active:bg-gray-700"
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${separatorPosition}%`,
            width: '4px',
            zIndex: 10,
          }}
          onMouseDown={handleMouseDown}
          role="separator"
          aria-orientation="vertical"
          aria-valuenow={separatorPosition}
          tabIndex={0}
        />

        {/* Mermaid Preview Section */}
        <div
          className="flex-none overflow-auto"
          style={{ width: `${100 - separatorPosition}%` }}
        >
          {error ? (
            <div className="text-red-500 p-4">{error}</div>
          ) : (
            <div
              className="p-4"
              dangerouslySetInnerHTML={{ __html: svg }}
              ref={(ref) => {
                if (ref) {
                  svgRef.current = ref.querySelector('svg');
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
