import { useState, useEffect, useCallback } from 'react';
import mermaid from 'mermaid';

export interface UseMermaidRendererReturn {
  svg: string;
  error: string;
  renderDiagram: (content: string) => Promise<void>;
}

export function useMermaidRenderer(): UseMermaidRendererReturn {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');

  // Initialize Mermaid once
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      // Improve rendering quality
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      fontSize: 16,
      // Enable better text rendering
      themeVariables: {
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      },
    });
  }, []);

  const renderDiagram = useCallback(async (content: string) => {
    if (!content.trim()) {
      setSvg('');
      setError('');
      return;
    }

    try {
      const { svg: renderedSvg } = await mermaid.render(
        'mermaid-diagram',
        content
      );

      // Post-process the SVG to improve quality
      let processedSvg = renderedSvg;

      // Add vector-effect attribute to maintain line quality
      processedSvg = processedSvg.replace(
        /<svg([^>]*)>/,
        '<svg$1 style="shape-rendering: geometricPrecision; text-rendering: optimizeLegibility;">'
      );

      setSvg(processedSvg);
      setError('');
    } catch (err) {
      setSvg('');
      setError('Invalid Mermaid syntax. Please check your input.');
      console.error('Mermaid rendering error:', err);
    }
  }, []);

  return {
    svg,
    error,
    renderDiagram,
  };
}
