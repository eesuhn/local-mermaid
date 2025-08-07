import { useState, useCallback, useRef, useEffect } from 'react';
import { UI_CONSTANTS } from '@/lib/constants';

export interface PanState {
  x: number;
  y: number;
}

export interface UsePanZoomReturn {
  zoomLevel: number;
  panOffset: PanState;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleMouseLeave: () => void;
  isPanning: boolean;
}

export function usePanZoom(): UsePanZoomReturn {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState<PanState>({ x: 0, y: 0 });

  const panStateRef = useRef({
    isPanning: false,
    lastPoint: { x: 0, y: 0 },
    currentOffset: { x: 0, y: 0 },
  });

  const animationFrameRef = useRef<number>();

  const zoomIn = useCallback(() => {
    setZoomLevel((prev) =>
      Math.min(UI_CONSTANTS.MAX_ZOOM, prev + UI_CONSTANTS.ZOOM_STEP)
    );
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel((prev) =>
      Math.max(UI_CONSTANTS.MIN_ZOOM, prev - UI_CONSTANTS.ZOOM_STEP)
    );
  }, []);

  const resetZoom = useCallback(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    panStateRef.current.currentOffset = { x: 0, y: 0 };
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        // Left mouse button only
        e.preventDefault();
        panStateRef.current.isPanning = true;
        panStateRef.current.lastPoint = { x: e.clientX, y: e.clientY };
        panStateRef.current.currentOffset = panOffset;
      }
    },
    [panOffset]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!panStateRef.current.isPanning) return;

    e.preventDefault();

    const deltaX = e.clientX - panStateRef.current.lastPoint.x;
    const deltaY = e.clientY - panStateRef.current.lastPoint.y;

    panStateRef.current.currentOffset = {
      x: panStateRef.current.currentOffset.x + deltaX,
      y: panStateRef.current.currentOffset.y + deltaY,
    };

    panStateRef.current.lastPoint = { x: e.clientX, y: e.clientY };

    // Use requestAnimationFrame for smooth updates
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      setPanOffset(panStateRef.current.currentOffset);
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    panStateRef.current.isPanning = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    panStateRef.current.isPanning = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    zoomLevel,
    panOffset,
    zoomIn,
    zoomOut,
    resetZoom,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    isPanning: panStateRef.current.isPanning,
  };
}
