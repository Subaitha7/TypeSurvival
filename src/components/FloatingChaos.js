"use client";

import { useEffect, useRef, useMemo } from "react";

/*
  FloatingChaos v3 — Fixed to viewport so it renders ABOVE everything.
  Uses a fixed-position canvas covering the entire screen.
  Matrix rain columns + shockwave rings on wrong key.
*/

const CHARS  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*!?";
const rChar  = () => CHARS[Math.floor(Math.random() * CHARS.length)];

function intensityColors(intensity) {
  if (intensity >= 3) return { head: "#ff2244", trail: "#7a0018", ring: "#ff2244" };
  if (intensity >= 2) return { head: "#ff8c00", trail: "#7a3a00", ring: "#ff6b00" };
  return                      { head: "#ffd700", trail: "#7a6000", ring: "#ffd700" };
}

function columnCount(intensity) {
  if (intensity <= 0) return 0;
  if (intensity === 1) return 4;
  if (intensity === 2) return 10;
  return 20;
}

export default function FloatingChaos({ intensity, wrongKeyPos }) {
  const canvasRef   = useRef(null);
  const rafRef      = useRef(null);
  const colsRef     = useRef([]);
  const shockwaves  = useRef([]);
  const wrongKeyRef = useRef(wrongKeyPos);
  const lastWrongRef= useRef(null);

  const count = useMemo(() => columnCount(intensity), [intensity]);

  useEffect(() => { wrongKeyRef.current = wrongKeyPos; }, [wrongKeyPos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (count === 0) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const ctx = canvas.getContext("2d");
    const colors = intensityColors(intensity);
    const FONT_SIZE = 14;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      rebuildColumns();
    }

    function rebuildColumns() {
      const W = canvas.width;
      const H = canvas.height;
      const totalCols = Math.floor(W / FONT_SIZE);
      const step = Math.max(1, Math.floor(totalCols / count));
      colsRef.current = Array.from({ length: count }, (_, i) => ({
        x:    ((i * step) + Math.floor(Math.random() * step)) * FONT_SIZE,
        y:    Math.random() * H,
        speed: 1.5 + Math.random() * 2.8,
        chars: Array.from({ length: 10 }, rChar),
        headChar: rChar(),
        flickerTimer: 0,
      }));
    }

    resize();
    window.addEventListener("resize", resize);

    function draw() {
      const W = canvas.width;
      const H = canvas.height;

      // Clear each frame so the canvas stays transparent — the game UI beneath remains visible
      ctx.clearRect(0, 0, W, H);

      ctx.font = `bold ${FONT_SIZE}px 'VT323', monospace`;

      // ── Matrix columns ──────────────────────────────
      colsRef.current.forEach((col) => {
        col.flickerTimer++;

        // Trail chars
        col.chars.forEach((ch, ti) => {
          ctx.globalAlpha = 0.08 + (ti / col.chars.length) * 0.3;
          ctx.fillStyle = colors.trail;
          ctx.fillText(ch, col.x, col.y - (col.chars.length - ti) * FONT_SIZE);
        });

        // Bright head
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = colors.head;
        ctx.shadowBlur = 10;
        ctx.shadowColor = colors.head;
        ctx.fillText(col.headChar, col.x, col.y);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Advance
        col.y += col.speed;
        if (col.y > H + FONT_SIZE * 2) {
          col.y = -FONT_SIZE * col.chars.length;
          col.x = Math.floor(Math.random() * (W / FONT_SIZE)) * FONT_SIZE;
        }

        if (col.flickerTimer % 5 === 0) {
          col.chars[Math.floor(Math.random() * col.chars.length)] = rChar();
          col.headChar = rChar();
        }
      });

      // ── Shockwave rings ─────────────────────────────
      const wp = wrongKeyRef.current;
      if (wp && wp !== lastWrongRef.current) {
        lastWrongRef.current = wp;
        // wp.x and wp.y are already viewport coords (from getBoundingClientRect)
        shockwaves.current.push(
          { x: wp.x, y: wp.y, r: 4,  maxR: 120, opacity: 1,   color: colors.ring, lineW: 3 },
          { x: wp.x, y: wp.y, r: 2,  maxR: 70,  opacity: 0.6, color: "#ffffff",   lineW: 1.2, lag: 8 },
          { x: wp.x, y: wp.y, r: 6,  maxR: 200, opacity: 0.3, color: colors.head, lineW: 1,   lag: 16 },
        );
      }

      shockwaves.current = shockwaves.current.filter((sw) => sw.opacity > 0.02);
      shockwaves.current.forEach((sw) => {
        if (sw.lag > 0) { sw.lag--; return; }
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.lineWidth   = sw.lineW;
        ctx.globalAlpha = sw.opacity;
        ctx.shadowBlur  = 16;
        ctx.shadowColor = sw.color;
        ctx.stroke();
        ctx.shadowBlur  = 0;
        ctx.globalAlpha = 1;

        const prog = sw.r / sw.maxR;
        sw.r      += 3 + prog * 4;
        sw.opacity-= 0.028;
        sw.lineW  *= 0.97;
      });

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [count, intensity]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      "fixed",
        top:           0,
        left:          0,
        width:         "100vw",
        height:        "100vh",
        pointerEvents: "none",
        zIndex:        9999,
        opacity:       count === 0 ? 0 : 1,
        transition:    "opacity 0.5s",
      }}
    />
  );
}
