# RAG Matrix Evaluator Benchmark 🚀

A full-stack performance benchmarking tool designed to evaluate and compare Retrieval-Augmented Generation (RAG) pipelines across multiple chunking strategies, embedding models, and LLM providers.

Built to quantify vector search retrieval quality, answer faithfulness, and system latency using automated **RAGAS** metric evaluations.

---

## 📌 Features

- **Multi-Dimensional Matrix Testing:** Benchmark combinations of chunking algorithms, embedding models, vector stores, and LLM evaluators.
- **Automated RAGAS Evaluation:** Evaluates retrieval precision, context recall, faithfulness, and answer relevancy.
- **Visual Analytics Dashboard:** Interactive data visualizations (charts, metric cards, and detailed comparison matrices).
- **Performance Metrics Tracking:** Measures real-time latency (`latency_ms`) across execution runs.
- **Flexible Architecture:** Modular API supporting multiple LLM backends (Ollama, Cloud APIs, OpenAI, Google Gemini).

---

## 🛠️ Tech Stack

### Frontend

- **Framework:** React + TypeScript + Vite
- **Styling:** Tailwind CSS + Lucide Icons
- **Routing & State:** React Router v6 + Axios
- **UI Components:** Custom Matrix Tables, Performance Charts, Metric Cards

### Backend & Evaluation

- **Framework:** Python (FastAPI / Flask)
- **Evaluation Framework:** RAGAS (Retrieval-Augmented Generation Assessment System)
- **Vector Store & Indexing:** Vector DB integration with dynamic chunking pipelines

---

## 📊 Benchmarked Metrics

| Metric                | Description                                                                            |
| :-------------------- | :------------------------------------------------------------------------------------- |
| **Context Recall**    | Measures whether all relevant information required to answer the prompt was retrieved. |
| **Context Precision** | Measures the proportion of relevant chunks in the retrieved context.                   |
| **Faithfulness**      | Evaluates whether the generated answer is strictly grounded in the retrieved context.  |
| **Answer Relevancy**  | Assesses how directly the generated answer addresses the input prompt.                 |
| **Latency (ms)**      | Total execution time required for indexing, retrieval, and generation.                 |

---

## 🏗️ Getting Started

### Prerequisites

- Node.js (`v18+` recommended)
- Python (`v3.10+` recommended)
- Running LLM/Embedding endpoints (e.g., Ollama or API keys configured)

---

### 1. Backend Setup

```bash
# Clone the repository
git clone https://github.com/Sumitchauhan-co/Project-exhibition.git
cd Project-exhibition/backend

# Create a virtual environment and install dependencies in one step
uv venv
uv pip install -r requirements.txt

# Start the API server using the virtual environment's python
uv run main.py
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

---

## 📈 Benchmark Data Structure

The system consumes pipeline evaluation results structured in the following JSON format:

```json
{
	"config_id": "config_01",
	"chunking_strategy": "token",
	"embedding_model": "qwen3-embedding:latest",
	"llm_model": "gemma4:31b-cloud",
	"vector_db": "ChromaDB",
	"latency_ms": 1959.58,
	"metrics": {
		"faithfulness": 1.0,
		"answer_relevancy": 0.85,
		"context_precision": 0.444,
		"context_recall": 0.667
	}
}
```

---

## 🖥️ UI Dashboard Components

- **Metric Cards:** Highlights overall evaluated configs, average latency, top performer, and peak recall.
- **Benchmark Charts:** Visual comparison of metric trends across strategies.
- **Matrix Table:** Full tabular view detailing chunker, embedding, LLM, latency, and composite scores.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---
