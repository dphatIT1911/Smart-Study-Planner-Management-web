import { Link, useNavigate } from 'react-router';
import { LayoutDashboard, BookOpen, CheckSquare, Clock, Settings, LogOut, Target, CalendarDays } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';



const menuItems = [
  { path: '/', label: 'Bảng điều khiển', icon: LayoutDashboard },
  { path: '/subjects', label: 'Môn học của tôi', icon: BookOpen },
  { path: '/tasks', label: 'Danh sách công việc', icon: CheckSquare },
  { path: '/calendar', label: 'Lịch biểu', icon: CalendarDays },
  { path: '/focus', label: 'Không gian tập trung', icon: Target },
  { path: '/sessions', label: 'Lịch sử phiên học', icon: Clock },
  { path: '/settings', label: 'Cài đặt', icon: Settings }
];


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
    <aside className="relative w-16 shrink-0">
      <div className="group/sidebar absolute inset-y-0 left-0 z-40 flex w-16 flex-col bg-white border-r border-gray-200 transition-[width] duration-200 ease-out hover:w-[280px]">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div className="max-w-0 overflow-hidden opacity-0 group-hover/sidebar:max-w-[200px] group-hover/sidebar:opacity-100 transition-all duration-200">
            <h1 className="font-semibold text-lg text-gray-900 whitespace-nowrap">Study Planner</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`w-full flex items-center justify-center group-hover/sidebar:justify-start gap-3 px-5 group-hover/sidebar:px-4 py-3 rounded-lg transition-colors ${isActive ?
                  ' text-indigo-600' :
                  'text-gray-700 hover:bg-gray-100'}`
              }>

              <Icon className="w-5 h-5 shrink-0" />
              <span className="font-medium whitespace-nowrap overflow-hidden max-w-0 opacity-0 group-hover/sidebar:max-w-[220px] group-hover/sidebar:opacity-100 transition-all duration-200">
                {item.label}
              </span>
            </Link>);

        })}
      </nav>


      {/* User Profile */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center gap-3 px-2 py-2 mb-2 justify-center group-hover/sidebar:justify-start">
          <Avatar>
            <AvatarFallback className="bg-indigo-100 text-indigo-600">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 overflow-hidden max-w-0 opacity-0 group-hover/sidebar:max-w-[220px] group-hover/sidebar:opacity-100 transition-all duration-200">
            <p className="font-medium text-sm text-gray-900 truncate whitespace-nowrap">{user.name}</p>
            <p className="text-xs text-gray-500 truncate whitespace-nowrap">{user.email}</p>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="w-full justify-center group-hover/sidebar:justify-start gap-2 px-3 group-hover/sidebar:px-4">

          <LogOut className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap overflow-hidden max-w-0 opacity-0 group-hover/sidebar:max-w-[220px] group-hover/sidebar:opacity-100 transition-all duration-200">
          Đăng xuất
          </span>
        </Button>
      </div>
      </div>
    </aside>);

}
