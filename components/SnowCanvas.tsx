import React, { useEffect, useRef } from 'react';

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wind: number;
  opacity: number;
}

const SnowCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flakesRef = useRef<Snowflake[]>([]);
  const animationFrameRef = useRef<number>(0);

  const initFlakes = (width: number, height: number) => {
    const flakeCount = 100; // Number of snowflakes
    const flakes: Snowflake[] = [];
    
    for (let i = 0; i < flakeCount; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.5, // Size between 0.5 and 2.5
        speed: Math.random() * 1 + 0.5, // Fall speed
        wind: (Math.random() - 0.5) * 0.5, // Slight horizontal drift
        opacity: Math.random() * 0.5 + 0.3, // Random opacity
      });
    }
    flakesRef.current = flakes;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear fully each frame (no trails for snow)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';

    flakesRef.current.forEach((flake) => {
      ctx.beginPath();
      ctx.globalAlpha = flake.opacity;
      ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
      ctx.fill();

      // Update position
      flake.y += flake.speed;
      flake.x += flake.wind;

      // Wrap around screen
      if (flake.y > canvas.height) {
        flake.y = -5;
        flake.x = Math.random() * canvas.width;
      }
      if (flake.x > canvas.width) {
        flake.x = 0;
      } else if (flake.x < 0) {
        flake.x = canvas.width;
      }
    });

    animationFrameRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Re-initialize only if array is empty or drastic change, 
      // but simpler to just replenish bounds check in draw loop.
      if (flakesRef.current.length === 0) {
        initFlakes(canvas.width, canvas.height);
      }
    };
    
    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
};

export default SnowCanvas;