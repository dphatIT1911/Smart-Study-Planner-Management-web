import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Plus, Calendar, Clock, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../api';
import { format } from 'date-fns';

const priorityColors = {
  HIGH: 'bg-red-50 text-red-700 border-red-200 shadow-sm',
  MED: 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm',
  LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
};

const statusColors = {
  TODO: 'bg-slate-100 text-slate-700 border-slate-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse-subtle',
  DONE: 'bg-green-50 text-green-700 border-green-200'
};

const statusLabels = {
  TODO: 'To-do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Completed'
};

export default function TaskListPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const data = await api.tasks.getAll();
        setTasks(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        setError('We couldn\'t load your tasks. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleMarkComplete = async (taskId) => {
    try {
      await api.tasks.markComplete(taskId);
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'DONE' } : t));
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'todo') return task.status === 'TODO';
    if (activeTab === 'in-progress') return task.status === 'IN_PROGRESS';
    if (activeTab === 'done') return task.status === 'DONE';
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-gray-500 font-medium">Fetching your assignments...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task List</h1>
          <p className="text-gray-600 mt-2">Organize and track your assignments</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 gap-2">
          <Plus className="w-4 h-4" />
          Add New Task
        </Button>
      </div>

      {error ? (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-center gap-3 text-amber-800 mb-6">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      ) : null}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8 p-1 bg-gray-100/50 backdrop-blur-sm border border-gray-200">
          <TabsTrigger value="all" className="px-6">All Tasks</TabsTrigger>
          <TabsTrigger value="todo" className="px-6 text-gray-600">To-do</TabsTrigger>
          <TabsTrigger value="in-progress" className="px-6 text-blue-600">In Progress</TabsTrigger>
          <TabsTrigger value="done" className="px-6 text-green-600">Done</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <div className="bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No tasks found</h3>
              <p className="text-gray-500 mt-1">Looks like you're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) =>
                <Card key={task.id} className="group hover:border-indigo-200 hover:shadow-md transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-1 h-16 rounded-full flex-shrink-0 transition-all duration-300 group-hover:w-1.5"
                        style={{ backgroundColor: task.subject?.color || '#cbd5e1' }} />
                    
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">{task.title}</h3>
                            <p className="text-sm font-medium text-gray-500 mt-1">{task.subject?.name || 'No Subject'}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Badge variant="outline" className={`${priorityColors[task.priority]} font-bold px-2.5 py-0.5`}>
                              {task.priority}
                            </Badge>
                            <Badge variant="outline" className={`${statusColors[task.status]} font-semibold px-2.5 py-0.5`}>
                              {statusLabels[task.status]}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-500 mt-4">
                          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">Due {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : 'No date'}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="font-medium font-mono">{task.estimated_minutes}m</span>
                          </div>
                        </div>
                      </div>
                      
                      {task.status !== 'DONE' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkComplete(task.id)}
                          className="gap-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all h-auto py-3 px-4 border border-transparent hover:border-green-100">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-semibold">Done</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}