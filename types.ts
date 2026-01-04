export interface WishData {
  text: string;
  fortune?: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  life: number;
  decay: number;
  delay: number; // Frames to wait before moving
}

export interface Rocket {
  x: number;
  y: number;
  vy: number;
  targetY: number;
  exploded: boolean;
  color: string;
  text: string; // The text payload
}
