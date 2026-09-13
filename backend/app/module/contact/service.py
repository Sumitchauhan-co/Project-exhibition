from sqlmodel import Session, select

from app.module.contact.model import ContactMessage, ContactMessageCreate


class ContactService:
    @staticmethod
    def create_message(
        session: Session, payload: ContactMessageCreate
    ) -> ContactMessage:
        message = ContactMessage(
            full_name=payload.full_name.strip(),
            email=payload.email.strip(),
            subject=(payload.subject or "general").strip() or "general",
            message=payload.message.strip(),
        )
        session.add(message)
        session.commit()
        session.refresh(message)
        return message

    @staticmethod
    def get_messages(session: Session, limit: int = 50):
        statement = (
            select(ContactMessage)
            .order_by(ContactMessage.created_at.desc())
            .limit(limit)
        )
        return session.exec(statement).all()
