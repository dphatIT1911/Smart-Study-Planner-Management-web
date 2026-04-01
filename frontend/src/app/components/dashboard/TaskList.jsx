import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar, Clock } from 'lucide-react';















import { format } from 'date-fns';

const priorityColors = {
  LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MED: 'bg-amber-50 text-amber-700 border-amber-200',
  HIGH: 'bg-red-50 text-red-700 border-red-200'
};

const statusColors = {
  TODO: 'bg-slate-50 text-slate-700 border-slate-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
  DONE: 'bg-green-50 text-green-700 border-green-200'
};

const statusLabels = {
  TODO: 'To-do',
  IN_PROGRESS: 'Learning',
  DONE: 'Finished'
};

export default function TaskList({ tasks }) {
  return (
    <Card className="border-none shadow-md bg-white overflow-hidden">
      <CardHeader className="border-b border-gray-50 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold text-gray-800">Coming Up</CardTitle>
        <Badge variant="secondary" className="font-bold bg-indigo-50 text-indigo-700 border-indigo-100">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </Badge>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-400 font-medium italic">No upcoming tasks</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="p-5 border border-gray-100 rounded-2xl hover:border-indigo-100 hover:shadow-sm transition-all duration-300 bg-white group cursor-default"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{task.title}</h4>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                      {task.subject?.name || 'Uncategorized'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={`${priorityColors[task.priority]} font-bold px-2 py-0.5 border`}>
                      {task.priority || 'MED'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-xs text-gray-500 font-bold">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-300" />
                    <span>{task.due_date ? format(new Date(task.due_date), 'MMM dd') : 'No date'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-300" />
                    <span className="font-mono">{task.estimated_minutes}M</span>
                  </div>
                  <div className="ml-auto">
                     <Badge className={`${statusColors[task.status] || 'bg-gray-50 text-gray-700'} font-black tracking-tight text-[10px] py-0 px-2`}>
                        {statusLabels[task.status] || 'N/A'}
                     </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}