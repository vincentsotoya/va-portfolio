# Progress and blueprint

Last updated: 2026-10-04. Read this first when you come back. Vocabulary is in `CONTEXT.md`, copy and design rules in `CLAUDE.md`.

## Where we left off
- Site is **deployed on Vercel** (from GitHub `vincentsotoya/va-portfolio`, branch `main`, pushed through commit `503cbb2`).
- You tested it on your phone but **haven't reported the result yet**. First thing tomorrow: tell Claude what you saw (checklist below).
- Local `main` matches GitHub, except for this note about the TypeScript pin (edited after the last push).
- TypeScript is pinned to 6.x because `@astrojs/check` didn't work with 7 (the commit message says so); don't bump it back without checking.

## Phone test checklist (pending)
1. Does the "LOADING" pill reach 100% on mobile data and then clear, or get stuck?
2. Does dragging a finger across the hero scrub the video?
3. Layout: computer under the nav, title/intro/buttons below it, no sideways scroll, nothing cut off?
4. Rest of the page on a phone: About, Services scroll, Credentials, footer.

## What the site is
Portfolio for Vincent Sotoya, a technical virtual assistant (email, calendar, documents, workflow automation) with a software engineering background (Java, trained in Japan). Astro 7 + React 19 + Tailwind 4, static build, one page so far.

## Architecture
```
src/
  pages/index.astro        Home page: Hero > About (marquee) > Services scroll > Credentials > Footer/Contact
  layouts/Base.astro       Shell: Nav, <main>, Footer, nav dark/light switching on scroll
  components/
    HeroScrub.tsx          Cursor/touch-driven video scrub on a canvas (loader + frame capture)
    Marquee.tsx            Two tilted scrolling text rows (stops under "reduce motion")
    ServicesScroll.tsx     Pinned horizontal-scroll Service cards
    Clock.tsx              Live time in site.timeZone
    Nav.astro, Footer.astro
    CursorTrail.tsx        UNUSED, points at deleted clone images (safe to delete)
  config/
    site.ts                Contact details, availability status, response time, Calendly link, Intro Call href
    services.ts            The four Services (tools, summary, Sample label)
  styles/global.css        All styling (CRLF line endings, see gotchas)
public/assets/
  hero-scrub.mp4           Owner's own wide (2:1) scrub video, 6.6 MB
  hero-poster.png          1920x960 poster: instant first paint, blurred backdrop, failure fallback
CONTEXT.md                 Glossary (Service, Sample, Clip, Availability, Base, Credentials, Post, Intro Call)
CLAUDE.md                  Copy and design rules for this project
.claude/skills/portfolio-copy-review/   Skill: scans copy for unverified claims, filler, glossary breaks
```

### How the hero works
- `.hero` is a container (`container-type: size`). `--hero-zoom` (1 on desktop, 0.45 on phones) scales a 2:1 "stage".
- `.hero::before` = blurred poster backdrop. `.hero::after` = sharp poster. `.hero__canvas` = scrub canvas. All three share the same stage box, so the swap from poster to video doesn't jump.
- Phones (max-width 639px): stage pinned at `top: 12%` with a top/bottom feather so the text sits below the computer.
- The scrub runs regardless of the OS "reduce motion" setting (input-driven). The marquee does stop under that setting (original behaviour).

## Decisions made
- **Base:** Philippines (Owner was in Japan for work; the Japan note was removed). Hero eyebrow says "Currently available for hire".
- **Credentials:** 3+ years in software engineering, trained on Java in Japan, **basic Japanese only**. Never name employers or clients.
- **Availability:** a manual status in `site.ts` (`available` / `limited` / `booked`).
- **Response time and NDA:** "Replies within one business day", "NDA on request". Rates stay hidden ("on request").
- **Clip:** Remotion-made, scroll-driven, illustrates a Service. **Sample:** its own page per Service with fake data, proves it. Neither is built yet.
- **Intro Call:** 15-minute call via Calendly. While `calendlyUrl` is empty the buttons open an email with subject "Intro Call".
- **Blog:** not in the first launch; Blog links are hidden until there are 1-2 Posts.
- **Tools list:** Owner confirmed all listed tools (Google Workspace, Gmail, Calendar, Sheets, Drive, Calendly, Slack, Notion, Trello, Zapier, GoHighLevel, Java, JavaScript, Node.js, HTML & CSS, React, GitHub).
- **No AI-generated imagery.** Only the Owner's own photos and illustrations.

## Still to do
**Needs your input**
- [ ] Phone test result (above).
- [ ] Confirm "3+ years" (and the start year, if you want it derived).
- [ ] Concrete example for "Quick to pick up new tools" (it's generic right now).
- [ ] Create the Calendly account/event and paste the link into `calendlyUrl` in `src/config/site.ts`.
- [ ] Your working hours as a US time window (for the "How I work" strip).

**Build**
- [ ] Remotion Clips (one per Service), scroll-driven.
- [ ] Sample pages (`/samples/<slug>`), fake data, labelled as samples.
- [ ] Blog: Posts about life in Japan (photos of you only, no employer/project names), each ends with the Intro Call link. Then restore the Blog links in `Nav.astro` and `Footer.astro`.
- [ ] Delete the unused `CursorTrail.tsx`.
- [ ] Phone polish after the test (artwork size on phones is small because the art is wide; a taller crop of the video would help).

**Before sharing the link widely**
- [ ] Run the `portfolio-copy-review` skill, then `/impeccable critique`.
- [ ] Hero video is ~7 MB per visit; consider a smaller encode if traffic grows.

## Gotchas (learned the hard way)
- `src/styles/global.css` uses **CRLF** line endings. Scripted edits that match on `\n` silently fail and can corrupt the file. Normalize line endings first, or use the Edit tool.
- Frame capture only runs in a **visible, foreground tab**. In a background tab the loader sits at 0%. Test the scrub in a real browser tab.
- Browser automation tabs froze repeatedly on this page (heavy canvas + glass effects, plus low system memory once killed the dev server). Check visuals in your own browser.
- The early clone video and sticker files are still in Git **history** (first two commits) even though they are deleted from the tree.
- Git author for this repo is set locally to Vincent Sotoya / vincentsotoya20@gmail.com (not global).
- Dev server: `npm run dev` (http://localhost:4321/). Phone on same Wi-Fi: `npx astro dev --host`.

## Commit history (newest first)
- `503cbb2` Add PROGRESS.md with status, architecture and to-do list
- `f0f9397` Pin TypeScript to 6 for @astrojs/check (made outside Claude's session, likely to fix the Vercel build; `package.json` now has `typescript ^6.0.3`, lockfile regenerated)
- `f957b67` Use the wide 2:1 hero artwork
- `a667127` Fix duplicated hero CSS from the zoom-out change
- `d986d1f` Zoom the hero artwork out with a blurred backdrop
- `7999d56` Run the hero scrub regardless of reduced-motion setting
- `d951981` Use the Owner's own hero video and poster
- `0db17fe` Replace Japan note with availability line, add Java, remove clone assets
- `1f9f7fe` Set response time and NDA wording, email fallback for Intro Call
- `57a7502` Initial commit: VA portfolio home page
