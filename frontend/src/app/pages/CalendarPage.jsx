import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, addWeeks, subWeeks, startOfWeek, endOfWeek, 
         startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO, parse, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle2, LayoutGrid, Rows3 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { api } from '../api';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '../components/ui/popover';
import { Input } from '../components/ui/input';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import DayTasksModal from '../components/calendar/DayTasksModal';
import { toast } from 'sonner';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [monthInput, setMonthInput] = useState(currentDate.getMonth() + 1);
  const [yearInput, setYearInput] = useState(currentDate.getFullYear());
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'week'
  const navigate = useNavigate();

  useEffect(() => {
    api.subjects.getAll().then(setSubjects).catch(console.error);
  }, []);

  useEffect(() => {
    fetchCalendarTasks();
  }, [currentDate, viewMode]);

  const fetchCalendarTasks = async () => {
    setLoading(true);
    try {
      // Gửi range theo UTC để backend so sánh đúng với due_date lưu dạng naive UTC
      const startDate = viewMode === 'month' 
        ? startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 })
        : startOfWeek(currentDate, { weekStartsOn: 1 });
        
      const endDate = viewMode === 'month'
        ? endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 })
        : endOfWeek(currentDate, { weekStartsOn: 1 });

      // Set endDate về cuối ngày để không bỏ sót task cuối ngày cuối tuần
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Dùng toISOString() để luôn gửi UTC, đồng bộ với cách due_date được lưu
      const tasksData = await api.tasks.getCalendar(
        startDate.toISOString(),
        endOfDay.toISOString()
      );

      setTasks(tasksData || []);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu lịch:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (taskData.id) {
        await api.tasks.update(taskData.id, taskData);
      } else {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        await api.tasks.create({...taskData, user_id: user?.id});
      }
      fetchCalendarTasks();
    } catch (err) {
      toast.error('Lỗi khi lưu', { description: err.message || 'Không thể lưu công việc do lỗi kết nối' });
    }
  };

  const nextMonth = () => setCurrentDate(viewMode === 'month' ? addMonths(currentDate, 1) : addWeeks(currentDate, 1));
  const prevMonth = () => setCurrentDate(viewMode === 'month' ? subMonths(currentDate, 1) : subWeeks(currentDate, 1));

  useEffect(() => {
    if (isMonthPickerOpen) {
      setMonthInput(currentDate.getMonth() + 1);
      setYearInput(currentDate.getFullYear());
    }
  }, [isMonthPickerOpen, currentDate]);

  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 5;
  const maxYear = currentYear + 5;

  const applyMonthYear = () => {
    const month = Math.min(12, Math.max(1, Number(monthInput) || 1));
    const year = Math.min(maxYear, Math.max(minYear, Number(yearInput) || currentYear));

    setMonthInput(month);
    setYearInput(year);

    setCurrentDate(new Date(year, month - 1, 1));
    setIsMonthPickerOpen(false);
  };

  // Generate days for the grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = viewMode === 'month' 
    ? startOfWeek(monthStart, { weekStartsOn: 1 })
    : startOfWeek(currentDate, { weekStartsOn: 1 });
  const endDate = viewMode === 'month'
    ? endOfWeek(monthEnd, { weekStartsOn: 1 })
    : endOfWeek(currentDate, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const parseTaskDueDate = (dueDate) => {
    if (!dueDate) return null;
    if (dueDate instanceof Date) return dueDate;

    if (typeof dueDate === 'string') {
      const normalized = dueDate.includes(' ') && !dueDate.includes('T')
        ? dueDate.replace(' ', 'T')
        : dueDate;

      const iso = parseISO(normalized);
      if (isValid(iso)) return iso;

      // Fallback: dd/MM/yyyy (hoặc dd/MM/yyyy HH:mm)
      const dmy = parse(dueDate, 'dd/MM/yyyy', new Date());
      if (isValid(dmy)) return dmy;

      const dmyTime = parse(dueDate, 'dd/MM/yyyy HH:mm', new Date());
      if (isValid(dmyTime)) return dmyTime;
    }

    return null;
  };

  const getTaskDayKey = (dueDate) => {
    if (!dueDate) return null;
    if (typeof dueDate === 'string') {
      const match = dueDate.match(/^(\d{4}-\d{2}-\d{2})/);
      if (match) return match[1];
    }
    const parsed = parseTaskDueDate(dueDate);
    return parsed ? format(parsed, 'yyyy-MM-dd') : null;
  };

  const getTasksForDay = (day) => {
    const dayKey = format(day, 'yyyy-MM-dd');
    const dayTasks = tasks.filter(task => {
      const key = getTaskDayKey(task.due_date);
      return key && key === dayKey;
    });
    // Sắp xếp theo task_id tăng dần
    return dayTasks.sort((a, b) => a.id - b.id);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-slate-50 font-['Inter'] h-[calc(100vh-0px)] overflow-hidden flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg p-1 border border-gray-200 shadow-sm flex items-center">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                  viewMode === 'month' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Tháng
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                  viewMode === 'week' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Rows3 className="w-4 h-4" />
                Tuần
              </button>
            </div>
          </div>
          <p className="text-gray-500 mt-2">Quản lý thời gian và các mốc hoàn thành công việc</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="hover:bg-indigo-50">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <Popover open={isMonthPickerOpen} onOpenChange={setIsMonthPickerOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="text-lg font-semibold min-w-[200px] text-center text-indigo-900 capitalize hover:bg-indigo-50 rounded-lg px-3 py-1.5 transition-colors"
                title={viewMode === 'month' ? "Chọn tháng" : "Tuần hiện tại"}
              >
                {viewMode === 'month' 
                  ? format(currentDate, 'MMMM yyyy', { locale: vi })
                  : `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`}
              </button>
            </PopoverTrigger>
            {viewMode === 'month' && (
              <PopoverContent className="w-[320px] p-4" align="center" sideOffset={8}>
                <div className="flex  gap-3">
                  <div className="flex-1 flex-col items-start">
                    <div className="text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Tháng
                    </div>
                    <select
                      className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                      value={monthInput}
                      onChange={(e) => setMonthInput(Number(e.target.value))}
                    >
                      {Array.from({ length: 12 }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Năm
                    </div>
                    <Input
                      type="number"
                      min={minYear}
                      max={maxYear}
                      value={yearInput}
                      onChange={(e) => setYearInput(e.target.value)}
                      onBlur={() => {
                        const year = Math.min(maxYear, Math.max(minYear, Number(yearInput) || currentYear));
                        setYearInput(year);
                      }}
                    />
                    <div className="text-[10px] text-slate-400 mt-1">
                      {minYear} - {maxYear}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setIsMonthPickerOpen(false)}
                  >
                    Huỷ
                  </Button>
                  <Button
                    onClick={applyMonthYear}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Áp dụng
                  </Button>
                </div>
              </PopoverContent>
            )}
          </Popover>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="hover:bg-indigo-50">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="shadow-md border-0 ring-1 ring-gray-200 flex-1 min-h-0 overflow-hidden flex flex-col">
        <CardContent className="p-0 flex-1 min-h-0 flex flex-col">
          {/* Days of week */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/80 rounded-t-xl">
            {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'].map(day => (
              <div key={day} className="py-3 text-center text-sm font-semibold text-gray-500 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="relative flex-1 min-h-0">
            {loading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            )}

            <div className={`h-full grid grid-cols-7 ${viewMode === 'month' ? 'grid-rows-6' : 'grid-rows-1'}`}>
            {days.map((day, dayIdx) => {
              const dateTasks = getTasksForDay(day);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isDateToday = isToday(day);
              const previewTasks = viewMode === 'week' ? dateTasks : dateTasks.slice(0, 3);
              const remainingCount = viewMode === 'week' ? 0 : Math.max(0, dateTasks.length - previewTasks.length);

              return (
                <div 
                  key={day.toString()} 
                  onClick={() => {
                    setSelectedDate(day);
                    setIsDayModalOpen(true);
                  }}
                  className={`group relative min-h-0 p-2 border-r border-b border-gray-100 transition-colors
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
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTask({
                            title: '',
                            description: '',
                            status: 'TODO',
                            priority: 'MED',
                            due_date: new Date(day.getTime() - day.getTimezoneOffset() * 60000).toISOString(),
                            estimated_minutes: 25,
                          });
                          setIsModalOpen(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white pb-0.5"
                        title="Thêm công việc"
                      >
                        <span className="text-sm font-bold leading-none">+</span>
                      </button>
                      {dateTasks.length > 0 && (
                        <span className="text-xs font-medium text-gray-400">
                          {dateTasks.length} mục
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className={`space-y-1.5 ${viewMode === 'month' ? 'overflow-hidden' : 'overflow-y-auto max-h-[calc(100%-40px)] custom-scrollbar pr-1'}`}>
                    {previewTasks.map(task => {
                      const isDone = task.status === 'DONE';
                      const isOverdue = task.is_overdue && !isDone;
                      
                      return (
                      <div 
                        key={task.id}
                        className={`flex items-start gap-1.5 px-1 py-1 rounded text-xs ${isDone ? 'opacity-50' : ''}`}
                      >
                        <div 
                          className="w-2 h-2 rounded-full mt-1 shrink-0"
                          style={{ 
                            backgroundColor: isDone ? (task.subject_color || '#94a3b8') : 'transparent', 
                            borderColor: task.subject_color || '#94a3b8', 
                            borderStyle: 'solid',
                            borderWidth: isDone ? '0px' : '2px' 
                          }}
                        />
                        
                        <div className="flex flex-col flex-1 min-w-0">
                          <span 
                            className={`truncate font-medium ${isDone ? 'line-through text-gray-500' : isOverdue ? 'text-red-600' : 'text-gray-700'}`}
                            title={task.title}
                          >
                            {task.title}
                          </span>
                          
                          {isOverdue && (
                            <div className="flex items-center text-[10px] text-gray-400 mt-0.5">
                              <span className="text-red-500 font-medium">Quá hạn</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )})}

                    {remainingCount > 0 && (
                      <div className="text-[11px] text-slate-400 px-1">
                        +{remainingCount} việc nữa
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <DayTasksModal
        isOpen={isDayModalOpen}
        onOpenChange={setIsDayModalOpen}
        date={selectedDate}
        tasks={selectedDate ? getTasksForDay(selectedDate) : []}
        onAddTask={() => {
          if (!selectedDate) return;
          setIsDayModalOpen(false);
          setSelectedTask({
            title: '',
            description: '',
            status: 'TODO',
            priority: 'MED',
            due_date: new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000).toISOString(),
            estimated_minutes: 25,
          });
          setIsModalOpen(true);
        }}
        onTaskClick={(task) => {
          setIsDayModalOpen(false);
          navigate(`/tasks?taskId=${task.id}`);
        }}
      />

      <TaskDetailModal 
        task={selectedTask} 
        subjects={subjects}
        isOpen={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        onSave={handleSaveTask}
      />
    </div>
  );
}
