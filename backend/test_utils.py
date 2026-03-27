from app.helpers.utils import get_current_utc_time, format_datetime, mask_sensitive_data
from datetime import datetime

def test_utils():
    print("Testing Utility Functions...")
    
    # Test Time
    now = get_current_utc_time()
    print(f"Current UTC: {now}")
    print(f"Formatted: {format_datetime(now)}")
    
    # Test Masking
    sensitive = {"password": "topsecret", "token": "xyz123", "data": "normal"}
    masked = mask_sensitive_data(sensitive)
    print(f"Sensitive: {sensitive}")
    print(f"Masked: {masked}")
    
    assert masked["password"] == "******"
    assert masked["token"] == "******"
    assert masked["data"] == "normal"
    print("All utility tests passed!")

if __name__ == "__main__":
    test_utils()
