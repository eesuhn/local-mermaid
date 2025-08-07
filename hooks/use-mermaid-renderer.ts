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
      setSvg(renderedSvg);
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
