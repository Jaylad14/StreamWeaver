import React, { useEffect, useRef } from 'react';

export default function CircuitBackground({ active }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    let w = 0, h = 0, nodes = [], frame = null;

    const newNode = () => ({ x: Math.random() * w, y: Math.random() * h, d: Math.floor(Math.random() * 4) });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#070b14';
      ctx.fillRect(0, 0, w, h);
      nodes = Array.from({ length: 14 }, newNode);
    };

    const step = () => {
      ctx.fillStyle = 'rgba(7, 11, 20, 0.04)';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(56, 239, 255, 0.95)';
      ctx.lineWidth = 2.4;
      for (const n of nodes) {
        const [dx, dy] = dirs[n.d];
        const nx = n.x + dx * 0.5;
        const ny = n.y + dy * 0.5;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(nx, ny);
        ctx.stroke();
        n.x = nx;
        n.y = ny;
        if (Math.random() < 0.01) n.d = Math.floor(Math.random() * 4);
        if (n.x < 0 || n.x > w || n.y < 0 || n.y > h) Object.assign(n, newNode());
      }
      frame = requestAnimationFrame(step);
    };

    resize();
    window.addEventListener('resize', resize);
    step();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: active ? 1 : 0,
        transition: 'opacity 1.2s ease'
      }}
    />
  );
}
