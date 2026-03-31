import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, LayoutGrid, List } from 'lucide-react';
import TaskBoardView from '../components/tasks/TaskBoardView';
import TaskTableView from '../components/tasks/TaskTableView';
import TaskDetailModal from '../components/tasks/TaskDetailModal';

const mockTasks = [
{
  id: '1',
  title: 'Hoàn thành bài tập chương 5',
  subject: 'Toán Cao Cấp',
  subjectColor: '#6366f1',
  dueDate: '28 Th03, 2026',
  priority: 'Cao',
  status: 'Đang làm',
  estimatedMinutes: 90
},
{
  id: '2',
  title: 'Cài đặt cây tìm kiếm nhị phân',
  subject: 'Cấu Trúc Dữ Liệu',
  subjectColor: '#8b5cf6',
  dueDate: '29 Th03, 2026',
  priority: 'Trung bình',
  status: 'Cần làm',
  estimatedMinutes: 120
},
{
  id: '3',
  title: 'Thiết kế website cá nhân',
  subject: 'Phát Triển Web',
  subjectColor: '#ec4899',
  dueDate: '30 Th03, 2026',
  priority: 'Trung bình',
  status: 'Đang làm',
  estimatedMinutes: 180
},
{
  id: '4',
  title: 'Thực hành truy vấn SQL',
  subject: 'Hệ Quản Trị CSDL',
  subjectColor: '#14b8a6',
  dueDate: '27 Th03, 2026',
  priority: 'Thấp',
  status: 'Cần làm',
  estimatedMinutes: 60
},
{
  id: '5',
  title: 'Bài tập Đại số tuyến tính',
  subject: 'Toán Cao Cấp',
  subjectColor: '#6366f1',
  dueDate: '25 Th03, 2026',
  priority: 'Cao',
  status: 'Hoàn thành',
  estimatedMinutes: 75
}];

export default function TaskListPage() {
  const [tasks, setTasks] = useState(mockTasks);
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract unique subjects for the filter
  const subjects = [...new Set(tasks.map(t => t.subject))];

  const filteredTasks = tasks.filter((task) => {
    if (selectedSubject !== 'all' && task.subject !== selectedSubject) {
      return false;
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