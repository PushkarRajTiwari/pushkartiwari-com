# pushkartiwari.com

Personal site of Pushkar Raj Tiwari, senior .NET engineer.

Plain HTML, CSS and JavaScript with no build step. Every file in this folder is served as-is.

## Layout

- `index.html`: homepage, with the interactive terminal, the before/after slider and the RAG diagram
- `work.html`, `work/*.html`: case studies
- `experience.html`, `about.html`, `contact.html`
- `assets/aurora.css`, `assets/aurora.js`: shared styles and behaviour (scroll reveals, Ctrl+K menu)
- `assets/home.css`, `assets/home.js`: homepage-only components
- `assets/pages.css`: inner-page styles
- `Pushkar_Tiwari_Resume.pdf`: public resume (no phone number)

## Run locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy

Hosted on Vercel from the `main` branch. Framework preset: Other. No build command; output directory is the repository root.
