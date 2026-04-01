import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, LayoutGrid, List, Loader2, AlertCircle } from 'lucide-react';
import TaskBoardView from '../components/tasks/TaskBoardView';
import TaskTableView from '../components/tasks/TaskTableView';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import { api } from '../api';

export default function TaskListPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [viewMode, setViewMode] = useState('board');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const data = await api.tasks.getAll();
        setTasks(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        setError('Không thể tải danh sách công việc. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Extract unique subjects for the filter
  const subjects = [...new Set(tasks.map(t => t.subject?.name || t.subject || 'Chưa phân loại').filter(Boolean))];

  const filteredTasks = tasks.filter((task) => {
    if (selectedSubject !== 'all') {
      const subjectName = task.subject?.name || task.subject || 'Chưa phân loại';
      if (subjectName !== selectedSubject) {
        return false;
      }
    }
    return true;
  });

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = (updatedTask) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-gray-500 font-medium italic">Đang tải danh sách công việc...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-theme(spacing.16))] flex flex-col">
      <div className="flex items-center justify-between xl:mb-8 mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Danh sách công việc</h1>
          <p className="text-slate-500 mt-2">Sắp xếp và theo dõi bài tập của bạn</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-sm font-medium">
          <Plus className="w-4 h-4" />
          Thêm công việc
        </Button>
      </div>
      
      {error && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-center gap-3 text-amber-800 mb-6">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-6 shrink-0 flex-wrap gap-4">
        {/* Subject Filter */}
        <div className="w-[240px]">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="bg-white border-slate-200">
              <SelectValue placeholder="Lọc theo môn học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-medium text-slate-600">Tất cả môn học</SelectItem>
              {subjects.map(subject => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* View Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-sm">
          <button
            onClick={() => setViewMode('board')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'board' 
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Bảng
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list' 
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <List className="w-4 h-4" />
            Danh sách
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden min-h-0">
        {viewMode === 'board' ? (
          <TaskBoardView tasks={filteredTasks} onTaskClick={handleTaskClick} />
        ) : (
          <TaskTableView tasks={filteredTasks} onTaskClick={handleTaskClick} />
        )}
      </div>

      <TaskDetailModal 
        task={selectedTask} 
        isOpen={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        onSave={handleSaveTask}
      />
    </div>
  );
}
