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

    // Pre-process content to detect and potentially fix common issues
    let processedContent = content;
    const issues: string[] = [];

    // Split content into lines for processing
    const lines = content.split('\n');

    // Check for and fix trailing whitespace
    const hasTrailingWhitespace = lines.some((line) => line !== line.trimEnd());
    if (hasTrailingWhitespace) {
      issues.push('Trailing whitespace');
      processedContent = lines.map((line) => line.trimEnd()).join('\n');
    }

    // Check for and fix inconsistent indentation
    const processedLines = processedContent.split('\n');
    const nonEmptyLines = processedLines.filter(
      (line) => line.trim().length > 0
    );

    if (nonEmptyLines.length > 1) {
      let hasIndentationIssue = false;
      const fixedLines = processedLines.map((line) => {
        if (line.trim().length === 0) return line; // Keep empty lines as is

        const leadingWhitespace = line.match(/^(\s*)/);
        const leadingSpaces = leadingWhitespace ? leadingWhitespace[1] : '';
        const content = line.trim();

        // Check for problematic indentation patterns
        if (leadingSpaces.length > 0) {
          // Convert tabs to spaces
          const normalizedSpaces = leadingSpaces.replace(/\t/g, '    ');

          // Fix odd indentation (should be multiples of 4 for Mermaid)
          if (
            normalizedSpaces.length % 4 !== 0 &&
            normalizedSpaces.length > 0
          ) {
            hasIndentationIssue = true;
            // Round to nearest multiple of 4
            const correctedIndent = ' '.repeat(
              Math.round(normalizedSpaces.length / 4) * 4
            );
            return correctedIndent + content;
          }

          // Replace original spaces with normalized spaces
          if (normalizedSpaces !== leadingSpaces) {
            hasIndentationIssue = true;
            return normalizedSpaces + content;
          }
        }

        return line;
      });

      if (hasIndentationIssue) {
        issues.push('Inconsistent indentation');
        processedContent = fixedLines.join('\n');
      }
    }

    // Additional cleanup: Remove extra blank lines and normalize line endings
    processedContent = processedContent
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\n{3,}/g, '\n\n'); // Remove excessive blank lines

    // Only log if there are issues or in development mode
    if (issues.length > 0 || process.env.NODE_ENV === 'development') {
      console.log('Original content:', JSON.stringify(content));
      console.log('Processed content:', JSON.stringify(processedContent));
      console.log('Detected issues:', issues);
    }

    try {
      // Use a single state update to prevent race conditions
      const renderResult = await mermaid.render(
        `mermaid-diagram-${Date.now()}`, // Unique ID to prevent conflicts
        processedContent
      );

      // Post-process the SVG to improve quality
      let finalSvg = renderResult.svg;

      // Add vector-effect attribute to maintain line quality
      finalSvg = finalSvg.replace(
        /<svg([^>]*)>/,
        '<svg$1 style="shape-rendering: geometricPrecision; text-rendering: optimizeLegibility;">'
      );

      // Update state atomically
      setSvg(finalSvg);
      setError('');

      // If we had to fix issues, log them for user awareness
      if (issues.length > 0) {
        console.info(`Mermaid: Auto-fixed ${issues.join(', ')} in diagram`);
      }
    } catch (err) {
      // Update state atomically
      setSvg('');

      // Provide more specific error messages
      let errorMessage = 'Invalid Mermaid syntax';

      if (issues.length > 0) {
        errorMessage += `. Detected: ${issues.join(', ')}.`;
      } else {
        errorMessage += '. Please check your input.';
      }

      setError(errorMessage);
      console.error('Mermaid rendering error:', err);
    }
  }, []); // Empty dependency array for stable reference

  return {
    svg,
    error,
    renderDiagram,
  };
}
