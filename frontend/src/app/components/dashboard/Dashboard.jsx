import { useState, useEffect } from 'react';
import StatCard from './StatCard';
import SubjectCard from './SubjectCard';
import TaskList from './TaskList';
import SessionTracker from './SessionTracker';
import { Badge } from '../ui/badge';
import { Clock, Target, CheckCircle2, TrendingUp, Loader2, Bird } from 'lucide-react';
import { api } from '../../api';

export default function Dashboard() {
  const [greeting, setGreeting] = useState('');
  const [stats, setStats] = useState({
    totalStudyTime: 0,
    estimatedTime: 0,
    completedTasks: 0,
    activeSubjects: 0
  });
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [recentSession, setRecentSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch all necessary data in parallel from REAL API
        const [allSubjects, allTasks, allSessions] = await Promise.all([
          api.subjects.getAll().catch(err => { console.error('Subjects fetch error:', err); return []; }),
          api.tasks.getAll().catch(err => { console.error('Tasks fetch error:', err); return []; }),
          api.sessions.getAll().catch(err => { console.error('Sessions fetch error:', err); return []; })
        ]);

        // Calculate statistics manually from the real data
        const totalMinutes = Array.isArray(allSessions) ? allSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) : 0;
        const estimatedMinutes = Array.isArray(allTasks) ? allTasks.reduce((acc, t) => acc + (t.estimated_minutes || 0), 0) : 0;
        const completed = Array.isArray(allTasks) ? allTasks.filter(t => t.status === 'DONE').length : 0;

        setStats({
          totalStudyTime: totalMinutes,
          estimatedTime: estimatedMinutes,
          completedTasks: completed,
          activeSubjects: Array.isArray(allSubjects) ? allSubjects.length : 0
        });

        setSubjects(Array.isArray(allSubjects) ? allSubjects.slice(0, 4) : []);
        setTasks(Array.isArray(allTasks) ? allTasks.slice(0, 5) : []);
        setRecentSession(Array.isArray(allSessions) ? allSessions[0] || null : null);
        
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Determine Gen Z greeting based on time
    const hour = new Date().getHours();
    if (hour < 5) setGreeting('Cú đêm ơi, chạy deadline rực rỡ nhé! 🦉');
    else if (hour < 11) setGreeting('Sáng rồi đồng chí ơi, bật mode năng suất thuiii ⚡');
    else if (hour < 14) setGreeting('Trưa rồi nạp năng lượng rùi cày tiếp nha 🍔');
    else if (hour < 18) setGreeting('Trời chiều mát mẻ, dứt điểm deadline nào 🌅');
    else setGreeting('Lên đèn lên đồ... à nhầm lên bàn học thui! 🚀');

  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen -mt-20 gap-4">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="text-gray-500 font-bold text-lg tracking-tight uppercase">Đang tổng hợp tiến độ của bạn...</p>
      </div>
    );
  }

  const progressRate = stats.estimatedTime > 0 
    ? Math.round((stats.totalStudyTime / stats.estimatedTime) * 100) 
    : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-indigo-900 tracking-tight">Trạm Học Tập</h1>
            <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-200 uppercase font-black text-xs px-2 py-0.5 rounded-full animate-pulse">Lv.1 Tân Binh</Badge>
          </div>
          <p className="text-indigo-600/80 mt-1 font-semibold text-lg flex items-center gap-2">
             {greeting}
          </p>
        </div>
        <div className="hidden sm:flex h-20 w-20 bg-white rounded-full items-center justify-center shadow-sm border border-indigo-100">
           <Bird className="w-10 h-10 text-indigo-500 animate-bounce" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Tổng thời gian học"
          value={`${stats.totalStudyTime} phút`}
          subtitle={`Dự kiến ${stats.estimatedTime} phút`}
          icon={Clock}
          iconColor="bg-indigo-50 text-indigo-600" />
        
        <StatCard
          title="Công việc đã xong"
          value={stats.completedTasks}
          subtitle="Cố gắng lên!"
          icon={CheckCircle2}
          iconColor="bg-green-50 text-green-600" />
        
        <StatCard
          title="Môn học đang học"
          value={stats.activeSubjects}
          subtitle="Đang tham gia"
          icon={Target}
          iconColor="bg-purple-50 text-purple-600" />
        
        <StatCard
          title="Tỉ lệ tiến độ"
          value={`${progressRate}%`}
          subtitle="Điểm thành tựu"
          icon={TrendingUp}
          iconColor="bg-blue-50 text-blue-600" />
      </div>

      {/* Subject Overview */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Môn học của tôi</h2>
          <button onClick={() => window.location.href = '/subjects'} className="text-indigo-600 font-bold hover:underline">Xem tất cả</button>
        </div>
        
        {subjects.length === 0 ? (
          <div className="bg-indigo-50/30 rounded-3xl p-8 text-center border-2 border-dashed border-indigo-200">
            <div className="flex justify-center mb-3">
              <Bird className="w-12 h-12 text-indigo-300 opacity-80" />
            </div>
            <p className="text-indigo-600 font-bold text-lg">U là trời... Sao trống trơn vậy nè?</p>
            <p className="text-indigo-400 mt-1 font-medium text-sm">Thêm liền một môn học để chim còn có cái đu bám nha!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subjects.map((subject) =>
              <SubjectCard
                key={subject.id}
                name={subject.name}
                semester={subject.semester}
                color={subject.color}
                targetScore={subject.target_score}
                currentProgress={0} />
            )}
          </div>
        )}
      </div>

      {/* Tasks and Session */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <TaskList tasks={tasks} />
        </div>
        <div className="space-y-6">
          <SessionTracker recentSession={recentSession ? {
            subject: recentSession.task?.subject?.name || 'Phiên học nhanh',
            subjectColor: recentSession.task?.subject?.color || '#6366f1',
            durationMinutes: recentSession.duration_minutes || 0,
            notes: recentSession.notes
          } : null} />
        </div>
      </div>
    </div>
  );
}
