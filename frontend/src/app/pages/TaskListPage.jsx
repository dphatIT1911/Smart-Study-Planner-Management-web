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
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [viewMode, setViewMode] = useState('board');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tasksData, subjectsData] = await Promise.all([
          api.tasks.getAll(),
          api.subjects.getAll()
        ]);
        setTasks(tasksData);
        setSubjects(subjectsData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    if (selectedSubject !== 'all') {
      if (task.subject_id?.toString() !== selectedSubject.toString()) {
        return false;
      }
    }
    return true;
  });

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (taskData.id) {
        const updatedTask = await api.tasks.update(taskData.id, taskData);
        setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
      } else {
        const user = JSON.parse(localStorage.getItem('user'));
        const newTask = await api.tasks.create({...taskData, user_id: user?.id});
        setTasks([...tasks, newTask]);
      }
    } catch (err) {
      alert(err.message || 'Không thể lưu công việc');
    }
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
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-sm font-medium"
          onClick={() => {
            setSelectedTask(null);
            setIsModalOpen(true);
          }}
        >
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
                <SelectItem key={subject.id} value={subject.id.toString()}>{subject.name}</SelectItem>
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
        subjects={subjects}
        isOpen={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        onSave={handleSaveTask}
      />
    </div>
  );
}
