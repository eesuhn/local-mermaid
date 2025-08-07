'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as monaco from 'monaco-editor';
import { Editor } from '@monaco-editor/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Download, MoreHorizontal, Save, FolderOpen } from 'lucide-react';

// Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Notification } from '@/components/notification';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Hooks
import { useNotification } from '@/hooks/use-notification';
import { useMobile } from '@/hooks/use-mobile-detector';
import { usePanZoom } from '@/hooks/use-pan-zoom';
import { useMermaidRenderer } from '@/hooks/use-mermaid-renderer';
import { useDebounce } from '@/hooks/use-debounce';

// Utils and constants
import {
  saveDiagram,
  loadDiagram,
  validateDiagramName,
} from '@/lib/diagram-utils';
import { exportAsPNG, exportAsSVG, getSafeFilename } from '@/lib/export-utils';
import { DEFAULT_DIAGRAM, UI_CONSTANTS } from '@/lib/constants';

export default function MermaidEditor() {
  // State
  const [input, setInput] = useState<string>(DEFAULT_DIAGRAM);
  const [diagramName, setDiagramName] = useState<string>('');
  const [separatorPosition, setSeparatorPosition] = useState<number>(
    UI_CONSTANTS.DEFAULT_SEPARATOR_POSITION
  );
  const [fontSize, setFontSize] = useState<number>(
    UI_CONSTANTS.DEFAULT_FONT_SIZE
  );

  // Refs
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Hooks
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useMobile();
  const { notification, showNotification } = useNotification();
  const { svg, error, renderDiagram } = useMermaidRenderer();
  const {
    zoomLevel,
    panOffset,
    zoomIn,
    zoomOut,
    resetZoom,
    handleMouseDown: handleMouseDownPan,
    handleMouseMove: handleMouseMovePan,
    handleMouseUp: handleMouseUpPan,
    handleMouseLeave: handleMouseLeavePan,
    isPanning,
  } = usePanZoom();

  // Debounced rendering
  const debouncedRender = useDebounce(
    renderDiagram,
    UI_CONSTANTS.DEBOUNCE_DELAY
  );

  // Effects
  useEffect(() => {
    debouncedRender(input);
  }, [input, debouncedRender]);

  // Load diagram from URL parameter
  useEffect(() => {
    const diagramToLoad = searchParams.get('diagram');
    if (diagramToLoad) {
      const diagram = loadDiagram(diagramToLoad);
      if (diagram) {
        setInput(diagram.content);
        setDiagramName(diagram.name);
      }
    }
  }, [searchParams]);

  // Handlers
  const handleSaveDiagram = useCallback(() => {
    const validation = validateDiagramName(diagramName);
    if (!validation.isValid) {
      showNotification({
        variant: 'destructive',
        title: 'Error',
        description: validation.error || 'Invalid diagram name',
      });
      return;
    }

    try {
      saveDiagram(diagramName, input);
      showNotification({
        variant: 'success',
        title: 'Success',
        description: 'Diagram saved successfully!',
      });
    } catch {
      showNotification({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save diagram',
      });
    }
  }, [diagramName, input, showNotification]);

  const handleEditorChange = useCallback((value?: string) => {
    if (value !== undefined) {
      setInput(value);
    }
  }, []);

  const handleEditorDidMount = useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor) => {
      editorRef.current = editor;
      // Set up keyboard shortcuts
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        handleSaveDiagram();
      });
    },
    [handleSaveDiagram]
  );

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = Math.max(
        UI_CONSTANTS.MIN_SEPARATOR_POSITION,
        Math.min(
          UI_CONSTANTS.MAX_SEPARATOR_POSITION,
          (e.clientX / window.innerWidth) * 100
        )
      );
      setSeparatorPosition(newPosition);
      editorRef.current?.layout();
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  const handleExportAsPNG = useCallback(async () => {
    if (!svgRef.current) return;

    try {
      await exportAsPNG(svgRef.current, getSafeFilename(diagramName));
      showNotification({
        variant: 'success',
        title: 'Success',
        description: 'PNG exported successfully!',
      });
    } catch {
      showNotification({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to export PNG',
      });
    }
  }, [diagramName, showNotification]);

  const handleExportAsSVG = useCallback(() => {
    if (!svgRef.current) return;

    try {
      exportAsSVG(svgRef.current, getSafeFilename(diagramName));
      showNotification({
        variant: 'success',
        title: 'Success',
        description: 'SVG exported successfully!',
      });
    } catch {
      showNotification({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to export SVG',
      });
    }
  }, [diagramName, showNotification]);

  const handleNewDiagram = useCallback(() => {
    setInput(DEFAULT_DIAGRAM);
    setDiagramName('');
  }, []);

  const handleFontSizeDecrease = useCallback(() => {
    setFontSize((prev) => Math.max(UI_CONSTANTS.MIN_FONT_SIZE, prev - 2));
  }, []);

  const handleFontSizeIncrease = useCallback(() => {
    setFontSize((prev) => Math.min(UI_CONSTANTS.MAX_FONT_SIZE, prev + 2));
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="flex-none border-b bg-gray-50 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">{/* Title removed */}</div>

          <div className="flex flex-1 items-center gap-4">
            {/* <Label
              htmlFor="diagram-name"
              className="sr-only text-sm font-medium md:not-sr-only"
            >
              Name:
            </Label> */}
            <Input
              id="diagram-name"
              type="text"
              value={diagramName}
              onChange={(e) => setDiagramName(e.target.value)}
              placeholder="Enter diagram name"
              className="w-full md:w-64"
            />
            <div className="flex items-center gap-1 rounded-md border p-1">
              <Button
                onClick={handleFontSizeDecrease}
                variant="ghost"
                size="lg"
                className="h-7 w-7 p-0 text-xl"
              >
                <span className="leading-none">−</span>
              </Button>
              <span className="px-2 pt-[1px] text-xs text-gray-600">
                {fontSize}px
              </span>
              <Button
                onClick={handleFontSizeIncrease}
                variant="ghost"
                size="lg"
                className="h-7 w-7 p-0 text-xl"
              >
                <span className="leading-none">+</span>
              </Button>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-4 md:flex">
            <Button onClick={handleNewDiagram} variant="outline" size="sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New
            </Button>
            <Button onClick={handleSaveDiagram} size="sm">
              <Save className="mr-1 h-4 w-4" />
              Save
            </Button>
            <Button
              onClick={() => router.push('/manage-diagrams')}
              variant="outline"
              size="sm"
            >
              <FolderOpen className="mr-1 h-4 w-4" />
              Manage
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={!!error}>
                  <Download className="mr-1 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportAsPNG}>
                  Export as PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportAsSVG}>
                  Export as SVG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* <DropdownMenuItem onClick={handleFontSizeDecrease}>
                Decrease Font Size
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleFontSizeIncrease}>
                Increase Font Size
              </DropdownMenuItem> */}
              <DropdownMenuItem onClick={handleNewDiagram}>
                New
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSaveDiagram}>
                Save
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/manage-diagrams')}>
                Manage Diagrams
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportAsPNG} disabled={!!error}>
                Export as PNG
              </DropdownMenuItem>
              {/* <DropdownMenuItem onClick={handleExportAsSVG} disabled={!!error}>
                Export as SVG
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`relative flex flex-1 overflow-hidden ${isMobile ? 'flex-col' : 'flex-row'}`}
      >
        {/* Editor Section */}
        <div
          className={`flex-none overflow-hidden border-r ${isMobile ? 'h-1/2 border-r-0 border-b' : ''}`}
          style={isMobile ? {} : { width: `${separatorPosition}%` }}
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
              fontSize: fontSize,
              wordWrap: 'on',
              lineNumbers: 'on',
              folding: true,
              automaticLayout: true,
            }}
            theme="light"
          />
        </div>

        {/* Resizable Separator */}
        {!isMobile && (
          <div
            className="cursor-col-resize bg-gray-300 transition-colors hover:bg-gray-400 active:bg-gray-500"
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
        )}

        {/* Preview Section */}
        <div
          className={`relative flex-none overflow-hidden bg-white ${isMobile ? 'h-1/2' : ''}`}
          style={isMobile ? {} : { width: `${100 - separatorPosition}%` }}
        >
          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 rounded-lg border bg-white p-2 shadow-md">
            <Button
              onClick={zoomIn}
              variant="outline"
              size="lg"
              className="h-8 w-8 p-0"
              disabled={zoomLevel >= UI_CONSTANTS.MAX_ZOOM}
            >
              <span className="leading-none">+</span>
            </Button>
            <div className="px-1 py-1 text-center text-xs text-gray-500">
              {Math.round(zoomLevel * 100)}%
            </div>
            <Button
              onClick={zoomOut}
              variant="outline"
              size="lg"
              className="h-8 w-8 p-0"
              disabled={zoomLevel <= UI_CONSTANTS.MIN_ZOOM}
            >
              <span className="leading-none">−</span>
            </Button>
            <Button
              onClick={resetZoom}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 text-xs"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 12a9 9 0 1 1 9 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="3 7 3 12 8 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          </div>

          {error ? (
            <div className="flex h-full items-center justify-center p-8">
              <div className="text-center">
                <div className="mb-2 text-lg font-medium text-red-500">
                  Syntax Error
                </div>
                <div className="text-gray-600">{error}</div>
              </div>
            </div>
          ) : svg ? (
            <div
              className="h-full w-full overflow-hidden select-none"
              style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
              onMouseDown={handleMouseDownPan}
              onMouseMove={handleMouseMovePan}
              onMouseUp={handleMouseUpPan}
              onMouseLeave={handleMouseLeavePan}
            >
              <div
                className="flex min-h-full items-center justify-center will-change-transform"
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                }}
                dangerouslySetInnerHTML={{ __html: svg }}
                ref={(ref) => {
                  if (ref) {
                    svgRef.current = ref.querySelector('svg');
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-8">
              <div className="text-center text-gray-500">
                <div className="mb-2 text-lg font-medium">
                  Start typing to see your diagram
                </div>
                <div className="text-sm">
                  Your Mermaid diagram will appear here
                </div>
              </div>
            </div>
          )}
        </div>
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
