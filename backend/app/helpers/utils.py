import logging
from datetime import datetime, timezone
from typing import Any

# Configure standard logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger("smart_study")

def get_current_utc_time() -> datetime:
    """Get current time in UTC."""
    return datetime.now(timezone.utc)

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
