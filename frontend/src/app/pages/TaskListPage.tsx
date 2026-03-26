import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Plus, Calendar, Clock, CheckCircle2 } from 'lucide-react';

const tasks = [
  {
    id: '1',
    title: 'Complete Chapter 5 Exercises',
    subject: 'Advanced Mathematics',
    subjectColor: '#6366f1',
    dueDate: 'Mar 28, 2026',
    priority: 'High' as const,
    status: 'In-progress' as const,
    estimatedMinutes: 90,
  },
  {
    id: '2',
    title: 'Build Binary Search Tree',
    subject: 'Data Structures',
    subjectColor: '#8b5cf6',
    dueDate: 'Mar 29, 2026',
    priority: 'Med' as const,
    status: 'To-do' as const,
    estimatedMinutes: 120,
  },
  {
    id: '3',
    title: 'Design Portfolio Website',
    subject: 'Web Development',
    subjectColor: '#ec4899',
    dueDate: 'Mar 30, 2026',
    priority: 'Med' as const,
    status: 'In-progress' as const,
    estimatedMinutes: 180,
  },
  {
    id: '4',
    title: 'SQL Query Practice',
    subject: 'Database Systems',
    subjectColor: '#14b8a6',
    dueDate: 'Mar 27, 2026',
    priority: 'Low' as const,
    status: 'To-do' as const,
    estimatedMinutes: 60,
  },
  {
    id: '5',
    title: 'Linear Algebra Assignment',
    subject: 'Advanced Mathematics',
    subjectColor: '#6366f1',
    dueDate: 'Mar 25, 2026',
    priority: 'High' as const,
    status: 'Done' as const,
    estimatedMinutes: 75,
  },
];

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

export default function TaskListPage() {
  const [activeTab, setActiveTab] = useState('all');

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'todo') return task.status === 'To-do';
    if (activeTab === 'in-progress') return task.status === 'In-progress';
    if (activeTab === 'done') return task.status === 'Done';
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task List</h1>
          <p className="text-gray-600 mt-2">Organize and track your assignments</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="todo">
            To-do ({tasks.filter(t => t.status === 'To-do').length})
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            In Progress ({tasks.filter(t => t.status === 'In-progress').length})
          </TabsTrigger>
          <TabsTrigger value="done">
            Done ({tasks.filter(t => t.status === 'Done').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-1 h-16 rounded-full flex-shrink-0"
                      style={{ backgroundColor: task.subjectColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900">{task.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{task.subject}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Badge variant="outline" className={priorityColors[task.priority]}>
                            {task.priority}
                          </Badge>
                          <Badge variant="outline" className={statusColors[task.status]}>
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-500 mt-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Due {task.dueDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{task.estimatedMinutes} minutes</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Complete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
