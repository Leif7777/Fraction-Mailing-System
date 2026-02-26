# Fraction Smart Inbox

An AI-powered email inbox built for the Fraction sales team. Sorts, labels, drafts, and briefs — all in one place.

## Features

- **AI Inbox Analysis** — Claude reads every email and assigns Urgent / Needs Reply / FYI / Ignore labels, sorted by priority
- **Daily Brief** — A sharp, opinionated morning digest: priority calls, hidden connections, quick wins, and a closing line
- **AI Draft Replies** — One-click personalized reply drafts written as Leif, Sales Associate at Fraction
- **Editable Tags** — Click any label pill to change it or create a custom tag with a color picker
- **Gmail-style Compose** — Full compose window with rich text (Tiptap), AI Assist, file attachments, Cc/Bcc, emoji picker, and send/undo

## Setup

### 1. Clone and install
```bash
git clone https://github.com/Leif7777/Fraction-Mailing-System.git
cd Fraction-Mailing-System
npm install
```

### 2. Add your API key
```bash
cp .env.local.example .env.local
```
Open `.env.local` and replace `your_key_here` with your Anthropic API key (get one at console.anthropic.com).

```
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import this repo
3. Before deploying, add the environment variable:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your `sk-ant-...` key
4. Click Deploy

Every push to `main` auto-deploys. Check the Deployments tab in Vercel for build status.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router)
- [Tailwind CSS](https://tailwindcss.com)
- [Tiptap](https://tiptap.dev) (rich text editor)
- [Anthropic Claude](https://anthropic.com) (`claude-sonnet-4-6` via `/api/claude`)
