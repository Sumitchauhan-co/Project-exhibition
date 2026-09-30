import json
import logging

import firebase_admin
from firebase_admin import credentials, messaging

from app.common.utils.config import FIREBASE_SERVICE_ACCOUNT

logger = logging.getLogger(__name__)


def initialize_firebase() -> None:
    """
    Initialize Firebase Admin SDK once per application process.
    """

    if firebase_admin._apps:
        return

    if not FIREBASE_SERVICE_ACCOUNT:
        raise RuntimeError("FIREBASE_SERVICE_ACCOUNT is not configured")

    try:
        service_account = json.loads(FIREBASE_SERVICE_ACCOUNT)

        credential = credentials.Certificate(service_account)

        firebase_admin.initialize_app(credential)

        logger.info("notification.firebase_initialized")

    except json.JSONDecodeError as exc:
        logger.exception("notification.firebase_invalid_credentials")
        raise RuntimeError("FIREBASE_SERVICE_ACCOUNT contains invalid JSON") from exc

    except Exception:
        logger.exception("notification.firebase_initialization_failed")
        raise


def send_push_notification(
    *,
    token: str,
    title: str,
    message: str,
    notification_type: str,
) -> str:
    """
    Send a push notification through Firebase Cloud Messaging.

    Raises:
        firebase_admin.exceptions.FirebaseError:
            When Firebase rejects the message.
    """

    initialize_firebase()

    firebase_message = messaging.Message(
        token=token,
        notification=messaging.Notification(
            title=title,
            body=message,
        ),
        data={
            "title": title,
            "body": message,
            "type": notification_type,
        },
    )

    try:
        message_id = messaging.send(firebase_message)

        logger.info(
            "notification.push_sent token=%s message_id=%s",
            token[:12],
            message_id,
        )

        return message_id

    except Exception:
        logger.exception(
            "notification.push_failed token=%s",
            token[:12],
        )
        raise
