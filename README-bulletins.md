Regenerating `bulletins.html`

This repository includes a small Node script to automatically generate `bulletins.html` from the files in the `Bulletins/` folder.

Prerequisites
- Node.js (>=12)

Usage
- From the project root run (PowerShell):

```powershell
npm run generate:bulletins
```

- Or run directly:

```powershell
node scripts\generate-bulletins.js
```

What it does
- Scans `Bulletins/` for PDF files
- Parses a month/year from filenames when possible (e.g. "January 2026")
- Sorts bulletins newest-first and writes `bulletins.html` (overwriting the existing file)

Notes
- Filenames with spaces or special characters are URL-encoded in links.
- If you prefer, I can add a platform-agnostic Python script instead, or add a GitHub Action to regenerate automatically when PDFs are added to the repo.
  
Automatic regeneration via GitHub Actions
- A GitHub Action workflow has been added at `.github/workflows/generate-bulletins.yml`.
- The workflow runs on changes to files under `Bulletins/` or when manually triggered, runs the Node generator, and commits `bulletins.html` back to the repository if it changed.

If you'd like I can also add a small PowerShell helper or a Python alternative if you don't want to use Node locally.