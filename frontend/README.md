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

---

## ⚡ Quickstart Guide

### 1. Clone the Repository & Navigate

```bash
git clone https://github.com/Sumitchauhan-co/Project-exhibition.git
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
