import { useState, useEffect } from 'react';
import StatCard from './StatCard';
import SubjectCard from './SubjectCard';
import TaskList from './TaskList';
import SessionTracker from './SessionTracker';
import { Clock, Target, CheckCircle2, TrendingUp, Loader2 } from 'lucide-react';
import { api } from '../../api';

export default function Dashboard() {
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
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Bảng điều khiển</h1>
        <p className="text-gray-500 mt-2 font-medium">Chào mừng trở lại! Đây là tổng quan học tập của bạn hôm nay.</p>
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
          <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
            <p className="text-gray-500 font-medium">Chưa tìm thấy môn học nào. Hãy thêm môn học để xem tại đây.</p>
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
