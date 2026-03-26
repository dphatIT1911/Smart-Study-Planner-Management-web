import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar, Clock } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  priority: 'Low' | 'Med' | 'High';
  status: 'To-do' | 'In-progress' | 'Done';
  estimatedMinutes: number;
}

interface TaskListProps {
  tasks: Task[];
}

const priorityColors = {
  Low: 'bg-green-100 text-green-700 border-green-200',
  Med: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  High: 'bg-red-100 text-red-700 border-red-200',
};

const statusColors = {
  'To-do': 'bg-gray-100 text-gray-700 border-gray-200',
  'In-progress': 'bg-blue-100 text-blue-700 border-blue-200',
  'Done': 'bg-green-100 text-green-700 border-green-200',
};

export default function TaskList({ tasks }: TaskListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Coming Up</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-200 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  <p className="text-sm text-gray-500 mt-0.5">{task.subject}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className={priorityColors[task.priority]}>
                    {task.priority}
                  </Badge>
                  <Badge variant="outline" className={statusColors[task.status]}>
                    {task.status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{task.dueDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{task.estimatedMinutes} min</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
