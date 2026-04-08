import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CheckCircle2, Clock, Calendar, Play } from 'lucide-react';

const priorityLabels = {
  'LOW': 'Thấp',
  'MED': 'Trung bình',
  'HIGH': 'Cao'
};

const statusLabels = {
  'TODO': 'Cần làm',
  'IN_PROGRESS': 'Đang làm',
  'DONE': 'Hoàn thành'
};

const priorityColors = {
  'LOW': 'bg-green-100 text-green-700 border-green-200',
  'MED': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'HIGH': 'bg-red-100 text-red-700 border-red-200'
};

const statusColors = {
  'TODO': 'bg-gray-100 text-gray-700 border-gray-200',
  'IN_PROGRESS': 'bg-blue-100 text-blue-700 border-blue-200',
  'DONE': 'bg-green-100 text-green-700 border-green-200'
};

export default function TaskTableView({ tasks, onTaskClick, onStartTimer }) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-dashed border-slate-200">
        <p className="text-slate-500 font-medium">Không có công việc nào.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50 border-b border-slate-200">
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold text-slate-700 text-center">Công việc</TableHead>
            <TableHead className="font-semibold text-slate-700">Môn học</TableHead>
            <TableHead className="font-semibold text-slate-700">Thời hạn</TableHead>
            <TableHead className="font-semibold text-slate-700">Độ ưu tiên</TableHead>
            <TableHead className="font-semibold text-slate-700">Trạng thái</TableHead>
            <TableHead className="font-semibold text-slate-700 text-center">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow 
              key={task.id} 
              className="cursor-pointer hover:bg-slate-50/80 transition-colors group"
              onClick={() => onTaskClick(task)}
            >
              <TableCell className="font-medium text-slate-900">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full pl-2" style={{ backgroundColor: task.subject?.color || '#cbd5e1' }} />
                  {task.title}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium text-slate-600 px-2.5 py-1 rounded-md bg-slate-100 ring-1 ring-inset ring-slate-200/50">
                  {task.subject?.name || 'Không có'}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  {task.due_date ? new Date(task.due_date).toLocaleDateString('vi-VN') : 'Không có'}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`${priorityColors[task.priority] || priorityColors['MED']} whitespace-nowrap px-2 py-0.5 font-medium`}>
                  {priorityLabels[task.priority] || task.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`${statusColors[task.status] || statusColors['TODO']} whitespace-nowrap px-2 py-0.5 font-medium`}>
                  {statusLabels[task.status] || task.status}
                </Badge>
              </TableCell>
              <TableCell className="text-center whitespace-nowrap">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity gap-1.5 mr-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 font-semibold"
                  onClick={(e) => onStartTimer && onStartTimer(task, e)}
                >
                  <Play className="w-4 h-4" />
                  Pomodoro
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity gap-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    // Mark complete logic placeholder
                  }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Xong
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
