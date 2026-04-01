import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Clock, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { api } from '../api';
import { format, subMinutes } from 'date-fns';
import { toast } from 'sonner';
import Mascot from '../components/mascot/Mascot';

export default function StudySessions() {
  const [sessions, setSessions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newSession, setNewSession] = useState({
    task_id: '',
    duration_minutes: 25,
    notes: ''
  });

  const [stats, setStats] = useState({
    totalMinutes: 0,
    averagePerDay: 0,
    longestSession: 0
  });

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const [sessionsData, tasksData] = await Promise.all([
        api.sessions.getAll(),
        api.tasks.getAll()
      ]);
      setSessions(sessionsData);
      setTasks(tasksData.filter(t => t.status !== 'DONE')); // Only show active tasks
      
      // Calculate basic stats
      if (sessionsData.length > 0) {
        const total = sessionsData.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
        const longest = Math.max(...sessionsData.map(s => s.duration_minutes || 0));
        const avg = total / sessionsData.length; // Simplified avg
        
        setStats({
          totalMinutes: total,
          averagePerDay: Math.round(avg * 10) / 10,
          longestSession: longest
        });
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!newSession.task_id) {
      toast.error('Opps!', { description: "Quên chọn công việc mất rồi kìa!" });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const endTime = new Date();
      const startTime = subMinutes(endTime, newSession.duration_minutes);
      
      await api.sessions.create({
        task_id: parseInt(newSession.task_id),
        duration_minutes: parseInt(newSession.duration_minutes),
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        notes: newSession.notes || undefined
      });
      
      setIsModalOpen(false);
      setNewSession({ task_id: '', duration_minutes: 25, notes: '' });
      toast.success('Cháy quá bạn ơi! 🔥', { description: 'Giữ vững phong độ này nhé.' });
      await fetchSessions();
    } catch (err) {
      toast.error('Lỗi rùi!', { description: err.message || 'Không thể bay lên mây để lưu thông tin' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-gray-500 font-medium italic">Đang tải lịch sử học tập...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Phiên học</h1>
          <p className="text-gray-600 mt-2">Theo dõi thời gian học và năng suất của bạn</p>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700 gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Ghi lại phiên học
        </Button>
      </div>

      {/* Record Session Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleCreateSession}>
            <DialogHeader>
              <DialogTitle>Ghi lại phiên học</DialogTitle>
              <DialogDescription>
                Bạn vừa học xong? Hãy ghi lại thời gian để tích lũy điểm tiến độ nhé.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="task">Thuộc công việc nào?</Label>
                <Select 
                  value={newSession.task_id} 
                  onValueChange={(val) => setNewSession({...newSession, task_id: val})}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Chọn công việc --" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks.length === 0 ? (
                      <SelectItem value="none" disabled>Không có công việc nào đang diễn ra</SelectItem>
                    ) : (
                      tasks.map(task => (
                        <SelectItem key={task.id} value={task.id.toString()}>
                          {task.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid items-center gap-2">
                <Label htmlFor="duration">Thời gian (phút)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="240"
                  value={newSession.duration_minutes}
                  onChange={(e) => setNewSession({...newSession, duration_minutes: e.target.value})}
                  required
                />
              </div>
              <div className="grid items-center gap-2">
                <Label htmlFor="notes">Ghi chú thêm (không bắt buộc)</Label>
                <Input
                  id="notes"
                  value={newSession.notes}
                  onChange={(e) => setNewSession({...newSession, notes: e.target.value})}
                  placeholder="Bạn đã học được gì?"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={isSubmitting || !newSession.task_id} className="bg-indigo-600">
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Lưu phiên học"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Weekly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Tuần này
            </CardTitle>
            <Clock className="w-4 h-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-gray-900">
              {stats.totalMinutes} <span className="text-sm font-normal text-gray-400">phút</span>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1 font-medium">
              <span className="text-green-500">↑</span> Tổng thời gian học
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Trung bình mỗi ngày
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-gray-900">
              {stats.averagePerDay} <span className="text-sm font-normal text-gray-400">phút</span>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1 font-medium">
              Mỗi ngày
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Phiên học dài nhất
            </CardTitle>
            <Clock className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-gray-900">
              {stats.longestSession} <span className="text-sm font-normal text-gray-400">phút</span>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1 font-medium">
              Tuần này
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.length === 0 ? (
           <Card className="p-12 text-center border-dashed border-2 bg-indigo-50/30 border-indigo-200">
              <div className="flex flex-col items-center gap-3">
                 <div className="w-20 h-20 flex items-center justify-center">
                  <Mascot size={70} mood="sleep" animate={true} />
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-indigo-900 mt-2">Chưa có ai học hết trơn!</h3>
                   <p className="text-indigo-500 font-medium text-sm mt-1">Bấm nút "Ghi lại" và cày ngay cho Bíp Bíp vui nào 🚀</p>
                </div>
              </div>
           </Card>
        ) : (
          sessions.map((session) =>
            <Card key={session.id} className="group hover:border-gray-200 transition-all shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-5">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: (session.task?.subject?.color || '#6366f1') + '15' }}>
                  
                    <Clock className="w-7 h-7" style={{ color: session.task?.subject?.color || '#6366f1' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {session.task?.title || 'Phiên học tự do'}
                        </h3>
                        <p className="text-sm font-semibold text-gray-400 uppercase tracking-tight mt-0.5">
                          {session.task?.subject?.name || 'Học tập nhanh'}
                        </p>
                        <div className="flex items-center gap-5 mt-4 text-sm text-gray-500 font-medium">
                          <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{session.start_time ? format(new Date(session.start_time), 'dd/MM/yyyy') : 'Gần đây'}</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>
                              {format(new Date(session.start_time), 'HH:mm')} - {session.end_time ? format(new Date(session.end_time), 'HH:mm') : 'Bây giờ'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-lg px-4 py-1.5 font-black rounded-xl"
                        style={{
                          borderColor: (session.task?.subject?.color || '#6366f1') + '50',
                          backgroundColor: (session.task?.subject?.color || '#6366f1') + '05',
                          color: session.task?.subject?.color || '#6366f1'
                        }}>
                      
                        {session.duration_minutes || '?'} <span className="text-xs font-bold ml-1 opacity-70">PHÚT</span>
                      </Badge>
                    </div>
                    {session.notes &&
                      <div className="mt-4 pt-4 border-t border-gray-50">
                        <p className="text-sm text-gray-600 italic">" {session.notes} "</p>
                      </div>
                    }
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
