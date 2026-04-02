import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar, Clock, CheckSquare, Plus, Check, Play, Pause, Save, X, Lightbulb } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { api } from '../../api';

const priorityOptions = [
  { value: 'LOW', label: 'Thấp' },
  { value: 'MED', label: 'Trung bình' },
  { value: 'HIGH', label: 'Cao' }
];

const statusOptions = [
  { value: 'TODO', label: 'Cần làm' },
  { value: 'IN_PROGRESS', label: 'Đang làm' },
  { value: 'DONE', label: 'Hoàn thành' }
];

export default function TaskDetailModal({ task, subjects = [], isOpen, onOpenChange, onSave }) {
  const [editedTask, setEditedTask] = useState({});
  const [subtasks, setSubtasks] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setEditedTask({
          ...task,
          subject_id: task.subject_id?.toString() || 'none'
        });
        setSubtasks(task.subtasks || []);
      } else {
        setEditedTask({
          title: '',
          description: '',
          status: 'TODO',
          priority: 'MED',
          subject_id: 'none',
          estimated_minutes: 25,
        });
        setSubtasks([]);
      }
    }
  }, [task, isOpen]);


  const handleSave = () => {
    if (!editedTask.title?.trim()) {
      toast.error('Opps!', { description: "Quên nhập tên công việc rồi nè!" });
      return;
    }
    if (onSave) {
      if (editedTask.status === 'DONE' && task?.status !== 'DONE') {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast.success('Xuất sắc! 🎉', { description: 'Bạn lại vượt qua một task nữa rùi!' });
      } else if (!task) {
        toast.success('Đã thêm thành công!', { description: 'Chiến thôi nào!' });
      } else {
         toast.success('Đã cập nhật!', { description: 'Thông tin mới đã được lưu.' });
      }

      onSave({ 
        ...editedTask, 
        subject_id: editedTask.subject_id !== 'none' ? parseInt(editedTask.subject_id) : null,
        subtasks 
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[90vh] overflow-y-auto">
        <DialogHeader className="pr-10 pt-2">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <CheckSquare className="w-6 h-6 shrink-0 text-indigo-600" />
            <Input
              value={editedTask.title || ''}
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              placeholder="Tên công việc mới..."
              className="text-2xl font-bold border-none shadow-none focus-visible:ring-1 focus-visible:ring-indigo-200 px-2 rounded-md w-full bg-transparent hover:bg-slate-50 transition-colors"
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
                placeholder="Thêm chi tiết về công việc này..."
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
                {subtasks.length === 0 && <p className="text-sm text-gray-400 italic">Chưa có danh sách việc cần làm con.</p>}
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

          </div>

          <div className="space-y-6">
            {/* Right sidebar options */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Trạng thái</label>
                <Select value={editedTask.status || 'TODO'} onValueChange={(val) => setEditedTask({ ...editedTask, status: val })}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Ưu tiên</label>
                <Select value={editedTask.priority || 'MED'} onValueChange={(val) => setEditedTask({ ...editedTask, priority: val })}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Chọn độ ưu tiên" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Môn học</label>
                <Select value={editedTask.subject_id || 'none'} onValueChange={(val) => setEditedTask({ ...editedTask, subject_id: val })}>
                  <SelectTrigger className="w-full bg-white text-left truncate">
                    <SelectValue placeholder="Chọn môn học" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Không phân loại --</SelectItem>
                    {subjects?.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id.toString()}>
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
                <Input type="date" value={editedTask.due_date ? editedTask.due_date.split('T')[0] : ''} onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value ? new Date(e.target.value).toISOString() : null })} className="bg-white" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Thời gian dự kiến (phút)
                </label>
                <Input type="number" min="0" value={editedTask.estimated_minutes || 0} onChange={(e) => setEditedTask({ ...editedTask, estimated_minutes: parseInt(e.target.value) || 0 })} className="bg-white" />
              </div>
            </div>

            <Button onClick={handleSave} className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2">
              <Save className="w-4 h-4" />
              Lưu công việc
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
