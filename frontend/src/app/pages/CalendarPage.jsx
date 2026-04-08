import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfWeek, endOfWeek, 
         startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../api';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCalendarTasks();
  }, [currentDate]);

  const fetchCalendarTasks = async () => {
    setLoading(true);
    try {
      // Calculate start and end dates of the view (including trailing/leading days from other months)
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(monthStart);
      const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
      const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

      const data = await api.tasks.getCalendar(startDate.toISOString(), endDate.toISOString());
      setTasks(data || []);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu lịch:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Generate days for the grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getTasksForDay = (day) => {
    return tasks.filter(task => task.due_date && isSameDay(parseISO(task.due_date), day));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen font-['Inter']">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Lịch biểu</h1>
          <p className="text-gray-500 mt-1">Quản lý thời gian và các mốc hoàn thành công việc</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="hover:bg-indigo-50">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <h2 className="text-lg font-semibold min-w-[140px] text-center text-indigo-900 capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: vi })}
          </h2>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="hover:bg-indigo-50">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="shadow-md border-0 ring-1 ring-gray-200">
        <CardContent className="p-0">
          {/* Days of week */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/80 rounded-t-xl">
            {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'].map(day => (
              <div key={day} className="py-3 text-center text-sm font-semibold text-gray-500 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 relative">
            {loading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            )}
            
            {days.map((day, dayIdx) => {
              const dateTasks = getTasksForDay(day);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isDateToday = isToday(day);

              return (
                <div 
                  key={day.toString()} 
                  className={`min-h-[140px] p-2 border-r border-b border-gray-100 transition-colors
                    ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white text-gray-900'}
                    ${dayIdx % 7 === 6 ? 'border-r-0' : ''}
                    hover:bg-indigo-50/30 cursor-pointer
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium
                      ${isDateToday ? 'bg-indigo-600 text-white shadow-md' : ''}
                      ${!isDateToday && isCurrentMonth ? 'text-gray-700' : ''}
                    `}>
                      {format(day, 'd')}
                    </span>
                    {dateTasks.length > 0 && (
                      <span className="text-xs font-medium text-gray-400">
                        {dateTasks.length} mục
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1.5 overflow-y-auto max-h-[100px] scrollbar-thin">
                    {dateTasks.map(task => (
                      <div 
                        key={task.id}
                        className="group flex flex-col p-1.5 rounded-md text-xs font-medium border hover:shadow-md transition-all bg-white"
                        style={{ 
                          borderColor: task.subject_color ? `${task.subject_color}40` : '#e2e8f0',
                          borderLeftWidth: '4px',
                          borderLeftColor: task.subject_color || '#94a3b8',
                          color: task.is_overdue && task.status !== 'DONE' ? '#ef4444' : '#334155'
                        }}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="truncate pr-1 block flex-1 font-semibold">
                            {task.title}
                          </span>
                          {task.status === 'DONE' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />}
                          {task.is_overdue && task.status !== 'DONE' && <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-70 text-[10px]">
                          <Clock className="w-3 h-3" />
                          <span>{format(parseISO(task.due_date), 'HH:mm')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
