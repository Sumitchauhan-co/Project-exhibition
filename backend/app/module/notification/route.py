from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.common.db.database import get_session
from app.module.auth.model import User
from app.module.auth.route import get_current_user

from app.module.notification.model import (
    DeviceRegister,
    NotificationDeviceRead,
    NotificationRead,
)

from app.module.notification.service import (
    NotificationService,
)

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


@router.get(
    "",
    response_model=list[NotificationRead],
)
def get_notifications(
    unread_only: bool = False,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return NotificationService.get_user_notifications(
        session=session,
        user_id=current_user.id,
        unread_only=unread_only,
    )


@router.patch(
    "/{notification_id}/read",
    response_model=NotificationRead,
)
def mark_notification_as_read(
    notification_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    notification = NotificationService.mark_as_read(
        session=session,
        user_id=current_user.id,
        notification_id=notification_id,
    )

    if notification is None:
        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    return notification


@router.patch(
    "/read-all",
)
def mark_all_notifications_as_read(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    count = NotificationService.mark_all_as_read(
        session=session,
        user_id=current_user.id,
    )

    return {
        "message": "All notifications marked as read",
        "count": count,
    }


@router.post(
    "/devices",
    response_model=NotificationDeviceRead,
)
def register_device(
    data: DeviceRegister,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return NotificationService.register_device(
        session=session,
        user_id=current_user.id,
        data=data,
    )
