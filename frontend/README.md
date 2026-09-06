# 📊 RAG Benchmarking Engine — Frontend Dashboard

A production-grade, interactive analytics dashboard built with **Vite**, **React**, **TypeScript**, and **Tailwind CSS v4** to visualize pre-retrieval RAG evaluation metrics across an 18-configuration matrix ($3 \text{ Chunkers} \times 3 \text{ Embeddings} \times 2 \text{ Vector DBs}$).

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite 6
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + `@tailwindcss/vite`
- **Data Visualization**: Chart.js + `react-chartjs-2`
- **HTTP Client**: Axios (configured with Vite proxy to FastAPI)
- **Icons**: Lucide React
- **Progress Bar**: NProgress

---

## ⚡ Quickstart Guide

### 1. Clone the Repository & Navigate

```bash
git clone https://github.com/Sumitchauhan-co/Project-exhibition
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The application will launch locally at: `http://localhost:5173`

---

## 🔌 API Proxy Configuration

The Vite dev server automatically proxies `/api/*` endpoint requests to the FastAPI backend running on `http://127.0.0.1:8000`.

If your backend port or host changes, update `vite.config.ts`:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		port: 3000,
		proxy: {
			'/api': {
				target: 'http://127.0.0.1:8000',
				changeOrigin: true,
				secure: false,
			},
		},
	},
});
```

---

## 📦 Building for Production

To create an optimized production build of static HTML, CSS, and JS assets:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 📁 Repository Architecture

```plaintext
frontend/
├── src/
│   ├── components/
│   │   └── Skeleton.tsx       # Skeleton loaders for chart & cards
│   ├── types/
│   │   └── benchmark.ts       # TypeScript interfaces for API payloads
│   ├── App.tsx                # Main Dashboard & Chart.js integration
│   ├── index.css              # Tailwind v4 import & NProgress styles
│   └── main.tsx               # React DOM mounting entry point
├── public/                    # Static assets
├── vite.config.ts             # Vite + Tailwind v4 + API Proxy setup
├── tsconfig.json              # TypeScript compiler settings
└── package.json
```
