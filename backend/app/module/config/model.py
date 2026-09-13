from pydantic import BaseModel, Field
from typing import List


class OptionItem(BaseModel):
    id: str = Field(
        ..., description="Unique identifier for the option", example="semantic"
    )
    label: str = Field(
        ..., description="Human-readable title", example="Semantic Chunking"
    )
    description: str = Field(
        ...,
        description="Brief summary of how it works",
        example="Splits text based on semantic transitions",
    )


class SystemOptionsConfig(BaseModel):
    strategies: List[OptionItem] = Field(
        ..., description="Available chunking strategies"
    )
    llms: List[OptionItem] = Field(
        ..., description="Available LLM models for evaluation"
    )
    embeddings: List[OptionItem] = Field(
        ..., description="Available embedding models for indexing"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "strategies": [
                    {
                        "id": "fixed-size",
                        "label": "Fixed Size",
                        "description": "Splits text by fixed token count.",
                    }
                ],
                "llms": [
                    {
                        "id": "gpt-4o",
                        "label": "GPT-4o",
                        "description": "OpenAI flagship model.",
                    }
                ],
                "embeddings": [
                    {
                        "id": "text-embedding-3-small",
                        "label": "Text Embedding 3 Small",
                        "description": "OpenAI compact embedding model.",
                    }
                ],
            }
        }
