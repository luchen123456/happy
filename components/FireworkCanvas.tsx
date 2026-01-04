import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Particle, Rocket } from '../types';

interface FireworkCanvasProps {
  // Callback when a specific rocket explodes
  onExplode?: () => void;
}

export interface FireworkCanvasHandle {
  launch: (text: string) => void;
}

const FireworkCanvas = forwardRef<FireworkCanvasHandle, FireworkCanvasProps>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rocketsRef = useRef<Rocket[]>([]);
  const animationFrameRef = useRef<number>(0);

  // Helper to calculate font size based on screen width
  const getFontSize = () => Math.min(window.innerWidth / 5, 120);

  // Helper to get pixel coordinates for text
  const getTextCoordinates = (text: string, fontSize: number): { x: number; y: number }[] => {
    const offCanvas = document.createElement('canvas');
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return [];

    // Make canvas large enough to hold the text
    offCanvas.width = window.innerWidth; 
    offCanvas.height = 300;
    offCtx.font = `bold ${fontSize}px Cinzel, serif`;
    offCtx.fillStyle = '#ffffff';
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    
    const centerX = offCanvas.width / 2;
    const centerY = offCanvas.height / 2;
    
    offCtx.fillText(text, centerX, centerY);

    const imageData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
    const data = imageData.data;
    const coords: { x: number; y: number }[] = [];

    // Sampling rate to reduce particle count
    const gap = 3; 

    for (let y = 0; y < offCanvas.height; y += gap) {
      for (let x = 0; x < offCanvas.width; x += gap) {
        const index = (y * offCanvas.width + x) * 4;
        // If alpha > 128 (visible pixel)
        if (data[index + 3] > 128) {
          coords.push({
            x: x - centerX,
            y: y - centerY
          });
        }
      }
    }
    return coords;
  };

  const createParticles = (x: number, y: number, text: string, color: string) => {
    const fontSize = getFontSize();
    const coords = getTextCoordinates(text, fontSize);
    
    coords.forEach(coord => {
      particlesRef.current.push({
        x: x + coord.x,
        y: y + coord.y,
        vx: (Math.random() - 0.5) * 1.5, // Random drift velocity
        vy: (Math.random() - 0.5) * 1.5, // Random drift velocity
        alpha: 1,
        color: color, // Strictly use the rocket's color for the text
        size: Math.random() * 2 + 1,
        life: 200, 
        decay: 0.008, 
        delay: 60 + Math.random() * 10 // Keep the hover effect
      });
    });

    // Add white sparkles for the explosion pop
    for(let i=0; i<50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8;
        particlesRef.current.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            color: '#ffffff', // Always white sparkles
            size: Math.random() * 2,
            life: 60,
            decay: 0.02,
            delay: 0 
        });
    }
  };

  const launchRocket = (text: string) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    // 1. Measure Text to Determine Safe X Range
    const fontSize = getFontSize();
    const ctx = canvas.getContext('2d');
    let textWidth = 200; // default fallback
    
    if (ctx) {
      ctx.font = `bold ${fontSize}px Cinzel, serif`;
      textWidth = ctx.measureText(text).width;
    }

    const margin = 20; // Safe margin from screen edges
    const minX = (textWidth / 2) + margin;
    const maxX = canvas.width - (textWidth / 2) - margin;

    let x: number;
    if (minX >= maxX) {
      // Text is too wide, just center it
      x = canvas.width / 2;
    } else {
      // Random X within safe bounds
      x = minX + Math.random() * (maxX - minX);
    }

    // 2. Determine Safe Y Range (Top 10% - 30%)
    const targetY = canvas.height * 0.1 + Math.random() * (canvas.height * 0.2);
    
    // Original Pastel/Neon Palette
    const colors = ['#f472b6', '#34d399', '#60a5fa', '#facc15', '#a78bfa'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    rocketsRef.current.push({
      x,
      y: canvasRef.current.height,
      vy: -15 - Math.random() * 5, 
      targetY,
      exploded: false,
      color,
      text
    });
  };

  useImperativeHandle(ref, () => ({
    launch: (text: string) => {
      launchRocket(text);
    }
  }));

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use destination-out to fade existing pixels to transparent
    // This allows the SnowCanvas behind it to show through!
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Adjust opacity for trail length (lower = longer)
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Reset composite operation to draw new stuff on top
    ctx.globalCompositeOperation = 'source-over';

    // Update Rockets
    for (let i = rocketsRef.current.length - 1; i >= 0; i--) {
      const r = rocketsRef.current[i];
      r.y += r.vy;
      r.vy *= 0.96; // Drag

      // Draw Rocket
      ctx.beginPath();
      ctx.arc(r.x, r.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = r.color;
      ctx.fill();

      // Tail
      ctx.beginPath();
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x, r.y + 15);
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.stroke();

      // Explode condition
      if (r.vy > -1 || r.y <= r.targetY) {
        createParticles(r.x, r.y, r.text, r.color); 
        if (props.onExplode) props.onExplode();
        rocketsRef.current.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      
      // Handle "Pause" logic
      if (p.delay > 0) {
        p.delay--;
        // Shimmer while waiting
        ctx.save();
        ctx.globalAlpha = 0.7 + Math.random() * 0.3; 
        ctx.fillStyle = p.color;
        ctx.beginPath();
        const jitterX = (Math.random() - 0.5) * 1;
        const jitterY = (Math.random() - 0.5) * 1;
        ctx.arc(p.x + jitterX, p.y + jitterY, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        continue;
      }

      // Physics for active particles
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.02; 
      p.alpha -= p.decay;
      p.life--;

      if (p.alpha <= 0 || p.life <= 0) {
        particlesRef.current.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      // Add glitter
      if (Math.random() > 0.95) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
      }
      ctx.restore();
    }

    animationFrameRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-10 pointer-events-none" // z-10 puts it above snow (z-0)
    />
  );
});

FireworkCanvas.displayName = 'FireworkCanvas';

export default FireworkCanvas;