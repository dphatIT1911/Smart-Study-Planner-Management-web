import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Clock, X } from 'lucide-react';
import { api } from '../../api';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.notifications.getAll();
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffHours < 1) return 'Vừa xong';
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
        title="Thông báo"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold text-sm text-gray-900">Thông báo</span>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount} mới
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3 h-3" />
                Đọc tất cả
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Chưa có thông báo nào</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-gray-50 flex gap-3 items-start transition-colors cursor-pointer hover:bg-gray-50 ${
                    n.is_read ? 'opacity-60' : 'bg-indigo-50/30'
                  }`}
                  onClick={() => {
                    if (!n.is_read) handleMarkAsRead(n.id);
                    setExpandedId(expandedId === n.id ? null : n.id);
                  }}
                >
                  {/* Icon */}
                  <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.is_read ? 'bg-gray-100' : 'bg-orange-100'}`}>
                    <Clock className={`w-4 h-4 ${n.is_read ? 'text-gray-400' : 'text-orange-500'}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${n.is_read ? 'text-gray-600' : 'text-gray-900'}`}>
                      {n.title}
                    </p>
                    <p className={`text-xs text-gray-500 mt-0.5 ${expandedId === n.id ? '' : 'line-clamp-2'}`}>{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatTime(n.created_at)}</p>
                  </div>

                  {/* Unread dot */}
                  {!n.is_read && (
                    <div className="w-2 h-2 bg-indigo-500 rounded-full shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
