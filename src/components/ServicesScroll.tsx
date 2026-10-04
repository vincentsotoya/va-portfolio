import { useEffect, useRef, useState } from "react";
import { services } from "../config/services";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Pinned section that slides the Service cards sideways as the page scrolls.
 * The section height is set to (track width − viewport) + viewport height so
 * vertical scroll distance maps 1:1 to horizontal travel.
 */
export default function ServicesScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const progressBar = progressRef.current;
    if (!section || !track || !progressBar) return;

    const cards = [...track.querySelectorAll<HTMLElement>(".service")];
    let distance = 0;

    const update = () => {
      const top = section.getBoundingClientRect().top;
      const progress = distance ? Math.min(Math.max(-top / distance, 0), 1) : 0;

      track.style.transform = `translate3d(${-progress * distance}px, 0, 0)`;
      progressBar.style.width = `${progress * 100}%`;

      // Current card = the one closest to a reference point travelling from the
      // left edge (progress 0) to the right edge (progress 1), so the first and
      // last cards both get counted.
      const center = window.innerWidth * progress + progress * distance;
      let best = Infinity;
      let index = 0;
      cards.forEach((card, i) => {
        const d = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
        if (d < best) {
          best = d;
          index = i;
        }
      });
      setCurrent(index);
    };

    const measure = () => {
      distance = Math.max(0, track.scrollWidth - window.innerWidth);
      section.style.height = `${distance + window.innerHeight}px`;
      update();
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", measure);
    document.fonts.ready.then(measure);
    measure();

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section className="work" id="work" data-nav="light" ref={sectionRef}>
      <div className="work__sticky">
        <div className="work__head container">
          <p className="eyebrow">(02) Services</p>
          <p className="work__counter">
            <span>{pad(current + 1)}</span> / {pad(services.length)}
          </p>
        </div>

        <div className="work__track" ref={trackRef}>
          <div className="work__intro">
            <h2 className="work__title">
              What I<br />
              can take on
            </h2>
            <p>Four ways I take admin off your plate. Scroll to explore.</p>
          </div>

          {services.map((s) => (
            <article className={`service service--${s.art}`} key={s.num}>
              <div className="service__art" />
              <span className="service__num">{s.num}</span>
              <div className="service__info glass">
                <div>
                  <h3 className="service__title">{s.title}</h3>
                  <p className="service__summary">{s.summary}</p>
                  <p className="service__tools">{s.tools.join(" · ")}</p>
                  <p className="service__sample">{s.sample}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="work__progress" aria-hidden="true">
          <span ref={progressRef} />
        </div>
      </div>
    </section>
  );
}
