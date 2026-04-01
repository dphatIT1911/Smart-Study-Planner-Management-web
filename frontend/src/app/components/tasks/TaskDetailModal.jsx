import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar, Clock, CheckSquare, Plus, Check, Play, Pause, Save, X } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';

const priorityOptions = ['Thấp', 'Trung bình', 'Cao'];
const statusOptions = ['Cần làm', 'Đang làm', 'Hoàn thành'];

const subjectOptions = [
  { id: '1', name: 'Toán Cao Cấp' },
  { id: '2', name: 'Cấu Trúc Dữ Liệu' },
  { id: '3', name: 'Phát Triển Web' },
  { id: '4', name: 'Hệ Quản Trị CSDL' }
];

export default function TaskDetailModal({ task, isOpen, onOpenChange, onSave }) {
  const [editedTask, setEditedTask] = useState(task || {});
  const [pomodoroTarget, setPomodoroTarget] = useState(25);
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [subtasks, setSubtasks] = useState([]);

  useEffect(() => {
    if (task) {
      setEditedTask(task);
      setSubtasks(task.subtasks || [
        { id: 1, text: 'Nghiên cứu tài liệu', completed: false },
        { id: 2, text: 'Viết nháp', completed: false },
        { id: 3, text: 'Chỉnh sửa', completed: true },
      ]);
      setPomodoroActive(false);
      setTimeLeft(pomodoroTarget * 60);
    }
  }, [task, pomodoroTarget]);

  useEffect(() => {
    let interval = null;
    if (pomodoroActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setPomodoroActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pomodoroActive, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!task) return null;

  const handleSave = () => {
    if (onSave) onSave({ ...editedTask, subtasks });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            <Input
              value={editedTask.title}
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              className="text-2xl font-bold border-none shadow-none focus-visible:ring-1 focus-visible:ring-indigo-200 px-0 rounded-none w-full"
            />
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                Mô tả
              </h3>
              <Textarea
                value={editedTask.description || ''}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                className="min-h-[100px] resize-none"
                placeholder="Chưa có mô tả cho công việc này. Thêm mô tả công việc..."
              />
            </div>

            {/* Sub-tasks / Checklist */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  Danh sách việc cần làm (Sub-tasks)
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1"
                  onClick={() => {
                    setSubtasks([...subtasks, { id: Date.now(), text: '', completed: false }]);
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm mục
                </Button>
              </div>

              <div className="space-y-2">
                {subtasks.map((st) => (
                  <div key={st.id} className="flex items-center gap-2 group">
                    <Checkbox
                      id={`subtask-${st.id}`}
                      checked={st.completed}
                      onCheckedChange={(checked) => {
                        setSubtasks(subtasks.map(s => s.id === st.id ? { ...s, completed: checked } : s));
                      }}
                    />
                    <Input
                      value={st.text}
                      onChange={(e) => {
                        setSubtasks(subtasks.map(s => s.id === st.id ? { ...s, text: e.target.value } : s));
                      }}
                      className={`h-8 border-transparent hover:border-slate-200 focus-visible:ring-1 bg-transparent px-2 ${st.completed ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      placeholder="Nhập tên việc cần làm..."
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 shrink-0"
                      onClick={() => setSubtasks(subtasks.filter(s => s.id !== st.id))}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Pomodoro Timer Placeholder */}
            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100 flex flex-col items-center justify-center text-center">
              <h3 className="text-lg font-bold text-indigo-900 mb-2">Đồng hồ Pomodoro</h3>
              <div className="text-4xl font-mono font-bold text-indigo-600 my-4">
                {formatTime(timeLeft)}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setPomodoroActive(!pomodoroActive)}
                  className={pomodoroActive ? "bg-amber-500 hover:bg-amber-600 gap-2" : "bg-indigo-600 hover:bg-indigo-700 gap-2"}
                >
                  {pomodoroActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {pomodoroActive ? "Tạm dừng" : "Bắt đầu"}
                </Button>
                <Button variant="outline" className="gap-2">
                  <Clock className="w-4 h-4" />
                  Cài đặt ({pomodoroTarget}p)
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Right sidebar options */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Trạng thái</label>
                <Select value={editedTask.status} onValueChange={(val) => setEditedTask({ ...editedTask, status: val })}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Ưu tiên</label>
                <Select value={editedTask.priority} onValueChange={(val) => setEditedTask({ ...editedTask, priority: val })}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Chọn độ ưu tiên" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Môn học</label>
                <Select value={editedTask.subject} onValueChange={(val) => setEditedTask({ ...editedTask, subject: val })}>
                  <SelectTrigger className="w-full bg-white text-left truncate">
                    <SelectValue placeholder="Chọn môn học" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectOptions.map((sub) => (
                      <SelectItem key={sub.name} value={sub.name}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Hạn chót
                </label>
                <Input type="text" value={editedTask.dueDate} onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })} className="bg-white" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Thời gian dự kiến (phút)
                </label>
                <Input type="number" value={editedTask.estimatedMinutes} onChange={(e) => setEditedTask({ ...editedTask, estimatedMinutes: e.target.value })} className="bg-white" />
              </div>
            </div>

            <Button onClick={handleSave} className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2">
              <Save className="w-4 h-4" />
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
