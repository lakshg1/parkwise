# 🅿️ ParkWise — Smart Parking Management Platform

> A full-stack, AI-assisted smart-parking platform for managing multiple lots, real-time availability, dynamic pricing, and bookings — with an admin console that generates AI-driven occupancy & revenue insights.

<p align="left">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" />
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwindcss&logoColor=white" />
  <img alt="Genkit" src="https://img.shields.io/badge/AI-Google%20Genkit-4285F4?logo=google&logoColor=white" />
</p>

**🔗 Live demo:** _add your Vercel URL here_ · **📽️ Demo video:** _optional_

<!-- Replace with a real screenshot or GIF of the user + admin dashboards -->
<!-- ![ParkWise dashboard](docs/screenshot-dashboard.png) -->

---

## Overview

ParkWise helps parking operators run multiple lots from a single dashboard while giving drivers a fast way to find and book a spot. It models real operational problems — mixed vehicle types, peak/off-peak pricing, maintenance downtime, and space utilization — and layers an LLM on top to turn raw occupancy data into plain-language reports and recommendations.

It's built as a modern **Next.js (App Router)** application with a type-safe, component-driven UI and server-side **Genkit** AI flows.

## ✨ Features

**For drivers**
- **Real-time availability** across multiple lots for both car and bike spots.
- **Smart slot allocation** — bikes can occupy free car slots to maximize utilization.
- **Booking flow** — reserve a spot for a chosen duration, view booking history, and cancel.
- **Automatic pricing** — the price for any booking is computed from the lot's active pricing rules.

**For admins**
- **Lot management** — add/configure lots and toggle individual slots for maintenance.
- **Dynamic pricing rules** — set peak and off-peak rates per vehicle type, per lot.
- **AI-powered reports** — generate occupancy & revenue reports for any date range, complete with **AI-generated analysis and improvement suggestions** (Google Genkit).

## 🧠 How the AI works

The reporting feature runs a **Genkit flow** (`src/ai/`) backed by Google's Gemini models via `@genkit-ai/googleai`:

1. Occupancy and revenue data for the selected range is aggregated.
2. The flow prompts the model with that data plus a structured instruction.
3. The model returns a narrative summary and concrete suggestions (e.g. pricing or capacity changes), which are rendered in the admin dashboard.

Genkit flows run server-side, so no API keys are exposed to the client.

## 🚀 Tech Stack

| Layer | Choices |
|---|---|
| Framework | Next.js 15 (App Router), React 18, TypeScript 5 |
| Styling / UI | Tailwind CSS, ShadCN UI (Radix primitives), Lucide icons |
| Forms & validation | React Hook Form, Zod |
| Charts | Recharts |
| AI | Google Genkit (`genkit`, `@genkit-ai/googleai`, `@genkit-ai/next`) |
| Tooling | Turbopack (dev), ESLint, `tsc` |

## 🏁 Getting Started

**Prerequisites:** Node.js 20+ and a Google AI (Gemini) API key.

```bash
# 1. Clone
git clone https://github.com/lakshg1/parkwise.git
cd parkwise

# 2. Install
npm install

# 3. Configure environment
cp .env.example .env.local
# then add your key:
#   GEMINI_API_KEY=your_key_here

# 4. Run the app (http://localhost:9002)
npm run dev

# 5. (Optional) run the Genkit dev server for AI flows
npm run genkit:dev
```

### Demo accounts
The app ships with seed data. From the `/login` page:
- **User:** "Login as John Doe" or "Login as Jane Smith" — find spots, book, and view history.
- **Admin:** "Login as Admin" — manage lots, pricing, and generate AI reports.

## 📁 Project Structure

```
src/
├── app/        # Next.js App Router routes (user + admin)
├── components/ # ShadCN UI + feature components
├── ai/         # Genkit flows (report generation)
├── lib/        # types, pricing logic, seed data, helpers
└── hooks/      # shared React hooks
```

## 🗺️ Roadmap

- [ ] Persist lots, bookings, and users to a database (Firebase / Postgres) — currently seeded in-app
- [ ] Real authentication (replace demo logins)
- [ ] Payments integration for paid bookings
- [ ] Unit/integration tests for pricing and booking logic
- [ ] Deploy to Vercel + add live screenshots

## 📸 Screenshots

_Add screenshots or a short GIF of the driver booking flow and the admin reports view here._

## 📝 License

MIT — see [`LICENSE`](LICENSE).

---

Built by [Laksh Gupta](https://github.com/lakshg1).
