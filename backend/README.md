# 🚀 RAG Benchmarking Engine — Backend API

An empirical testing and evaluation engine built with **FastAPI**, **LangChain**, and **RAGAS** to evaluate 18 pre-retrieval RAG pipeline configurations ($3\text{ Chunkers} \times 3\text{ Embeddings} \times 2\text{ Vector DBs}$).

---

## 🛠️ Prerequisites

This project utilizes [uv](https://github.com/astral-sh/uv) by Astral for extremely fast, reliable Python environment and dependency management.

Ensure `uv` is installed on your system:

```bash
# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

## ⚡ Quickstart Guide

Follow these steps to set up the environment and launch the FastAPI server.

### 1. Clone the Repository & Navigate

```bash
git clone https://github.com/Sumitchauhan-co/Project-exhibition.git
cd rag-benchmark-backend
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Ensure your `.env` file contains your necessary keys (e.g., `OPENAI_API_KEY` for RAGAS evaluations if using OpenAI as the judge model):

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Sync Dependencies

Sync the project dependencies to automatically generate the `.venv` virtual environment and install all locked packages:

```bash
uv sync
```

### 4. Run the Backend API

Start the Uvicorn development server on port 8000:

```bash
uv run uvicorn app.main:app --reload --port 8000
```

---

## 📍 API Documentation & Endpoints

Once the server is running, you can access the interactive API docs directly in your browser:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Core Endpoints

| Method  | Endpoint               | Description                                                               |
| :------ | :--------------------- | :------------------------------------------------------------------------ |
| **GET** | `/health`              | Health check endpoint.                                                    |
| **GET** | `/api/v1/evaluate-pdf` | Serves pre-computed RAGAS benchmark metrics across all 18 configurations. |

---
