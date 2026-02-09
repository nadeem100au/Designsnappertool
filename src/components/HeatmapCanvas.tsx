import React, { useRef, useEffect } from 'react';

interface Annotation {
  id: number;
  x: number;
  y: number;
  severity: 'critical' | 'minor';
}

interface HeatmapCanvasProps {
  annotations: Annotation[];
  width: number;
  height: number;
  className?: string;
}

export const HeatmapCanvas: React.FC<HeatmapCanvasProps> = ({ annotations, width, height, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // 1. Create a grayscale density map on an offscreen canvas
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    const offCtx = offscreenCanvas.getContext('2d');
    if (!offCtx) return;

    annotations.forEach(ann => {
      const x = (ann.x / 100) * width;
      const y = (ann.y / 100) * height;
      const radius = ann.severity === 'critical' ? 100 : 70; // Larger radius for more overlap/vibrancy
      const intensity = ann.severity === 'critical' ? 1.0 : 0.6; // Higher base intensity

      const gradient = offCtx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(0, 0, 0, ${intensity})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      offCtx.fillStyle = gradient;
      offCtx.globalCompositeOperation = 'screen'; // Additive blending for density
      offCtx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    });

    // 2. Colorize the density map
    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Heatmap color ramp (Vibrant Spectral)
    // 0: Transparent/Deep Blue, 0.3: Blue, 0.5: Cyan/Green, 0.7: Yellow, 0.9+: Red
    const getColor = (v: number) => {
      // Vivid color stops for a high-contrast heatmap
      let r = 0, g = 0, b = 0;
      
      if (v < 0.25) {
        // Deep Blue to Blue
        b = 255;
        g = v * 4 * 255;
      } else if (v < 0.5) {
        // Blue to Cyan/Green
        b = 255 - (v - 0.25) * 4 * 255;
        g = 255;
      } else if (v < 0.75) {
        // Green to Yellow
        r = (v - 0.5) * 4 * 255;
        g = 255;
      } else {
        // Yellow to Red
        r = 255;
        g = 255 - (v - 0.75) * 4 * 255;
      }

      const a = Math.min(255, v * 240); // High opacity for vibrancy
      return [r, g, b, a];
    };

    const newImgData = ctx.createImageData(width, height);
    for (let i = 0; i < data.length; i += 4) {
      // Data[i+3] is the alpha/density from the grayscale drawing
      const alpha = data[i + 3] / 255;
      if (alpha > 0.05) {
        const [r, g, b, a] = getColor(alpha);
        newImgData.data[i] = r;
        newImgData.data[i + 1] = g;
        newImgData.data[i + 2] = b;
        newImgData.data[i + 3] = a;
      }
    }

    ctx.putImageData(newImgData, 0, 0);
  }, [annotations, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
