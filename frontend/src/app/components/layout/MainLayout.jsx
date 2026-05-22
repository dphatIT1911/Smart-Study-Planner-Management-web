import { Outlet, useNavigate, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import ChatBot from '../chat/ChatBot';

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
    <div className="flex h-screen bg-gray-50" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Sidebar user={user} currentPath={location.pathname} />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <ChatBot />
    </div>);


}