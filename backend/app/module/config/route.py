from fastapi import APIRouter, status
from app.module.config.model import SystemOptionsConfig
from app.module.config.service import ConfigService

router = APIRouter(prefix="/config", tags=["Configuration"])


@router.get(
    "/options",
    response_model=SystemOptionsConfig,
    status_code=status.HTTP_200_OK,
    summary="Get System Configuration Options",
    description="Fetches available strategies, LLMs, and embeddings for matrix evaluation config.",
)
async def get_config_options() -> SystemOptionsConfig:
    return await ConfigService.get_system_options()
