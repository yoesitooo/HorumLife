# HorumLife

**A gamified "life OS" PWA: track finances, gym, study and habits in one place, level up like an RPG, and get advice from an AI mentor.**

![React](https://img.shields.io/badge/React_19-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-PWA-646CFF?logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth_·_Firestore-FFCA28?logo=firebase&logoColor=black)

**🔗 Live demo: [horum-life.vercel.app](https://horum-life.vercel.app)** (Google Sign-In)

> 🇪🇸 App de gestión personal gamificada: finanzas, gimnasio, estudio y hábitos con progresión tipo RPG y un mentor con IA (Gemini).

## Features

| Module | What it does |
|---|---|
| 💰 **Finances** | Income/expense transactions and budget rings per category |
| 🏋️ **Gym** | Workout logging with an exercise catalogue |
| 📚 **Education** | Study sessions and learning goals |
| ✅ **Habits** | Daily habits with streaks |
| 🎮 **RPG layer** | Every module feeds XP and stats; rewards can be redeemed in a reward store |
| 🤖 **AI Mentor** | Chat with a Gemini-powered mentor that answers in the context of your progress |
| 🔐 **Auth & sync** | Google Sign-In; data stored locally and synced per user to Firestore |

## Architecture

```
src/
├── models/            # Domain types (core, gym, education)
├── kernel/services/   # Business logic, one service per module
│   ├── FinanceService.ts · GymService.ts · EducationService.ts · LifeOSService.ts
│   ├── StorageService.ts      # local persistence
│   ├── FirebaseService.ts     # Google Auth + Firestore sync
│   └── NotificationService.ts
└── views/             # React pages and components (presentation only)
```

Views never talk to Firebase directly: they go through the services in `kernel/`, so storage and UI stay decoupled.

### Security

Firestore is locked down by [`firestore.rules`](./firestore.rules): **deny by default**, and each user can only read/write documents under `users/{their uid}`.

## Run locally

```bash
npm install
cp .env.example .env   # fill in your Firebase web config and AI key
npm run dev
```

Environment variables (`VITE_FIREBASE_*` for the Firebase web app, `VITE_AI_TOKEN` for Gemini).

## Known limitations / next steps

- The Gemini call is currently made from the browser, so the AI key is visible in the client bundle. Next step: move it behind a server-side proxy (e.g. a Firebase Cloud Function) and restrict the key.
- No automated tests yet — service-layer unit tests with Vitest are the next milestone.

## Author

**Jhoe Miranda** — [GitHub](https://github.com/yoesitooo) · [LinkedIn](https://www.linkedin.com/in/jhoe-miranda)
