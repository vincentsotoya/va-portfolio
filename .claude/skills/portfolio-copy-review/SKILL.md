---
name: portfolio-copy-review
description: Review the portfolio's page copy for unverifiable claims, generic AI-sounding filler, and glossary violations. Use before launch or after editing copy in src/pages, src/components or src/config.
---

# Portfolio copy review

1. Read `CONTEXT.md` and `CLAUDE.md`.
2. Collect all visible copy from `src/pages/**`, `src/components/**` and `src/config/**`.
3. Flag each of these, with file and line:
   - **Unverified claims**: credentials, years, tools, results or testimonials not confirmed by the Owner.
   - **Glossary breaks**: "case study", "testimonial", "consultation", "interview", "article", "project" used where the glossary says to avoid them.
   - **Fluency or employer claims**: anything beyond basic Japanese, or naming an employer, client or project.
   - **Filler**: "streamline", "leverage", "seamless", "passionate", "busy executives", "next level", or vague sentences that fit any VA.
   - **Placeholders still live**: empty `calendlyUrl`, empty `responseTime`, clone video or trail stickers.
4. Report as a list. For each flagged line, suggest a plainer replacement or ask the Owner for the missing fact. Do not edit copy without the Owner's approval.
