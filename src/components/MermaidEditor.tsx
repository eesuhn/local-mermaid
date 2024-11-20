'use client';

import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import * as monaco from 'monaco-editor';
import { Editor } from '@monaco-editor/react';

export default function Component() {
  const [input, setInput] = useState(`graph TD
A[Client] --> B[Load Balancer]
B --> C[Server01]
B --> D[Server02]`);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const [separatorPosition, setSeparatorPosition] = useState(50);
  const mermaidRef = useRef<HTMLDivElement>(null);
  const separatorRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: true });
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        const { svg } = await mermaid.render('mermaid-diagram', input);
        setSvg(svg);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Invalid Mermaid syntax. Please check your input.');
      }
    };

    renderDiagram();
  }, [input]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setInput(value);
    }
  };

  const handleEditorDidMount = (
    editor: monaco.editor.IStandaloneCodeEditor
  ) => {
    editorRef.current = editor;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (separatorRef.current) {
      const newPosition = (e.clientX / window.innerWidth) * 100;
      setSeparatorPosition(newPosition);
      if (editorRef.current) {
        editorRef.current.layout();
      }
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="flex h-screen overflow-hidden">
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
      <div
        ref={separatorRef}
        className="w-1 bg-gray-300 cursor-col-resize hover:bg-gray-400 active:bg-gray-500"
        onMouseDown={handleMouseDown}
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={separatorPosition}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            setSeparatorPosition((prev) => Math.max(prev - 1, 10));
          } else if (e.key === 'ArrowRight') {
            setSeparatorPosition((prev) => Math.min(prev + 1, 90));
          }
        }}
      />
      <div
        className="flex-none overflow-auto"
        style={{ width: `${100 - separatorPosition}%` }}
      >
        {error ? (
          <div className="text-red-500 p-4">{error}</div>
        ) : (
          <div
            ref={mermaidRef}
            className="p-4"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
      </div>
    </div>
  );
}
