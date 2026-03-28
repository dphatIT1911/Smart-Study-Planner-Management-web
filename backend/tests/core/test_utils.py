from app.helpers.utils import get_current_utc_time, format_datetime, mask_sensitive_data

def test_utils():
    # Test Time
    now = get_current_utc_time()
    assert now is not None
    assert format_datetime(now) is not None
    
    # Test Masking
    sensitive = {"password": "topsecret", "token": "xyz123", "data": "normal"}
    masked = mask_sensitive_data(sensitive)
    
    assert masked["password"] == "******"
    assert masked["token"] == "******"
    assert masked["data"] == "normal"
