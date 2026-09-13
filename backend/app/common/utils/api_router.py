from fastapi import APIRouter

from app.module.auth.route import router as auth_router
from app.module.billing.route import router as billing_router
from app.module.contact.route import router as contact_router
from app.module.evaluation.route import router as evaluation_router

api_v1_router = APIRouter()

# Register each feature router
api_v1_router.include_router(evaluation_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(billing_router)
api_v1_router.include_router(contact_router)
