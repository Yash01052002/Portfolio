# YG Developer Workspace 4.3.1 — GitHub quick links

Based on 4.3.0. Added accessible GitHub icon links directly on all three homepage project cards: BlackBox (`Diagnosis_System`), Suraksha (`Suraksha`), and Support Ticket System (`stunning-pancake`). These reuse the existing project-page URLs. All open in a new tab. The Support Ticket repository name should be confirmed before publication; this build does not claim it was independently verified.

The site design, animations, time-aware greeting, interactive project architecture, galleries, recruiter brief, and contact sections are unchanged. The icons use inline SVG, CSS only, no external icon dependency.

# YG Developer Workspace 4.3.0 — Recruiter-ready improvements

Based on 4.2.9. **Preserves** the scroll-controlled time-aware welcome, animated sky, ambient light, one portrait in About Me, clean homepage, light/dark modes, technical case studies, debugging challenge, and feedback.

## New features
1. **Project evidence gallery:** Existing project pages have 3-image accessible galleries. Their concepts remain visibly labeled. A new screenshot count tracks actual `.webp` files that load, and each case study has a dedicated optional recorded MP4 walkthrough player. No real screenshots or videos were supplied, so **none are claimed or bundled**. See `assets/screenshots/README.md` and `assets/videos/README.md`. The homepage links to the galleries.
2. **Interactive architecture:** Existing BlackBox six-step inspector is now a clickable system map, keyboard arrow navigable, with stage details and sample logs. This is a conceptual explainer, not a live backend.
3. **Recruiter quick view:** Improved existing dialog with target junior roles, evidence links, live BlackBox link, GitHub, LinkedIn, resume, and email. No fake employment history.
4. **Development journey:** Personal-project timeline using the provided project periods (BlackBox Feb–Jul 2025, Suraksha Aug–Dec 2025, Support Ticket Apr 2026–present). Support Ticket is labeled in progress. Dates are project periods, not work experience.
5. **Scroll navigation:** Thin page progress indicator, active section links, and a subtle desktop section rail; mobile uses the existing navigation.
6. **Contact:** Copy email with fallback, recruiter email subject, GitHub and LinkedIn. Existing feedback remains email/copy only; no hidden storage backend.

## Publish
Run `python -m http.server 8000` from this folder, then open `http://localhost:8000`. For GitHub Pages, upload the folder contents, not the outer folder. External links require internet. Check your resume for accuracy and ensure the public live demo works before sharing.

## Honest limitations
- This ZIP **does not contain real project screenshots or video recordings** because none were provided/verified. It contains a complete ready-to-populate gallery system and clearly labeled illustration placeholders.
- Technical walkthroughs, crash scenarios, and code examples are explanatory simulations.
- The BlackBox live URL is linked, but this build does not claim to verify its current uptime.
- The Support Ticket System is in progress.
- This version has not been deployed.

## Testing
Browser interaction and responsive tests are recorded in `TEST-RESULTS.json`.

## Version 4.3.2 — Updated resume

Replaced the bundled `assets/Yash_Gaidhane_Resume.pdf` with the exact user-supplied PDF `YASH_GAIDHANE_Resume(4).pdf`. All existing resume download buttons, recruiter quick view, and shortcut links still point to the bundled resume. No other portfolio content was changed.
