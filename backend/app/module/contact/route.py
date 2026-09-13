from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.common.db.database import get_session
from app.module.contact.model import ContactMessageCreate, ContactMessageRead
from app.module.contact.service import ContactService

router = APIRouter(prefix="/contact", tags=["Contact Us"])


@router.post(
    "/submit", response_model=ContactMessageRead, status_code=status.HTTP_201_CREATED
)
def submit_contact_message(
    payload: ContactMessageCreate,
    session: Session = Depends(get_session),
):
    if not payload.full_name.strip():
        raise HTTPException(status_code=400, detail="Full name is required.")
    if not payload.email.strip():
        raise HTTPException(status_code=400, detail="Email is required.")
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message is required.")

    return ContactService.create_message(session, payload)


@router.get("/messages", response_model=list[ContactMessageRead])
def list_contact_messages(
    limit: int = 50,
    session: Session = Depends(get_session),
):
    return ContactService.get_messages(session, limit=limit)
