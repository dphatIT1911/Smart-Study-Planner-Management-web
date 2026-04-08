import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Clock, Calendar, Play } from 'lucide-react';
import { Button } from '../ui/button';

const statusLabels = {
  'TODO': 'Cần làm',
  'IN_PROGRESS': 'Đang làm',
  'DONE': 'Hoàn thành'
};

const priorityLabels = {
  'LOW': 'Thấp',
  'MED': 'Trung bình',
  'HIGH': 'Cao'
};

const priorityColors = {
  'LOW': 'bg-green-100 text-green-700 border-green-200',
  'MED': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'HIGH': 'bg-red-100 text-red-700 border-red-200'
};

const columns = [
  { id: 'TODO', title: 'Cần làm', color: 'bg-gray-100 text-gray-700' },
  { id: 'IN_PROGRESS', title: 'Đang làm', color: 'bg-blue-100 text-blue-700' },
  { id: 'DONE', title: 'Hoàn thành', color: 'bg-green-100 text-green-700' }
];

export default function TaskBoardView({ tasks, onTaskClick, onStartTimer }) {
  // Simple grouping
  const getTasksByStatus = (statusId) => tasks.filter(task => task.status === statusId);

  return (
    <div className="flex gap-6 overflow-x-auto h-full min-h-0 pb-2">
      {columns.map(col => {
        const columnTasks = getTasksByStatus(col.id);
        
        return (
          <div key={col.id} className="flex-1 min-w-[320px] max-w-sm bg-slate-50 rounded-xl p-4 flex flex-col gap-3 border border-slate-100 h-full min-h-0">
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
            <div className="flex-1 flex flex-col gap-3 min-h-[150px] overflow-y-auto overflow-x-hidden pr-2 pb-2 scrollbar-thin">
              {columnTasks.map(task => (
                <Card 
                  key={task.id} 
                  className="cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all active:scale-[0.98] border-slate-200 shrink-0"
                  onClick={() => onTaskClick(task)}
                >
                  <CardContent className="p-4 space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: task.subject?.color || '#6366f1' }} />
                    <div className="pl-2">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border-slate-200 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]`} style={{ color: task.subject?.color || '#333' }}>
                          {task.subject?.name || 'Không có'}
                        </Badge>
                        <Badge variant="outline" className={`${priorityColors[task.priority] || priorityColors['MED']} border-transparent text-[10px] px-1.5 py-0`}>
                          {priorityLabels[task.priority] || task.priority}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-slate-900 text-sm leading-tight mb-2">
                        {task.title}
                      </h4>
                      
                      <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{task.due_date ? new Date(task.due_date).toLocaleDateString('vi-VN') : 'Không có'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{task.estimated_minutes || 0}p</span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded bg-slate-50 border border-indigo-100/50 transition-colors flex items-center gap-1"
                          onClick={(e) => onStartTimer && onStartTimer(task, e)}
                        >
                          <Play className="w-3 h-3" />
                          Pomodoro
                        </Button>
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
