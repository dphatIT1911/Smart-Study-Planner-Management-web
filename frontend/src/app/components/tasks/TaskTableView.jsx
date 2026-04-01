import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CheckCircle2, Clock, Calendar } from 'lucide-react';

const priorityColors = {
  'Thấp': 'bg-green-100 text-green-700 border-green-200',
  'Trung bình': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Cao': 'bg-red-100 text-red-700 border-red-200'
};

const statusColors = {
  'Cần làm': 'bg-gray-100 text-gray-700 border-gray-200',
  'Đang làm': 'bg-blue-100 text-blue-700 border-blue-200',
  'Hoàn thành': 'bg-green-100 text-green-700 border-green-200'
};

export default function TaskTableView({ tasks, onTaskClick }) {
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
            <TableHead className="w-[300px] font-semibold text-slate-700">Công việc</TableHead>
            <TableHead className="font-semibold text-slate-700">Môn học</TableHead>
            <TableHead className="font-semibold text-slate-700">Thời hạn</TableHead>
            <TableHead className="font-semibold text-slate-700">Độ ưu tiên</TableHead>
            <TableHead className="font-semibold text-slate-700">Trạng thái</TableHead>
            <TableHead className="text-right font-semibold text-slate-700">Hành động</TableHead>
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
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.subjectColor }} />
                  {task.title}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium text-slate-600 px-2.5 py-1 rounded-md bg-slate-100 ring-1 ring-inset ring-slate-200/50">
                  {task.subject}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  {task.dueDate}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`${priorityColors[task.priority]} whitespace-nowrap px-2 py-0.5 font-medium`}>
                  {task.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`${statusColors[task.status]} whitespace-nowrap px-2 py-0.5 font-medium`}>
                  {task.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
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
