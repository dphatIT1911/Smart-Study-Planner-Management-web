import { Outlet, useNavigate, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import ChatBot from '../chat/ChatBot';
import NotificationBell from './NotificationBell';

const pageTitles = {
  '/': 'Trạm Học Tập',
  '/subjects': 'Môn học của tôi',
  '/tasks': 'Danh sách công việc',
  '/calendar': 'Lịch biểu',
  '/focus': 'Không gian tập trung',
  '/sessions': 'Lịch sử phiên học',
  '/settings': 'Cài đặt'
};

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    // Both token AND user data must exist — otherwise redirect to login
    if (!token || !storedUser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 animate-fade-in" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Sidebar user={user} currentPath={location.pathname} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-30 shadow-sm">
          <div>
            <h2 className="font-bold text-slate-800 text-lg tracking-tight">
              {pageTitles[location.pathname] || 'Study Planner'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <ChatBot />
    </div>
  );
}