"""Structured logging setup for Almost-a-CMS."""

import json
import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional

from rich.console import Console
from rich.logging import RichHandler

from config import settings


class StructuredFormatter(logging.Formatter):
    """Custom formatter for structured logging."""

    def format(self, record: logging.LogRecord) -> str:
        """Format log record as structured JSON."""
        log_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Add extra fields if present
        if hasattr(record, "user_id"):
            log_data["user_id"] = record.user_id
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id
        if hasattr(record, "operation"):
            log_data["operation"] = record.operation
        if hasattr(record, "content_type"):
            log_data["content_type"] = record.content_type
        if hasattr(record, "duration"):
            log_data["duration"] = record.duration

        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        # Add stack trace for warnings and errors
        if record.levelno >= logging.WARNING and record.stack_info:
            log_data["stack_trace"] = self.formatStack(record.stack_info)

        return json.dumps(log_data, default=str)


def setup_logging(
    level: str = "INFO",
    log_file: Optional[Path] = None,
    json_format: bool = False,
) -> None:
    """Set up structured logging for the application.

    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Optional file path for logging output
        json_format: Whether to use JSON formatting for file output
    """
    # Convert level string to logging constant
    numeric_level = getattr(logging, level.upper(), logging.INFO)

    # Create logs directory if needed
    if log_file:
        log_file.parent.mkdir(parents=True, exist_ok=True)

    # Root logger configuration
    root_logger = logging.getLogger()
    root_logger.setLevel(numeric_level)

    # Clear existing handlers
    root_logger.handlers.clear()

    # Console handler with Rich formatting (for development)
    if settings.debug:
        console = Console()
        console_handler = RichHandler(
            console=console,
            show_time=True,
            show_path=True,
            markup=True,
            rich_tracebacks=True,
            tracebacks_show_locals=True,
        )
        console_handler.setLevel(numeric_level)

        # Use simple format for console
        console_formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        console_handler.setFormatter(console_formatter)
        root_logger.addHandler(console_handler)
    else:
        # Simple console handler for production
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.WARNING)  # Only warnings and errors to console
        console_formatter = logging.Formatter("%(levelname)s: %(message)s")
        console_handler.setFormatter(console_formatter)
        root_logger.addHandler(console_handler)

    # File handler with structured logging
    if log_file:
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(numeric_level)

        if json_format:
            file_handler.setFormatter(StructuredFormatter())
        else:
            file_formatter = logging.Formatter(
                "%(asctime)s - %(name)s - %(levelname)s - %(module)s:%(funcName)s:%(lineno)d - %(message)s"
            )
            file_handler.setFormatter(file_formatter)

        root_logger.addHandler(file_handler)

    # Set levels for third-party libraries
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("fastapi").setLevel(logging.INFO)

    # Create application logger
    app_logger = logging.getLogger("almostacms")
    app_logger.info(
        "Logging system initialized",
        extra={
            "operation": "logging_setup",
            "level": level,
            "json_format": json_format,
            "log_file": str(log_file) if log_file else None,
        },
    )


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance for the given name.

    Args:
        name: Logger name (typically __name__)

    Returns:
        Configured logger instance
    """
    return logging.getLogger(f"almostacms.{name}")


class LogContext:
    """Context manager for adding structured logging context."""

    def __init__(self, logger: logging.Logger, **context: Any):
        """Initialize log context.

        Args:
            logger: Logger instance
            **context: Context fields to add to log messages
        """
        self.logger = logger
        self.context = context
        self.original_makeRecord = logger.makeRecord

    def __enter__(self) -> logging.Logger:
        """Enter context and patch logger."""

        def makeRecord(
            name, level, fn, lno, msg, args, exc_info, func=None, extra=None, sinfo=None
        ):
            # Add our context to extra fields
            if extra is None:
                extra = {}
            extra.update(self.context)
            return self.original_makeRecord(
                name, level, fn, lno, msg, args, exc_info, func, extra, sinfo
            )

        self.logger.makeRecord = makeRecord
        return self.logger

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Exit context and restore logger."""
        self.logger.makeRecord = self.original_makeRecord


def log_operation(operation: str, **context: Any):
    """Decorator for logging operations with timing.

    Args:
        operation: Operation name for logging
        **context: Additional context fields
    """

    def decorator(func):
        def wrapper(*args, **kwargs):
            logger = get_logger(func.__module__)
            start_time = datetime.utcnow()

            with LogContext(logger, operation=operation, **context):
                logger.info(f"Starting {operation}")
                try:
                    result = func(*args, **kwargs)
                    duration = (datetime.utcnow() - start_time).total_seconds()
                    logger.info(f"Completed {operation}", extra={"duration": duration})
                    return result
                except Exception as e:
                    duration = (datetime.utcnow() - start_time).total_seconds()
                    logger.error(
                        f"Failed {operation}: {str(e)}",
                        exc_info=True,
                        extra={"duration": duration, "error": str(e)},
                    )
                    raise

        return wrapper

    return decorator


# Initialize logging on import
log_dir = Path("logs")
log_file = log_dir / "almostacms.log"

setup_logging(
    level=settings.environment.upper() if hasattr(settings, "environment") else "INFO",
    log_file=log_file,
    json_format=not settings.debug,
)
