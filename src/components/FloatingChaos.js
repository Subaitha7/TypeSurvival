"use client";

import { useEffect, useRef, useMemo } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

// Color tiers based on intensity
function chaosColor(intensity) {
  if (intensity >= 3) return ["#ff2244", "#ff4466", "#ff6688"]; // chaos: red
  if (intensity >= 2) return ["#ff6b00", "#ff8c00", "#ffaa33"]; // heat: orange
  return ["#ffd700", "#ffec60", "#fff080"];                      // warm: yellow
}

export default function FloatingChaos({ intensity, wrongKeyPos }) {
  const containerRef = useRef(null);
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);
  const wrongKeyRef = useRef(wrongKeyPos);

  // Update wrongKeyPos ref so animation loop can read latest without re-running effect
  useEffect(() => { wrongKeyRef.current = wrongKeyPos; }, [wrongKeyPos]);

  const count = useMemo(() => {
    if (intensity <= 0) return 0;
    if (intensity === 1) return 5;
    if (intensity === 2) return 12;
    return 22;
  }, [intensity]);

  useEffect(() => {
    if (!containerRef.current || count === 0) return;

    const container = containerRef.current;
    const W = container.offsetWidth  || 700;
    const H = container.offsetHeight || 300;
    const colors = chaosColor(intensity);

    // Spawn particles
    particlesRef.current = Array.from({ length: count }).map(() => {
      const el = document.createElement("span");
      el.className = "chaos-letter";
      el.textContent = randomChar();
      el.style.color = colors[Math.floor(Math.random() * colors.length)];
      el.style.opacity = String(0.3 + Math.random() * 0.6);
      el.style.fontSize = `${14 + Math.random() * 14}px`;
      el.style.textShadow = `0 0 6px currentColor`;

      // Start position — spread across card
      const x = Math.random() * W;
      const y = Math.random() * H;
      el.style.left = `${x}px`;
      el.style.top  = `${y}px`;
      container.appendChild(el);

      return {
        el,
        x, y,
        // Drift velocity
        vx: (Math.random() - 0.5) * 0.6,
        vy: -0.3 - Math.random() * 0.7,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 80 + Math.random() * 120,
        age: Math.random() * 100, // stagger start
      };
    });

    let lastWrongPos = null;

    function tick() {
      const W2 = container.offsetWidth  || 700;
      const H2 = container.offsetHeight || 300;

      // If a new wrong key fired, explode all particles from that position
      const wp = wrongKeyRef.current;
      if (wp && wp !== lastWrongPos) {
        lastWrongPos = wp;
        // Relative to container
        const rect = container.getBoundingClientRect();
        const rx = wp.x - rect.left;
        const ry = wp.y - rect.top;
        particlesRef.current.forEach((p) => {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1.5 + Math.random() * 3;
          p.x = rx + (Math.random() - 0.5) * 40;
          p.y = ry + (Math.random() - 0.5) * 20;
          p.vx = Math.cos(angle) * speed;
          p.vy = Math.sin(angle) * speed - 1;
          p.age = 0;
          p.el.textContent = randomChar();
          p.el.style.color = colors[Math.floor(Math.random() * colors.length)];
        });
      }

      particlesRef.current.forEach((p) => {
        p.age++;
        if (p.age < 0) return; // staggered start

        // Drift & slow down
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around bounds
        if (p.x < -20) p.x = W2 + 10;
        if (p.x > W2 + 20) p.x = -10;
        if (p.y < -20) { p.y = H2 + 10; p.x = Math.random() * W2; p.el.textContent = randomChar(); }
        if (p.y > H2 + 20) p.y = -10;

        p.el.style.left = `${p.x}px`;
        p.el.style.top  = `${p.y}px`;

        // Flicker
        if (Math.random() < 0.01) {
          p.el.textContent = randomChar();
          p.el.style.color = colors[Math.floor(Math.random() * colors.length)];
        }
      });

      animFrameRef.current = requestAnimationFrame(tick);
    }

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      particlesRef.current.forEach((p) => p.el.remove());
      particlesRef.current = [];
    };
  }, [count, intensity]);

  if (count === 0) return null;

  return <div ref={containerRef} className="chaos-layer" />;
}
