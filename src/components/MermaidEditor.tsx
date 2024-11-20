'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import mermaid from 'mermaid';
import * as monaco from 'monaco-editor';
import { Editor } from '@monaco-editor/react';

export default function MermaidEditor() {
  const defaultInput = `graph TD
    A[Client] --> B[Load Balancer]
    B --> C[Server01]
    B --> D[Server02]`;

  const [input, setInput] = useState(defaultInput);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const [separatorPosition, setSeparatorPosition] = useState(50);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  // Initialize Mermaid once
  useEffect(() => {
    mermaid.initialize({ startOnLoad: false });
  }, []);

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

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Editor Section */}
      <div
        className="flex-none overflow-hidden"
        style={{ width: `${separatorPosition}%` }}
      >
        <Editor
          height="100%"
          defaultLanguage="markdown"
          defaultValue={input}
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
          zIndex: 10, // Ensure it's above the editor and previewer
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
          <div className="p-4" dangerouslySetInnerHTML={{ __html: svg }} />
        )}
      </div>
    </div>
  );
}
