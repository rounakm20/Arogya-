# 🩺 Arogya — Health Dashboard

Full desktop web app built with React + Vite + Tailwind CSS.

## Quick Start

```bash
npm install
npm run dev
```

Open → http://localhost:5173

## Modules (auto-installed via npm install)

| Package | Version | Role |
|---|---|---|
| react | ^18.3.1 | UI framework |
| react-dom | ^18.3.1 | DOM renderer |
| vite | ^6.0.5 | Dev server & bundler |
| @vitejs/plugin-react | ^4.3.4 | JSX transform |
| tailwindcss | ^3.4.17 | Utility CSS |
| postcss | ^8.4.49 | CSS processing |
| autoprefixer | ^10.4.20 | Vendor prefixes |

## Pages

- **Dashboard** — Welcome banner, stats, quick access grid, recent activity
- **Symptom Checker** — Select symptoms, AI triage with urgency levels
- **Medications** — Add/mark meds, progress tracker
- **Mood Tracker** — Weekly chart, log entry, wellness tips
- **Health Reports** — Table view, scan simulation, upload form
- **QR Passport** — Digital health card with user's login name, share & scan
- **Blood Donors** — Search/filter donor registry, urgent request modal
- **Profile** — Full medical info, vaccinations, insurance

## Notes

- Login name flows into QR Passport — enter your real name at login
- Demo: any email + password works, name is required
- Fonts: Plus Jakarta Sans + JetBrains Mono (Google Fonts)
- No external UI library — fully custom components
