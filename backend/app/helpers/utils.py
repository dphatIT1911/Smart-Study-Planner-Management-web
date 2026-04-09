import logging
from datetime import datetime, timezone
from typing import Any, Optional
try:
    from zoneinfo import ZoneInfo
except ImportError:
    from backports.zoneinfo import ZoneInfo

# Configure standard logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger("smart_study")


def get_current_utc_time() -> datetime:
    """Get current time in UTC (timezone-aware)."""
    return datetime.now(timezone.utc)


def ensure_aware(dt: datetime) -> datetime:
    """Ensure a datetime object is timezone-aware (assumes UTC if naive)."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def convert_local_to_utc(dt: datetime, tz_name: str) -> datetime:
    """
    Convert a local datetime (naive or aware) to UTC.
    If naive, it assumes it's in the provided tz_name.
    """
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=ZoneInfo(tz_name))
    return dt.astimezone(timezone.utc)


def convert_utc_to_local(dt: datetime, tz_name: str) -> datetime:
    """Convert a UTC datetime to a local timezone."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(ZoneInfo(tz_name))


def format_datetime(dt: datetime, format_str: str = "%Y-%m-%d %H:%M:%S") -> str:
    """Format datetime object to string."""
    return dt.strftime(format_str)


def mask_sensitive_data(data: Any) -> Any:
    """Recursively mask sensitive fields like 'password' or 'token' in a dict."""
    if isinstance(data, dict):
        return {
            k: ("******" if k.lower() in ["password", "token", "secret", "key"] else mask_sensitive_data(v))
            for k, v in data.items()
        }
    elif isinstance(data, list):
        return [mask_sensitive_data(i) for i in data]
    return data
