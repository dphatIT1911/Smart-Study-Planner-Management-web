import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Calendar, Clock, CheckSquare, Save, Wand2, Loader2, Sparkles,
  Trash2, AlertTriangle, GitBranch, Check
} from 'lucide-react';
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

const priorityColors = {
  HIGH: 'bg-red-100 text-red-700 border-red-200',
  MED: 'bg-amber-100 text-amber-700 border-amber-200',
  LOW: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const statusColors = {
  TODO: 'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  DONE: 'bg-emerald-100 text-emerald-700',
};

export default function TaskDetailModal({ task, subjects = [], isOpen, onOpenChange, onSave, onDelete }) {
  const [editedTask, setEditedTask] = useState({});
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [childTasks, setChildTasks] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [isBigTask, setIsBigTask] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowDeleteConfirm(false);
      setChildTasks([]);
      setIsBigTask(false);

      if (task) {
        setEditedTask({
          ...task,
          subject_id: task.subject_id?.toString() || 'none'
        });
        // Fetch child tasks (sub-tasks created by breakdown)
        fetchChildTasks();
      } else {
        setEditedTask({
          title: '',
          description: '',
          status: 'TODO',
          priority: 'MED',
          subject_id: 'none',
          estimated_minutes: 25,
        });
      }
    }
  }, [task, isOpen]);

  const fetchChildTasks = async () => {
    if (!task?.id) return;
    setLoadingChildren(true);
    try {
      const allTasks = await api.tasks.getAll();
      const children = allTasks.filter(t => t.parent_id === task.id);
      setChildTasks(children);
    } catch (err) {
      console.error('Failed to fetch child tasks:', err);
    } finally {
      setLoadingChildren(false);
    }
  };

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
        _autoBreakdown: !task && isBigTask,
      });
    }
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!task?.id || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(task.id);
      onOpenChange(false);
    } catch (err) {
      toast.error('Lỗi khi xóa', {
        description: err.message || 'Không thể xóa công việc.',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleBreakdown = async () => {
    if (!task?.id) return;
    setIsBreakingDown(true);
    try {
      const result = await api.tasks.breakdown(task.id);

      if (result.created_subtasks && result.created_subtasks.length > 0) {
        confetti({
          particleCount: 100,
          spread: 60,
          origin: { y: 0.5 },
          colors: ['#8b5cf6', '#6366f1', '#a78bfa', '#c4b5fd']
        });
        toast.success('🪄 Phân chia thành công!', {
          description: result.message,
        });
        // Update the child tasks list in the modal immediately
        setChildTasks(result.created_subtasks);
        // Notify parent to refresh task list
        window.dispatchEvent(new CustomEvent('tasks-updated'));
      } else {
        toast.info('Không thể phân chia', {
          description: result.message,
        });
      }
    } catch (err) {
      toast.error('Lỗi khi phân chia', {
        description: err.message || 'Không thể phân chia task. Vui lòng thử lại.',
      });
    } finally {
      setIsBreakingDown(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit'
      });
    } catch { return ''; }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent hideClose className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* CỘT TRÁI: Tiêu đề & Mô tả */}
          <div className="md:col-span-3 flex flex-col gap-6">
            
            {/* Title Input */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md border-2 border-indigo-500 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 text-indigo-500" />
              </div>
              <Input
                value={editedTask.title || ''}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                placeholder="Tên công việc mới..."
                className="text-lg font-semibold border-indigo-200 focus-visible:ring-1 focus-visible:ring-indigo-400 rounded-lg w-full h-11"
              />
            </div>

            {/* Description */}
            <div className="space-y-2 flex-1">
              <h3 className="text-sm font-bold text-gray-800">
                Mô tả
              </h3>
              <Textarea
                value={editedTask.description || ''}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                className="min-h-[160px] resize-none bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-slate-300 rounded-xl p-4 text-sm"
                placeholder="Thêm chi tiết về công việc này..."
              />
            </div>

            {/* Auto-Breakdown Child Tasks */}
            {task && (
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-indigo-500" />
                  Task con (Auto-Breakdown)
                  {childTasks.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs font-normal">
                      {childTasks.length}
                    </Badge>
                  )}
                </h3>

                {loadingChildren ? (
                  <div className="flex items-center gap-2 text-sm text-slate-400 py-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang tải...
                  </div>
                ) : childTasks.length === 0 ? (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 text-center">
                    <p className="text-sm text-slate-400 italic">
                      Chưa có task con. Nhấn <strong>"Magic Breakdown"</strong> để tự động phân chia.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {childTasks.map((child) => (
                      <div
                        key={child.id}
                        className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 transition-colors group"
                      >
                        <div className={`w-2 h-2 rounded-full shrink-0 ${
                          child.status === 'DONE' ? 'bg-emerald-500' :
                          child.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-slate-300'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            child.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-700'
                          }`}>
                            {child.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {formatDate(child.due_date)}
                            {child.estimated_minutes > 0 && ` · ${child.estimated_minutes} phút`}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 shrink-0 ${statusColors[child.status] || ''}`}
                        >
                          {statusOptions.find(s => s.value === child.status)?.label || child.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CỘT PHẢI: Sidebar Options */}
          <div className="md:col-span-2 space-y-4">
            
            {/* Box chứa các options */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4">
              
              {task && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Trạng thái</label>
                  <Select value={editedTask.status || 'TODO'} onValueChange={(val) => setEditedTask({ ...editedTask, status: val })}>
                    <SelectTrigger className="w-full bg-white border-none shadow-sm rounded-lg h-10">
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
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Ưu tiên</label>
                <Select value={editedTask.priority || 'MED'} onValueChange={(val) => setEditedTask({ ...editedTask, priority: val })}>
                  <SelectTrigger className="w-full bg-white border-none shadow-sm rounded-lg h-10">
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

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Môn học</label>
                <Select value={editedTask.subject_id || 'none'} onValueChange={(val) => setEditedTask({ ...editedTask, subject_id: val })}>
                  <SelectTrigger className="w-full bg-white border-none shadow-sm rounded-lg h-10 text-left truncate">
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

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Hạn chót
                </label>
                <Input 
                  type="date" 
                  value={editedTask.due_date ? editedTask.due_date.split('T')[0] : ''} 
                  onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value ? new Date(e.target.value).toISOString() : null })} 
                  className="bg-white border-none shadow-sm rounded-lg h-10" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Thời gian (phút)
                </label>
                <Input 
                  type="number" 
                  min="0" 
                  value={editedTask.estimated_minutes || 0} 
                  onChange={(e) => setEditedTask({ ...editedTask, estimated_minutes: parseInt(e.target.value) || 0 })} 
                  className="bg-white border-none shadow-sm rounded-lg h-10" 
                />
              </div>

              {/* "Task lớn" toggle — only for NEW tasks */}
              {!task && (
                <div className="pt-2">
                  <button
                    type="button"
                    id="btn-toggle-big-task"
                    onClick={() => {
                      if (!editedTask.due_date) {
                        toast.info('Hãy chọn hạn chót trước', {
                          description: 'Cần có hạn chót để hệ thống phân chia task.',
                        });
                        return;
                      }
                      setIsBigTask(!isBigTask);
                    }}
                    className={`w-full flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      isBigTask
                        ? 'border-violet-400 bg-violet-50/50 shadow-sm'
                        : !editedTask.due_date
                        ? 'border-transparent bg-white/40 opacity-60'
                        : 'border-transparent bg-white hover:border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isBigTask ? 'border-violet-500 bg-violet-500' : 'border-slate-300'
                    }`}>
                      {isBigTask && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1 text-left">
                      <span className={`text-[13px] font-bold ${
                        isBigTask ? 'text-violet-700' : 'text-slate-600'
                      }`}>
                        Task lớn
                      </span>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                        {editedTask.due_date
                          ? 'Tự động phân chia'
                          : 'Chọn hạn chót để bật'}
                      </p>
                    </div>
                    <Wand2 className={`w-4 h-4 transition-colors ${
                      isBigTask ? 'text-violet-500' : 'text-slate-300'
                    }`} />
                  </button>
                </div>
              )}
            </div>

            {/* Các nút hành động bên dưới Box xám */}
            <div className="space-y-3 pt-2">
              
              {/* Magic Breakdown Button — only for existing tasks */}
              {task && task.due_date && (
                <Button
                  id="btn-magic-breakdown"
                  onClick={handleBreakdown}
                  disabled={isBreakingDown || childTasks.length > 0}
                  className="w-full h-11 rounded-lg gap-2 text-white font-semibold shadow-md transition-all duration-300 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: childTasks.length > 0
                      ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
                      : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%)',
                  }}
                >
                  {isBreakingDown ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang phân chia...
                    </>
                  ) : childTasks.length > 0 ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Đã phân chia ({childTasks.length} task)
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Magic Breakdown
                    </>
                  )}
                </Button>
              )}

              {/* Save Button */}
              <Button onClick={handleSave} className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold gap-2 shadow-sm">
                <Save className="w-4 h-4" />
                Lưu công việc
              </Button>

              {/* Delete Button */}
              {task && onDelete && (
                <div className="pt-1">
                  {!showDeleteConfirm ? (
                    <Button
                      id="btn-delete-task"
                      variant="ghost"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full h-10 gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa công việc
                    </Button>
                  ) : (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>
                          Chắc chắn xóa?
                          {childTasks.length > 0 && ` (${childTasks.length} task con sẽ bị xóa)`}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          id="btn-confirm-delete"
                          variant="destructive"
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="flex-1 h-9 rounded-lg gap-1.5"
                        >
                          {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                          Xóa
                        </Button>
                        <Button
                          id="btn-cancel-delete"
                          variant="outline"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 h-9 rounded-lg"
                        >
                          Hủy
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
