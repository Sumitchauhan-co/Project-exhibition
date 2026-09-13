"""Centralized pricing and cost multipliers for billing.

Tune these values to control onboarding grants and evaluation profitability
without touching the business logic in the billing service.
"""

INITIAL_ONBOARDING_CREDITS = 0

# Default baseline for evaluation cost estimation.
BASE_FILE_SIZE_BYTES = 250_000
BASE_EVALUATION_COST = 4

# Cost multipliers applied to the selected evaluation strategy, LLMs, and embeddings.
STRATEGY_COST_MULTIPLIERS = {
    "fixed": 1.0,
    "recursive": 1.2,
    "token": 1.5,
    "semantic": 1.8,
}

LLM_COST_MULTIPLIERS = {
    "gemma4:31b-cloud": 1.0,  # Baseline local/cloud model
    "gpt-4o-mini": 1.5,  # Cheap OpenAI tier (~$0.15/1M input)
    "gpt-4o": 25.0,  # High-capacity tier (~$2.50/1M input - ~16.6x vs mini)
}

EMBEDDING_COST_MULTIPLIERS = {
    "qwen3-embedding:latest": 1.0,  # Baseline local model
    "text-embedding-3-small": 1.2,  # $0.02/1M tokens
    "text-embedding-3-large": 6.0,  # $0.13/1M tokens (~6.5x vs small)
}


PROFIT_MARGIN_MULTIPLIER = 2.5
