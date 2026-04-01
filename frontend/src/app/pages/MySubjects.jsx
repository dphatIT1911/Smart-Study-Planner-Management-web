import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Plus, BookOpen, Loader2, X } from 'lucide-react';
import { api } from '../api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function MySubjects() {
  const [subjects, setSubjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    semester: 'Spring 2026',
    credits: 3,
    target_score: 8.5,
    color: '#6366f1'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subjectsData, tasksData] = await Promise.all([
        api.subjects.getAll(),
        api.tasks.getAll()
      ]);
      setSubjects(subjectsData);
      setAllTasks(tasksData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Unable to load data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDetails = (subject) => {
    setSelectedSubject(subject);
    setIsDetailsOpen(true);
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.id) throw new Error("User session not found");

      await api.subjects.create({
        ...newSubject,
        user_id: user.id,
        credits: parseInt(newSubject.credits),
        target_score: parseFloat(newSubject.target_score)
      });
      
      setIsModalOpen(false);
      setNewSubject({
        name: '',
        semester: 'Spring 2026',
        credits: 3,
        target_score: 8.5,
        color: '#6366f1'
      });
      await fetchData();
    } catch (err) {
      alert(err.message || "Failed to create subject");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSubjectTasks = (subjectId) => {
    return allTasks.filter(task => task.subject_id === subjectId);
  };

  const calculateProgress = (subjectId) => {
    const tasks = getSubjectTasks(subjectId);
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === 'DONE').length;
    return Math.round((completed / tasks.length) * 100);
  };

  if (loading && subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-gray-500 font-medium italic">Loading your study plan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-2">Oops!</h2>
          <p>{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4 border-red-300 hover:bg-red-100">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Subjects</h1>
          <p className="text-gray-600 mt-2">Manage your courses and track progress</p>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700 gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </Button>
      </div>

      {subjects.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">No subjects yet</h3>
              <p className="text-gray-500 mt-1 max-w-sm">Start your journey by adding your first subject to track your progress effectively.</p>
            </div>
            <Button 
              size="lg" 
              className="bg-indigo-600 mt-2 gap-2"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Add First Subject
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => {
             const progress = calculateProgress(subject.id); 
             
             return (
               <Card key={subject.id} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-gray-100 shadow-sm">
                 <div
                   className="absolute top-0 left-0 right-0 h-1.5"
                   style={{ backgroundColor: subject.color || '#6366f1' }} />
               
                 <CardHeader>
                   <div className="flex items-start gap-4">
                     <div
                       className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                       style={{ backgroundColor: (subject.color || '#6366f1') + '20' }}>
                     
                       <BookOpen className="w-6 h-6" style={{ color: subject.color || '#6366f1' }} />
                     </div>
                     <div className="flex-1 min-w-0">
                       <CardTitle className="text-xl mb-1 truncate">{subject.name}</CardTitle>
                       <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">{subject.semester}</p>
                     </div>
                   </div>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="grid grid-cols-2 gap-4 text-sm">
                     <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                       <p className="text-gray-400 text-xs font-bold uppercase mb-1">Status</p>
                       <p className="font-semibold text-gray-700">Active</p>
                     </div>
                     <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                       <p className="text-gray-400 text-xs font-bold uppercase mb-1">Credits</p>
                       <p className="font-semibold text-gray-700">{subject.credits}</p>
                     </div>
                   </div>
                   
                   <div>
                     <div className="flex justify-between text-sm mb-2">
                       <span className="text-gray-500 font-medium">Study Completion</span>
                       <span className="font-bold text-gray-900">{progress}%</span>
                     </div>
                     <Progress value={progress} className="h-2.5 bg-gray-100" />
                   </div>

                   <div className="flex justify-between items-center pt-4 border-t border-gray-50 mt-2">
                     <div className="text-sm flex items-center gap-2">
                       <span className="text-gray-400 font-medium">Target: </span>
                       <span className="font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-base">{subject.target_score}</span>
                     </div>
                     <Button 
                       variant="ghost" 
                       size="sm" 
                       className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-semibold gap-1"
                       onClick={() => handleOpenDetails(subject)}
                     >
                       Details 
                     </Button>
                   </div>
                 </CardContent>
               </Card>
             );
          })}
        </div>
      )}

      {/* Add Subject Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleCreateSubject}>
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
              <DialogDescription>
                Fill in the details to start tracking a new subject.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input
                  id="name"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                  className="col-span-3"
                  placeholder="e.g. Advanced Mathematics"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="semester" className="text-right">Semester</Label>
                <Input
                  id="semester"
                  value={newSubject.semester}
                  onChange={(e) => setNewSubject({...newSubject, semester: e.target.value})}
                  className="col-span-3"
                  placeholder="e.g. Spring 2026"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="credits" className="text-right">Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  min="1"
                  max="10"
                  value={newSubject.credits}
                  onChange={(e) => setNewSubject({...newSubject, credits: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="target" className="text-right">Target GPA</Label>
                <Input
                  id="target"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={newSubject.target_score}
                  onChange={(e) => setNewSubject({...newSubject, target_score: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="color" className="text-right">Color</Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={newSubject.color}
                    onChange={(e) => setNewSubject({...newSubject, color: e.target.value})}
                    className="w-12 h-10 p-1 rounded-md"
                  />
                  <Input
                    value={newSubject.color}
                    onChange={(e) => setNewSubject({...newSubject, color: e.target.value})}
                    className="flex-1"
                    placeholder="#6366f1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Add Subject
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: (selectedSubject?.color || '#6366f1') + '20' }}
              >
                <BookOpen className="w-6 h-6" style={{ color: selectedSubject?.color || '#6366f1' }} />
              </div>
              <DialogTitle className="text-2xl">{selectedSubject?.name}</DialogTitle>
            </div>
            <DialogDescription>
              Detailed view and tasks for {selectedSubject?.semester}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                <p className="text-gray-400 text-[10px] font-bold uppercase mb-1">Credits</p>
                <p className="text-xl font-bold text-gray-800">{selectedSubject?.credits}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                <p className="text-gray-400 text-[10px] font-bold uppercase mb-1">Target</p>
                <p className="text-xl font-bold text-indigo-600">{selectedSubject?.target_score}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                <p className="text-gray-400 text-[10px] font-bold uppercase mb-1">Progress</p>
                <p className="text-xl font-bold text-green-600">{calculateProgress(selectedSubject?.id)}%</p>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
                Associated Tasks
                <span className="text-xs font-normal text-gray-400">{getSubjectTasks(selectedSubject?.id).length} tasks total</span>
              </h3>
              
              <div className="space-y-3">
                {getSubjectTasks(selectedSubject?.id).length === 0 ? (
                  <p className="text-sm text-gray-400 italic py-4 text-center bg-gray-50 rounded-lg border border-dashed">
                    No tasks added for this subject yet.
                  </p>
                ) : (
                  getSubjectTasks(selectedSubject?.id).map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${task.status === 'DONE' ? 'bg-green-500' : 'bg-amber-500'}`} />
                        <div>
                          <p className={`text-sm font-semibold ${task.status === 'DONE' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                            {task.title}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">{task.priority} Priority</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {task.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
            <Button className="bg-indigo-600" onClick={() => {
              setIsDetailsOpen(false);
              // Navigate or open add task modal logic could go here
            }}>
              Go to Task List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}