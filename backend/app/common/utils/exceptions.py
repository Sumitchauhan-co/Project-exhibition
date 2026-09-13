from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class AppErrorCode:
    INVALID_FILE_TYPE = "INVALID_FILE_TYPE"
    EMPTY_FILE = "EMPTY_FILE"
    INVALID_STRATEGY = "INVALID_STRATEGY"
    MALFORMED_JSON = "MALFORMED_JSON"
    EVALUATION_FAILED = "EVALUATION_FAILED"


class BaseAppException(HTTPException):
    """Base exception for application errors returning structured JSON responses."""

    def __init__(
        self,
        status_code: int,
        error_code: str,
        message: str,
        details: Optional[Any] = None,
    ):
        super().__init__(
            status_code=status_code,
            detail={
                "error_code": error_code,
                "message": message,
                "details": details,
            },
        )


class InvalidFileException(BaseAppException):
    def __init__(
        self, message: str = "Invalid file type. Only PDF files are supported."
    ):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code=AppErrorCode.INVALID_FILE_TYPE,
            message=message,
        )


class EmptyFileException(BaseAppException):
    def __init__(self, message: str = "The uploaded file is empty (0 bytes)."):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code=AppErrorCode.EMPTY_FILE,
            message=message,
        )


class InvalidStrategyException(BaseAppException):
    def __init__(self, invalid_strategies: list, allowed: list):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code=AppErrorCode.INVALID_STRATEGY,
            message=f"Invalid strategy option(s): {invalid_strategies}.",
            details={"allowed_strategies": allowed},
        )


class MalformedJSONException(BaseAppException):
    def __init__(self, message: str = "Invalid JSON format in request payload."):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code=AppErrorCode.MALFORMED_JSON,
            message=message,
        )


class EvaluationProcessingException(BaseAppException):
    def __init__(self, details: Optional[str] = None):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code=AppErrorCode.EVALUATION_FAILED,
            message="Failed to process and evaluate PDF.",
            details=details,
        )
