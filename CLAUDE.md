# VA Portfolio

Read `CONTEXT.md` first. Use its terms exactly (Service, Sample, Clip, Availability, Base, Credentials, Post, Intro Call).

## Copy rules
- Every claim must be something the Owner has confirmed. Do not invent credentials, tools, years, results or testimonials. If unsure, leave a `TODO` and ask.
- Japanese is **basic** only. Never imply fluency.
- Never name the Owner's employers, their clients or projects.
- Services list only tools the Owner has actually used (see `src/config/services.ts`).
- Plain, specific wording. Avoid filler like "streamline", "leverage", "seamless", "busy executives", "take your business to the next level", "passionate".
- Samples use fake data and are labelled as samples.

## Design rules
- Use the existing tokens and classes in `src/styles/global.css`; don't add new colors or fonts without asking.
- The hero video and poster (`public/assets/hero-*`) are the Owner's own. The old clone stickers are gone (the unused `CursorTrail` component still points at them); do not reintroduce clone assets. No AI-generated imagery: only the Owner's own photos and illustrations.
- Check changes at desktop and phone width before calling them done.

## Facts live in one place
Contact details, Availability and the Japan note are in `src/config/site.ts`. Do not add the phone number anywhere.
