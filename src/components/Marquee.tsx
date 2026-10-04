import { useEffect, useRef } from "react";

const MARQUEE_SPEED = 60; // px per second

interface Row {
  words: string[];
  reverse?: boolean;
}

const rows: Row[] = [
  { words: ["Email", "Calendar", "Documents", "Automation"] },
  { words: ["Vincent Sotoya", "Virtual Assistant", "Engineer", "Philippines"], reverse: true },
];

const ariaLabel =
  "Email, Calendar, Documents, Automation. Vincent Sotoya, Virtual Assistant, Engineer, Philippines.";

/** Two tilted, opposite-direction rows of giant text. Speeds up while scrolling. */
export default function Marquee() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const state = [...root.querySelectorAll<HTMLElement>(".marquee__row")].map((row) => {
      const track = row.querySelector<HTMLElement>(".marquee__track")!;
      const group = track.querySelector<HTMLElement>(".marquee__group")!;
      return {
        row,
        track,
        group,
        dir: row.classList.contains("marquee--reverse") ? 1 : -1,
        width: 0,
        offset: 0,
      };
    });

    // Clone the group until the track covers the row plus one extra group,
    // so wrapping by one group width is seamless.
    const measure = () => {
      for (const r of state) {
        r.track.querySelectorAll(".marquee__group[data-clone]").forEach((c) => c.remove());
        r.width = r.group.getBoundingClientRect().width;
        if (!r.width) continue;
        const needed = Math.ceil(root.offsetWidth / r.width) + 1;
        for (let i = 0; i < needed; i++) {
          const clone = r.group.cloneNode(true) as HTMLElement;
          clone.dataset.clone = "";
          r.track.appendChild(clone);
        }
        r.offset %= r.width;
      }
    };

    let visible = true;
    let boost = 0;
    let lastScrollY = window.scrollY;
    let lastTime = performance.now();
    let raf = 0;

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(root);

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Scroll velocity (px/s) adds a smoothed speed boost.
      const scrollY = window.scrollY;
      const velocity = dt > 0 ? Math.abs(scrollY - lastScrollY) / dt : 0;
      lastScrollY = scrollY;
      boost += (Math.min(velocity * 0.4, 900) - boost) * 0.08;

      if (visible) {
        const step = (MARQUEE_SPEED + boost) * dt;
        for (const r of state) {
          if (!r.width) continue;
          r.offset = (r.offset + step) % r.width;
          // Left-moving rows go 0 → -width; right-moving rows go -width → 0.
          const x = r.dir < 0 ? -r.offset : r.offset - r.width;
          r.track.style.transform = `translate3d(${x}px, 0, 0)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    measure();
    document.fonts.ready.then(measure);
    window.addEventListener("resize", measure);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div className="marquee" aria-label={ariaLabel} ref={rootRef}>
      {rows.map((row, i) => (
        <div className={`marquee__row${row.reverse ? " marquee--reverse" : ""}`} aria-hidden="true" key={i}>
          <div className="marquee__track">
            <div className="marquee__group">
              {row.words.map((word, w) => (
                <span key={word} style={{ display: "contents" }}>
                  <span className={(w + i) % 2 === 1 ? "outline" : undefined}>{word}</span>
                  <span className="marquee__sep">✦</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
