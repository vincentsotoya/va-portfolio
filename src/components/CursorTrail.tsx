import { useEffect, useRef } from "react";

// PLACEHOLDER: these stickers belong to the clone, not to the Owner.
const IMAGES = [1, 2, 3, 4].map((n) => `/assets/trail/c${n}.png`);

const SPACING = 90; // px of pointer travel between images
const LIFETIME = 1150; // ms each image lives (pop 260 → hold → shrink 450)
const MAX_PER_MOVE = 6;

const random = (min: number, max: number) => min + Math.random() * (max - min);

/** While the mouse button is held, images pop out along the cursor's path. */
export default function CursorTrail() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    // Preload so the first images don't pop in blank.
    IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    let pressed = false;
    let imageIndex = 0;
    let lastX = 0;
    let lastY = 0;

    const spawn = (x: number, y: number, dirX = 0, dirY = 0) => {
      const img = document.createElement("img");
      img.src = IMAGES[imageIndex];
      img.alt = "";
      img.decoding = "async";
      imageIndex = (imageIndex + 1) % IMAGES.length;

      const width = random(110, 180);
      const tilt = random(-20, 20);
      const spin = tilt < 0 ? -18 : 18; // keeps rotating the way it leans
      img.style.width = `${width}px`;
      img.style.left = `${x + dirX * 14}px`;
      img.style.top = `${y + dirY * 14}px`;
      layer.appendChild(img);

      const t = (dy: number, rot: number, scale: number) =>
        `translate(-50%, -50%) translateY(${dy}px) rotate(${rot}deg) scale(${scale})`;

      const anim = img.animate(
        [
          { offset: 0, transform: t(0, tilt, 0), opacity: 1, easing: "cubic-bezier(0.34, 1.7, 0.64, 1)" },
          { offset: 260 / LIFETIME, transform: t(0, tilt, 1), opacity: 1, easing: "ease-out" },
          { offset: 700 / LIFETIME, transform: t(0, tilt + spin * 0.15, 0.94), opacity: 1, easing: "cubic-bezier(0.55, 0, 0.75, 0.2)" },
          { offset: 1, transform: t(40, tilt + spin, 0.1), opacity: 0 },
        ],
        { duration: LIFETIME, fill: "forwards" },
      );
      anim.onfinish = () => img.remove();
    };

    const end = () => {
      if (!pressed) return;
      pressed = false;
      document.body.classList.remove("is-trailing");
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      pressed = true;
      lastX = e.clientX;
      lastY = e.clientY;
      document.body.classList.add("is-trailing");
      spawn(lastX, lastY);
    };

    const onMove = (e: PointerEvent) => {
      if (!pressed) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dist = Math.hypot(dx, dy);
      const steps = Math.floor(dist / SPACING);
      if (!steps) return;

      const dirX = dx / dist;
      const dirY = dy / dist;
      // Fast strokes: spread at most MAX_PER_MOVE images evenly up to the cursor.
      const count = Math.min(steps, MAX_PER_MOVE);
      const step = steps > MAX_PER_MOVE ? dist / count : SPACING;

      for (let i = 1; i <= count; i++) {
        spawn(lastX + dirX * step * i, lastY + dirY * step * i, dirX, dirY);
      }
      lastX += dirX * step * count;
      lastY += dirY * step * count;
    };

    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    window.addEventListener("blur", end);

    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      window.removeEventListener("blur", end);
      end();
    };
  }, []);

  return <div className="trail" aria-hidden="true" ref={layerRef} />;
}
