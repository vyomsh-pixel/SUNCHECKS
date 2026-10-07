# DayPulse Web 🌿

> **DayPulse is a personal wellness visualization tool for self-tracking. It is not intended to diagnose, treat, or replace professional medical advice.**

A calm, mobile-first daily check-in, mood tracker, energy visualizer, and mindful routine companion powered by **Gemini 2.5 Flash**.

Built with **React 18 + TypeScript + Vite + Tailwind CSS**. Local-first, privacy-focused, zero login required, and runs on any device.

---

## ✨ Features

- **Daily Check-in & Streak Hero**: Grounded date display and unbroken check-in counter.
- **5-Point Mood Scale**: Acknowledge your emotional state (Rough $\rightarrow$ Radiant) with thoughtful vector states.
- **1–10 Energy Battery**: Interactive visual battery and descriptor (Rest Required $\rightarrow$ Peak Flow).
- **Micro Habits**: Daily mindful acts (Morning sunlight, Hydrate well, Gentle movement, Mindful pause).
- **Daily Journal**: Auto-saving Focus Intention, Gratitude note, and Evening Reflection with debounced local persistence.
- **AI Routine Generator**: One-click personalized schedule tailored to today's mood & energy via **Gemini 2.5 Flash**.
- **Wellness Advisor**: Empathetic conversational sounding board for cognitive reframing, micro-resets, and calm grounding.
- **Trends & History**: Visual breakdowns of mood distribution and average energy over time.
- **Local-First & Private**: All data stays stored in your browser's `localStorage`. Includes one-click JSON backup export & import.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Test on your Mobile Phone
Run:
```bash
npm run dev -- --host
```
Vite will display a **Network URL** (e.g., `http://192.168.1.X:5173`). Open this URL in Chrome or Safari on your phone connected to the same Wi-Fi.

Tap **"Add to Home Screen"** on your mobile browser to install DayPulse as a full-screen, standalone app!

---

## 🤖 Gemini API Setup
In the DayPulse web app, click the **Settings ⚙️** icon in the top header and enter your free Google Gemini API Key. Your key is stored strictly on your device in `localStorage` and sent directly to Google's official Gemini 2.5 Flash API endpoint.
