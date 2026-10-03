<div align="center">

<img src="./public/syncboard.svg" width="72" alt="SyncBoard Logo" />

# SyncBoard - Frontend Client
Real-time. Anonymous. Collaborative.

<p align="center">
    <b><a href="../syncboard-backend/README.md">🔗 View Backend Documentation</a></b>
</p>

<p align="center">
![Status](https://img.shields.io/badge/Status-Active-success)
![Version](https://img.shields.io/badge/Version-v1.0.0-blue)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-8-purple)
![Konva](https://img.shields.io/badge/Konva-Canvas-orange)
</p>
</div>

## 🌟 Overview

This is the **Frontend Client** for **SyncBoard**, a real-time, anonymous digital whiteboard. The frontend is engineered to provide a frictionless, zero-lag experience for drawing, brainstorming, and collaborating without requiring user logins.

It leverages an offline-first architecture using Conflict-free Replicated Data Types (CRDTs) to ensure that even if connectivity drops, you never lose your work.

---

## 🚀 How It Works

1. **Canvas Engine**: The board uses `react-konva` which is a React wrapper around the HTML5 Canvas API. This allows rendering thousands of shapes at 60 FPS, outperforming standard SVG-based whiteboards.
2. **Local State & Syncing**: Everything drawn on the canvas is instantly reflected on the local screen via `Zustand` (for rapid state updates).
3. **CRDTs (Yjs)**: The core document state is managed by `Yjs`. When a shape is added or moved, Yjs updates the local document and broadcasts the delta to the server via WebSockets.
4. **Offline Resilience**: `y-indexeddb` ensures that the Yjs document is saved locally in the browser. If the user disconnects, they can continue working, and changes will sync automatically upon reconnection.
5. **Multiplayer Awareness**: WebSockets handle awareness data (cursor positions, user colors) separately from the document data to keep the drawing experience buttery smooth.

---

## 🛠️ Technologies Used

*   **Core**: React 19, Vite, TypeScript
*   **Canvas Rendering**: Konva & react-konva
*   **State Management**: Zustand
*   **Real-time Collaboration**: Yjs (CRDT), y-socket.io, Socket.io-client
*   **Local Storage**: y-indexeddb
*   **Styling & UI**: Tailwind CSS (v4), Radix UI primitives, Framer Motion (animations), class-variance-authority, Tailwind Merge
*   **Icons**: Lucide React

---

## 📁 Project Structure

```text
syncboard-frontend/
├── public/                 # Static assets (icons, images)
├── src/                    # Source code
│   ├── components/         # React components
│   │   ├── board/          # Canvas engine, tools, toolbar
│   │   ├── layout/         # Navigation and wrappers
│   │   └── ui/             # Reusable atomic components
│   ├── lib/                # Utility functions, helpers
│   ├── pages/              # Route components (Home, Board)
│   ├── services/           # Socket.io connection logic
│   ├── stores/             # Zustand state stores
│   ├── types/              # TypeScript definitions
│   ├── App.tsx             # Main routing
│   └── main.tsx            # Entry point
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite bundler configuration
└── tailwind.config.js      # (Included via Vite plugin)
```

---

## ✨ Key Features

*   **Zero-Lag Drawing**: Immediate local updates combined with background CRDT syncing.
*   **Multiplayer Cursors**: Live tracking of collaborators' cursors in real-time.
*   **Infinite Canvas**: Pan and zoom across a boundless workspace.
*   **Rich Tools**: Pen, Rectangle, Circle, Arrow, Text, and Sticky Notes.
*   **Theming**: Dynamic Dark and Light modes using modern Glassmorphism.
*   **Export**: Save boards locally as high-resolution PNGs or JSON data.
*   **Responsive**: Adaptive toolbar and sidebar interfaces for different screen sizes.

---

## 🚀 Getting Started Locally

### Prerequisites
*   Node.js (v18+)
*   Running instance of the SyncBoard Backend (see Backend README)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in the root if you need to point to a local backend (Vite uses `VITE_` prefix):
   ```env
   VITE_API_URL=http://localhost:3001
   ```
   *(By default, the frontend usually proxies or connects to `http://localhost:3001` in development)*

3. **Run the Development Server**:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

---

## 🌐 Deployment

SyncBoard Frontend can be deployed as a static site on platforms like Vercel, Netlify, or Render.

1. Build the production bundle:
   ```bash
   npm run build
   ```
2. The compiled assets will be in the `dist/` directory.
3. Configure your hosting provider to redirect all 404 traffic to `index.html` to support React Router.

---
Made with ❤️ for creative teams.
