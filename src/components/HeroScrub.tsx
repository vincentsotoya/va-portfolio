import { useEffect, useRef, useState } from "react";

// The Owner's own hero video; the poster (hero-poster.png) is the static fallback.
const VIDEO_SRC = "/assets/hero-scrub.mp4";

const FRAME_COUNT = 96; // number of still frames kept in memory
const MAX_FRAME_SIDE = 1280; // longest side of a stored frame, in px
const PLAYBACK_RATE = 2; // speed of the capture playthrough
const CAPTURE_RUNS = 3; // max playthroughs before falling back to seeking
const EASE = 0.12; // how quickly the scrub catches up to the cursor
const END_MARGIN = 0.05; // stop this far before the end so the last slot is a real frame

type RunResult = "done" | "hidden" | "failed";

/**
 * Cursor-driven video scrub. Renders the hero canvas and the loader; the
 * surrounding `.hero` section (in index.astro) supplies the layout. Mouse X
 * across the hero picks a frame, eased toward the target.
 */
export default function HeroScrub() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.closest<HTMLElement>(".hero");
    const ctx = canvas?.getContext("2d");
    if (!canvas || !hero || !ctx) return;

    // Reduced motion: keep the static poster (the hero background) and skip the scrub.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      return;
    }

    let disposed = false;
    const frames: (ImageBitmap | null)[] = new Array(FRAME_COUNT).fill(null);
    let target = 0;
    let current = 0;
    let lastIndex = -1;
    let lastBitmap: ImageBitmap | null = null;
    let dirty = true;
    let raf = 0;

    /* ---- Drawing ---- */

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = hero.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      dirty = true;
    };

    // Nearest loaded frame to `index`, searching outward in both directions.
    const nearestFrame = (index: number) => {
      for (let d = 0; d < FRAME_COUNT; d++) {
        if (frames[index - d]) return frames[index - d];
        if (frames[index + d]) return frames[index + d];
      }
      return null;
    };

    // Draw like `object-fit: cover`.
    const draw = (bitmap: ImageBitmap) => {
      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / bitmap.width, ch / bitmap.height);
      const w = bitmap.width * scale;
      const h = bitmap.height * scale;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(bitmap, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    const tick = () => {
      current += (target - current) * EASE;
      const index = Math.round(current);
      const bitmap = nearestFrame(index);

      if (bitmap && (dirty || index !== lastIndex || bitmap !== lastBitmap)) {
        draw(bitmap);
        lastIndex = index;
        lastBitmap = bitmap;
        dirty = false;
      }
      raf = requestAnimationFrame(tick);
    };

    /* ---- Input ---- */

    const setTargetFromX = (clientX: number) => {
      const rect = hero.getBoundingClientRect();
      const progress = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
      target = progress * (FRAME_COUNT - 1);
    };

    const onMouseMove = (e: MouseEvent) => setTargetFromX(e.clientX);
    const onTouch = (e: TouchEvent) => setTargetFromX(e.touches[0].clientX);

    hero.addEventListener("mousemove", onMouseMove);
    hero.addEventListener("touchstart", onTouch, { passive: true });
    hero.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    raf = requestAnimationFrame(tick);

    /* ---- Frame extraction ---- */

    const video = document.createElement("video");
    video.src = VIDEO_SRC;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("aria-hidden", "true");
    // Kept in the DOM (but invisible) so browsers keep presenting frames to it.
    video.style.cssText =
      "position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none;";
    document.body.appendChild(video);

    // Scratch canvas: copies the current video frame synchronously at the
    // target size, then gets turned into an ImageBitmap.
    const scratch = document.createElement("canvas");
    const scratchCtx = scratch.getContext("2d")!;

    const once = (el: HTMLElement, type: string) =>
      new Promise<void>((resolve) => el.addEventListener(type, () => resolve(), { once: true }));

    let loadedCount = 0;

    const captureFrame = async (slot: number) => {
      scratchCtx.drawImage(video, 0, 0, scratch.width, scratch.height);
      const bitmap = await createImageBitmap(scratch);
      if (disposed || frames[slot]) {
        bitmap.close();
        return;
      }
      frames[slot] = bitmap;
      loadedCount++;
      setLoaded(loadedCount);
    };

    // Browsers pause (or stall) video in background tabs, so only extract
    // while the page is visible.
    const whenVisible = () => {
      if (!document.hidden) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const check = () => {
          if (document.hidden) return;
          document.removeEventListener("visibilitychange", check);
          resolve();
        };
        document.addEventListener("visibilitychange", check);
      });
    };

    // Pass 1: play through at speed, grabbing each presented frame into the
    // slot that matches its media time.
    const playthrough = (endTime: number) =>
      new Promise<RunResult>((resolve) => {
        const pending: Promise<void>[] = [];
        const claimed = new Set<number>();
        let finished = false;

        const finish = (result: RunResult = "done") => {
          if (finished) return;
          finished = true;
          clearTimeout(safety);
          video.removeEventListener("ended", onEnded);
          video.removeEventListener("pause", onPause);
          video.pause();
          Promise.all(pending).then(() => resolve(result));
        };
        const onEnded = () => finish();
        const onPause = () => finish(document.hidden ? "hidden" : "done");

        const onFrame = (_now: number, meta: VideoFrameCallbackMetadata) => {
          if (finished) return;
          const slot = Math.min(
            FRAME_COUNT - 1,
            Math.max(0, Math.round((meta.mediaTime / endTime) * (FRAME_COUNT - 1))),
          );
          if (!frames[slot] && !claimed.has(slot)) {
            claimed.add(slot);
            pending.push(captureFrame(slot));
          }
          if (meta.mediaTime >= endTime) finish();
          else video.requestVideoFrameCallback(onFrame);
        };

        // Guard against a stalled playthrough.
        const safety = setTimeout(
          () => finish(document.hidden ? "hidden" : "done"),
          (endTime / PLAYBACK_RATE) * 1000 + 4000,
        );

        video.currentTime = 0;
        once(video, "seeked").then(() => {
          // The first frame is presented before playback starts, so
          // requestVideoFrameCallback never reports it: grab it now.
          if (!frames[0]) {
            claimed.add(0);
            pending.push(captureFrame(0));
          }
          video.playbackRate = PLAYBACK_RATE;
          video.requestVideoFrameCallback(onFrame);
          video
            .play()
            .then(() => {
              video.addEventListener("ended", onEnded);
              video.addEventListener("pause", onPause);
            })
            .catch(() => finish(document.hidden ? "hidden" : "failed"));
        });
      });

    // Pass 2: seek only to the slots that are still empty.
    const fillMissing = async (endTime: number) => {
      for (let slot = 0; slot < FRAME_COUNT; slot++) {
        if (disposed) return;
        if (frames[slot]) continue;
        await whenVisible();
        video.currentTime = (slot / (FRAME_COUNT - 1)) * endTime;
        await once(video, "seeked");
        await captureFrame(slot);
      }
    };

    const extractFrames = async () => {
      if (video.readyState < 1) await once(video, "loadedmetadata");

      const scale = Math.min(1, MAX_FRAME_SIDE / Math.max(video.videoWidth, video.videoHeight));
      scratch.width = Math.round(video.videoWidth * scale);
      scratch.height = Math.round(video.videoHeight * scale);

      const endTime = Math.max(0, video.duration - END_MARGIN);

      if ("requestVideoFrameCallback" in HTMLVideoElement.prototype) {
        let runs = 0;
        while (!disposed && runs < CAPTURE_RUNS && frames.includes(null)) {
          await whenVisible();
          const result = await playthrough(endTime);
          if (result === "failed") break;
          if (result === "done") runs++;
        }
      }
      await fillMissing(endTime);
    };

    extractFrames()
      .catch((err) => console.error("Hero video scrub failed:", err))
      .finally(() => {
        video.pause();
        video.removeAttribute("src");
        video.load();
        video.remove();
        if (!disposed) setDone(true);
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      hero.removeEventListener("mousemove", onMouseMove);
      hero.removeEventListener("touchstart", onTouch);
      hero.removeEventListener("touchmove", onTouch);
      window.removeEventListener("resize", resizeCanvas);
      video.pause();
      video.remove();
      frames.forEach((f) => f?.close());
    };
  }, []);

  const pct = Math.round((loaded / FRAME_COUNT) * 100);

  return (
    <>
      <canvas className="hero__canvas" ref={canvasRef} aria-hidden="true" />
      <div className={`loader${done ? " is-done" : ""}`}>
        <div className="loader__pill glass">
          <span className="loader__label">LOADING</span>
          <span
            className="loader__bar"
            role="progressbar"
            aria-label="Loading"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
          >
            <span className="loader__fill" style={{ transform: `scaleX(${loaded / FRAME_COUNT})` }} />
          </span>
          <span className="loader__pct">{pct}%</span>
        </div>
      </div>
    </>
  );
}
