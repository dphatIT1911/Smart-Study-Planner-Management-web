import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Clock, Calendar } from 'lucide-react';

const priorityColors = {
  'Thấp': 'bg-green-100 text-green-700 border-green-200',
  'Trung bình': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Cao': 'bg-red-100 text-red-700 border-red-200'
};

const columns = [
  { id: 'Cần làm', title: 'Cần làm', color: 'bg-gray-100 text-gray-700' },
  { id: 'Đang làm', title: 'Đang làm', color: 'bg-blue-100 text-blue-700' },
  { id: 'Hoàn thành', title: 'Hoàn thành', color: 'bg-green-100 text-green-700' }
];

export default function TaskBoardView({ tasks, onTaskClick }) {
  // Simple grouping
  const getTasksByStatus = (statusId) => tasks.filter(task => task.status === statusId);

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 h-full min-h-[500px]">
      {columns.map(col => {
        const columnTasks = getTasksByStatus(col.id);
        
        return (
          <div key={col.id} className="flex-1 min-w-[320px] max-w-sm bg-slate-50 rounded-xl p-4 flex flex-col gap-4 border border-slate-100">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${col.color}`}>
                  {col.title}
                </span>
                <span className="text-sm font-medium text-slate-500 bg-white shadow-sm rounded-full w-6 h-6 flex items-center justify-center">
                  {columnTasks.length}
                </span>
              </div>
            </div>

            {/* Droppable Area / Task List */}
            <div className="flex-1 flex flex-col gap-3 min-h-[150px]">
              {columnTasks.map(task => (
                <Card 
                  key={task.id} 
                  className="cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all active:scale-[0.98] border-slate-200"
                  onClick={() => onTaskClick(task)}
                >
                  <CardContent className="p-4 space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: task.subjectColor || '#6366f1' }} />
                    <div className="pl-2">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border-slate-200 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]`} style={{ color: task.subjectColor }}>
                          {task.subject}
                        </Badge>
                        <Badge variant="outline" className={`${priorityColors[task.priority]} border-transparent text-[10px] px-1.5 py-0`}>
                          {task.priority}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-slate-900 text-sm leading-tight mb-2">
                        {task.title}
                      </h4>
                      
                      <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{task.dueDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{task.estimatedMinutes}p</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {columnTasks.length === 0 && (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg text-sm text-slate-400 font-medium py-8 bg-slate-50/50">
                  Kéo thả công việc vào đây
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
