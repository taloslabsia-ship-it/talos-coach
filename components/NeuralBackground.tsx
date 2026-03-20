'use client';

import { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulse: number;
  pulseSpeed: number;
  opacity: number;
}

const COLORS = {
  primary: '13, 242, 242',   // #0df2f2 cyan
  secondary: '168, 85, 247', // purple
  dim: '8, 160, 160',
};

export function NeuralBackground({ opacity = 0.7 }: { opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let nodes: Node[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initNodes();
    };

    const initNodes = () => {
      const count = Math.floor((canvas.width * canvas.height) / 14000);
      nodes = Array.from({ length: Math.min(count, 80) }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.02,
        opacity: 0.4 + Math.random() * 0.6,
      }));
    };

    const drawNode = (node: Node) => {
      const glow = Math.sin(node.pulse) * 0.5 + 0.5;
      const r = node.radius + glow * 1.5;
      const alpha = node.opacity * (0.6 + glow * 0.4);

      // Outer glow
      const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 4);
      grad.addColorStop(0, `rgba(${COLORS.primary}, ${alpha * 0.8})`);
      grad.addColorStop(0.4, `rgba(${COLORS.primary}, ${alpha * 0.2})`);
      grad.addColorStop(1, `rgba(${COLORS.primary}, 0)`);
      ctx.beginPath();
      ctx.arc(node.x, node.y, r * 4, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${COLORS.primary}, ${alpha})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = `rgba(${COLORS.primary}, 0.9)`;
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    const drawConnection = (a: Node, b: Node, dist: number, maxDist: number) => {
      const t = 1 - dist / maxDist;
      const alpha = t * t * 0.5;
      const pulse = (Math.sin(a.pulse) + Math.sin(b.pulse)) * 0.5 * 0.5 + 0.5;

      // Gradient line
      const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      grad.addColorStop(0, `rgba(${COLORS.primary}, ${alpha * pulse})`);
      grad.addColorStop(0.5, `rgba(${COLORS.primary}, ${alpha * 0.8})`);
      grad.addColorStop(1, `rgba(${COLORS.primary}, ${alpha * pulse})`);

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = t * 1.2;
      ctx.shadowBlur = 4;
      ctx.shadowColor = `rgba(${COLORS.primary}, 0.4)`;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Traveling particle along the connection
      const speed = 0.003;
      const phase = (Date.now() * speed + a.pulse) % 1;
      const px = a.x + (b.x - a.x) * phase;
      const py = a.y + (b.y - a.y) * phase;
      if (t > 0.4) {
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 1.5})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = `rgba(${COLORS.primary}, 1)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    const MAX_DIST = 160;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update nodes
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += node.pulseSpeed;

        // Bounce
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            drawConnection(nodes[i], nodes[j], dist, MAX_DIST);
          }
        }
      }

      // Draw nodes on top
      for (const node of nodes) {
        drawNode(node);
      }

      animId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity }}
    />
  );
}
