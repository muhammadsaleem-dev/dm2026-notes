# DM 2026 Notes

Condensed, chapter-by-chapter reference notes for *Basic Data Mining Practice* — built from the course's 7 lecture decks (~450 slides total). Plain static HTML, no build step, ready for GitHub Pages.

## Structure

```
index.html                     landing page (chapter grid)
chapter-1-intro.html
chapter-2-pipeline.html
chapter-3-classification.html
chapter-4-clustering.html
chapter-5-regression-nn.html
chapter-6-llm-rag.html
chapter-7-explainability.html
assets/style.css                shared design system used by every page
```

Every chapter page is self-contained HTML + one shared stylesheet — open `index.html` directly in a browser locally, no server needed.

## Publish to GitHub Pages

From inside this folder:

```bash
git remote add origin <your-repo-url>       # e.g. git@github.com:you/dm2026-notes.git
git branch -M main
git push -u origin main
```

Then on GitHub:

1. Go to your repo → **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Branch: **main**, folder: **/ (root)**. Save.
4. GitHub gives you a URL like `https://<you>.github.io/<repo>/` within a minute or two.

That's it — no Actions workflow needed, since everything here is already plain static HTML.

## Updating a chapter

Each page repeats the same nav bar and links to `assets/style.css`, so editing content only ever touches the one chapter file. If you want a new visual style, edit `assets/style.css` once and every page picks it up.

## Notes on accuracy

These pages were distilled from photographed/exported lecture slides, then condensed for density — treat them as a *study aid*, not a verbatim transcript. A couple of formulas were corrected against the standard definition where a slide likely had a typo (e.g. z-score normalization uses `σ`, not `σ²`) — worth double-checking against the original deck before relying on them in an exam answer.
