from app.module.billing.pricing import INITIAL_ONBOARDING_CREDITS
from app.module.billing.service import BillingService


def test_estimate_cost_scales_with_size_and_models():
    small_cost = BillingService.estimate_evaluation_cost(
        file_size_bytes=150_000,
        selected_strategies=["token"],
        selected_llms=["gemma4:31b-cloud"],
        selected_embeddings=["qwen3-embedding:latest"],
    )

    large_cost = BillingService.estimate_evaluation_cost(
        file_size_bytes=1_500_000,
        selected_strategies=["token"],
        selected_llms=["gpt-4o-mini"],
        selected_embeddings=["text-embedding-3-small"],
    )

    assert small_cost > 0
    assert large_cost > small_cost


def test_onboarding_credit_is_zero_by_default():
    assert INITIAL_ONBOARDING_CREDITS == 0
    assert BillingService.INITIAL_ONBOARDING_CREDITS == 0


def test_pricing_config_is_isolated():
    assert (
        "fixed"
        in __import__(
            "app.module.billing.pricing", fromlist=["STRATEGY_COST_MULTIPLIERS"]
        ).STRATEGY_COST_MULTIPLIERS
    )
