import { Link, useNavigate } from 'react-router';
import { LayoutDashboard, BookOpen, CheckSquare, Clock, Settings, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';









const menuItems = [
  { path: '/', label: 'Bảng điều khiển', icon: LayoutDashboard },
  { path: '/subjects', label: 'Môn học của tôi', icon: BookOpen },
  { path: '/tasks', label: 'Danh sách công việc', icon: CheckSquare },
  { path: '/sessions', label: 'Phiên học', icon: Clock },
  { path: '/settings', label: 'Cài đặt', icon: Settings }];


export default function Sidebar({ user, currentPath }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.
      split(' ').
      map((n) => n[0]).
      join('').
      toUpperCase().
      slice(0, 2);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-lg text-gray-900">Study Planner</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ?
                  'bg-indigo-50 text-indigo-600' :
                  'text-gray-700 hover:bg-gray-100'}`
              }>

              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>);

        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <Avatar>
            <AvatarFallback className="bg-indigo-100 text-indigo-600">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2">

          <LogOut className="w-4 h-4" />
          Đăng xuất
        </Button>
      </div>
    </aside>);

}