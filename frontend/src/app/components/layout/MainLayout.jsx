import { Outlet, useNavigate, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import ChatBot from '../chat/ChatBot';

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Sidebar user={user} currentPath={location.pathname} />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <ChatBot />
    </div>);


}