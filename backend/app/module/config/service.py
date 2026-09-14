from app.module.config.model import SystemOptionsConfig, OptionItem
from app.common.utils.config import (
    APP_ENV,
    DEV_LLM_MODEL_1,
    DEV_LLM_MODEL_2,
    DEV_EMBED_MODEL_1,
    DEV_EMBED_MODEL_2,
    PROD_LLM_MODEL_1,
    PROD_LLM_MODEL_2,
    PROD_EMBED_MODEL_1,
    PROD_EMBED_MODEL_2,
)


class ConfigService:

    @staticmethod
    async def get_system_options() -> SystemOptionsConfig:
        """
        Retrieves chunking strategies, LLMs, and embedding models dynamically
        based on the active application environment (dev vs prod).
        """
        # 1. Static Strategies
        strategies = [
            OptionItem(
                id="fixed-size",
                label="Fixed Size Chunking",
                description="Splits documents into uniform token sizes with specified overlap.",
            ),
            OptionItem(
                id="recursive",
                label="Recursive Character",
                description="Splits recursively by separators (paragraphs, sentences) to preserve context.",
            ),
            OptionItem(
                id="semantic",
                label="Semantic Chunking",
                description="Splits text based on semantic distance using embeddings.",
            ),
            OptionItem(
                id="token",
                label="Token Based Chunking",
                description="Splits text directly based on raw token count and boundaries.",
            ),
        ]

        # 2. Select Models based on Environment
        if APP_ENV == "prod":
            llm_items = [
                (PROD_LLM_MODEL_1, "Production LLM Model 1"),
                (PROD_LLM_MODEL_2, "Production LLM Model 2"),
            ]
            embed_items = [
                (PROD_EMBED_MODEL_1, "Production Embedding Model 1"),
                (PROD_EMBED_MODEL_2, "Production Embedding Model 2"),
            ]
        else:
            llm_items = [
                (DEV_LLM_MODEL_1, "Local Ollama LLM Model 1"),
                (DEV_LLM_MODEL_2, "Local Ollama LLM Model 2"),
            ]
            embed_items = [
                (DEV_EMBED_MODEL_1, "Local Ollama Embedding Model 1"),
                (DEV_EMBED_MODEL_2, "Local Ollama Embedding Model 2"),
            ]

        # 3. Filter out empty env entries dynamically
        llms = [
            OptionItem(
                id=model_id,
                label=model_id,
                description=desc,
            )
            for model_id, desc in llm_items
            if model_id and model_id.strip()
        ]

        embeddings = [
            OptionItem(
                id=embed_id,
                label=embed_id,
                description=desc,
            )
            for embed_id, desc in embed_items
            if embed_id and embed_id.strip()
        ]

        return SystemOptionsConfig(
            strategies=strategies,
            llms=llms,
            embeddings=embeddings,
        )
