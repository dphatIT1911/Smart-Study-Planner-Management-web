import { useState, useEffect } from 'react';
import StatCard from './StatCard';
import SubjectCard from './SubjectCard';
import TaskList from './TaskList';
import RecentSessionsCard from './RecentSessionsCard';
import { Badge } from '../ui/badge';
import { Clock, Target, CheckCircle2, TrendingUp, Loader2, Flame, AlertCircle } from 'lucide-react';
import Mascot from '../mascot/Mascot';
import { api } from '../../api';

export default function Dashboard() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [greeting, setGreeting] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeClosing, setWelcomeClosing] = useState(false);
  const [streakNotification, setStreakNotification] = useState(null); // { type: 'success' | 'loss', count: number }
  const [stats, setStats] = useState({
    totalStudyTime: 0,
    estimatedTime: 0,
    completedTasks: 0,
    activeSubjects: 0
  });
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const closeWelcome = () => {
    setWelcomeClosing(true);
    setTimeout(() => {
      setShowWelcome(false);
      setWelcomeClosing(false);
    }, 400);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch profile first to get updated streak
        const updatedUser = await api.getProfile();
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Streak Notification Logic
        if (!sessionStorage.getItem('streakNotified')) {
          const now = new Date();
          const todayStr = now.toISOString().split('T')[0];

          // Check for loss notification
          if (updatedUser.streak_lost_at) {
            const lostDateStr = new Date(updatedUser.streak_lost_at).toISOString().split('T')[0];
            if (lostDateStr === todayStr) {
              setStreakNotification({ type: 'loss' });
            }
          }
          // Check for success notification (if streak increased today)
          else if (updatedUser.streak_count > 0) {
            setStreakNotification({ type: 'success', count: updatedUser.streak_count });
          }
          sessionStorage.setItem('streakNotified', 'true');
        }

        // Fetch other data in parallel
        const [allSubjects, allTasks, allSessions] = await Promise.all([
          api.subjects.getAll().catch(err => { console.error('Subjects fetch error:', err); return []; }),
          api.tasks.getAll().catch(err => { console.error('Tasks fetch error:', err); return []; }),
          api.sessions.getAll().catch(err => { console.error('Sessions fetch error:', err); return []; })
        ]);

        // Calculate statistics
        const totalMinutes = Array.isArray(allSessions) ? allSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) : 0;
        const estimatedMinutes = Array.isArray(allTasks) ? allTasks.reduce((acc, t) => acc + (t.estimated_minutes || 0), 0) : 0;
        const completed = Array.isArray(allTasks) ? allTasks.filter(t => t.status === 'DONE').length : 0;

        const activeSubs = Array.isArray(allSubjects) ? allSubjects.filter(s => !s.semester?.includes('(DONE)')) : [];
        
        setStats({
          totalStudyTime: totalMinutes,
          estimatedTime: estimatedMinutes,
          completedTasks: completed,
          activeSubjects: activeSubs.length
        });

        setSubjects(activeSubs.slice(0, 4));

        const safeParseDate = (dateStr) => {
          if (!dateStr) return null;
          const formattedStr = dateStr.includes('T') && !dateStr.endsWith('Z') && !dateStr.includes('+')
            ? `${dateStr}Z`
            : dateStr;
          return new Date(formattedStr);
        };

        const mappedTasks = Array.isArray(allTasks) ? allTasks.map(task => ({
          ...task,
          subject: task.subject_id ? allSubjects.find(s => s.id?.toString() === task.subject_id?.toString()) : null,
          parsedDueDate: task.due_date ? safeParseDate(task.due_date) : null
        })) : [];

        // Hiển thị các Task sắp tới mà chưa hoàn thành (Chỉ lấy task có đặt deadline)
        const upcomingPendingTasks = mappedTasks
          .filter(t => t.status !== 'DONE' && t.parsedDueDate != null)
          .sort((a, b) => a.parsedDueDate - b.parsedDueDate);

        setTasks(upcomingPendingTasks.slice(0, 5));

        const mappedSessions = Array.isArray(allSessions) ? allSessions.map(session => {
          const task = mappedTasks.find(t => t.id?.toString() === session.task_id?.toString());
          const parsedStart = safeParseDate(session.start_time);
          const parsedEnd = session.end_time ? safeParseDate(session.end_time) : null;
          return { ...session, task, parsedStart, parsedEnd };
        }) : [];

        mappedSessions.sort((a, b) => (b.parsedEnd || b.parsedStart) - (a.parsedEnd || a.parsedStart));

        const recent = mappedSessions.slice(0, 5).map(s => ({
          id: s.id,
          durationMinutes: s.duration_minutes || 0,
          localDate: s.parsedStart ? s.parsedStart.toLocaleDateString('vi-VN') : 'Gần đây',
          subject: s.task?.title || 'Phiên học nhanh',
          subjectColor: s.task?.subject?.color || '#6366f1',
          notes: s.notes
        }));

        setRecentSessions(recent);

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Determine Gen Z greeting
    const hour = new Date().getHours();
    let currentGreeting = '';
    if (hour < 5) currentGreeting = 'Cú đêm ơi, chạy deadline rực rỡ nhé!';
    else if (hour < 11) currentGreeting = 'Sáng rồi đồng chí ơi, bật mode năng suất thuiii';
    else if (hour < 14) currentGreeting = 'Trưa rồi nạp năng lượng rùi cày tiếp nha';
    else if (hour < 18) currentGreeting = 'Trời chiều mát mẻ, dứt điểm deadline nào';
    else currentGreeting = 'Lên đèn lên đồ... à nhầm lên bàn học thui!';

    setGreeting(currentGreeting);

    if (!sessionStorage.getItem('hasWelcomed_genz')) {
      setTimeout(() => {
        setShowWelcome(true);
        sessionStorage.setItem('hasWelcomed_genz', 'true');
        setTimeout(() => {
          closeWelcome();
        }, 5000);
      }, 800);
    }
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

      {/* Streak Notification Popup */}
      {streakNotification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-4 duration-500">
          {streakNotification.type === 'success' ? (
            <div className="bg-white border-2 border-orange-100 shadow-xl rounded-2xl px-6 py-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center animate-bounce">
                <Flame className="w-7 h-7 text-orange-600 fill-orange-600" />
              </div>
              <div>
                <p className="font-black text-indigo-900 leading-none">Căng đét! 🔥</p>
                <p className="text-sm text-indigo-600 font-bold mt-1">Bạn đã học {streakNotification.count} ngày liên tiếp!</p>
              </div>
              <button onClick={() => setStreakNotification(null)} className="ml-4 text-gray-300 hover:text-gray-500">×</button>
            </div>
          ) : (
            <div className="bg-slate-100 border-2 border-slate-200 shadow-xl rounded-2xl px-6 py-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                <Flame className="w-7 h-7 text-slate-400" />
              </div>
              <div>
                <p className="font-black text-slate-600 leading-none">Uầy, dập lửa mất tiêu rồi... 🌫️</p>
                <p className="text-sm text-slate-500 font-medium mt-1">Ngày đầu mất chuỗi hơi xám xịt, nhưng đừng bỏ cuộc nha!</p>
              </div>
              <button onClick={() => setStreakNotification(null)} className="ml-4 text-gray-400 hover:text-gray-600">×</button>
            </div>
          )}
        </div>
      )}

      {/* Welcome Popup Overlay */}
      {showWelcome && (
        <div
          onClick={closeWelcome}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: welcomeClosing ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.5)',
            backdropFilter: welcomeClosing ? 'blur(0px)' : 'blur(4px)',
            transition: 'background-color 0.4s ease, backdrop-filter 0.4s ease',
            animation: welcomeClosing ? undefined : 'welcomeOverlayIn 0.4s ease forwards',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 30%, #c7d2fe 100%)',
              borderRadius: '2rem',
              padding: '3rem 3.5rem',
              maxWidth: '520px',
              width: '90vw',
              textAlign: 'center',
              boxShadow: '0 25px 60px rgba(99, 102, 241, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1)',
              transform: welcomeClosing ? 'scale(0.85)' : undefined,
              opacity: welcomeClosing ? 0 : undefined,
              transition: welcomeClosing ? 'transform 0.4s ease, opacity 0.4s ease' : undefined,
              animation: welcomeClosing ? undefined : 'welcomePopIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            }}
          >
            <div style={{ marginBottom: '0.5rem' }}>
              <Mascot size={100} mood={streakNotification?.type === 'loss' ? 'sleep' : 'cheer'} animate={true} />
            </div>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              color: '#3730a3',
              marginBottom: '0.75rem',
              letterSpacing: '-0.02em',
            }}>
              {streakNotification?.type === 'loss' ? 'Huhu, Bíp Bíp buồn quá!' : 'Bíp bíp! Chào bạn nè!'}
            </h2>
            <p style={{
              fontSize: '1.15rem',
              fontWeight: 600,
              color: '#4338ca',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
            }}>
              {greeting}
              <br />
              <span style={{ opacity: 0.75, fontSize: '1rem' }}>
                {streakNotification?.type === 'success' ? ` Bạn đang có chuỗi ${streakNotification.count} ngày rực cháy nè!` : 'Chúc bạn học thật vui!'}
              </span>
            </p>
            <button
              onClick={closeWelcome}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: '#fff',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.75rem 2.5rem',
                fontSize: '1rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => { e.target.style.transform = 'scale(1.05)'; e.target.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)'; }}
              onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.4)'; }}
            >
              Cày thôi nào!
            </button>
          </div>
        </div>
      )}

      {/* Keyframe animations */}
      <style>{`
        @keyframes welcomeOverlayIn {
          from { background-color: rgba(0,0,0,0); backdrop-filter: blur(0px); }
          to { background-color: rgba(0,0,0,0.5); backdrop-filter: blur(4px); }
        }
        @keyframes welcomePopIn {
          from { transform: scale(0.6); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes flameFlash {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0px #ef4444); }
          50% { transform: scale(1.15); filter: drop-shadow(0 0 10px #ef4444); }
        }
        .animate-flame {
          animation: flameFlash 1.5s infinite ease-in-out;
        }
      `}</style>

      {/* Header */}
      <div className="mb-10 flex items-center justify-between bg-white shadow-sm p-8 rounded-3xl border border-indigo-100/50">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-3">
            <h1 className="text-4xl font-black text-indigo-900 tracking-tight">Trạm Học Tập</h1>

            {/* Streak Icon (Mới) */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 transition-all ${user.streak_count >= 2 ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-100'}`}>
              <Flame className={`w-5 h-5 ${user.streak_count >= 2 ? 'text-orange-600 fill-orange-600 animate-flame' : 'text-slate-300'}`} />
              <span className={`text-sm font-black ${user.streak_count >= 2 ? 'text-orange-700' : 'text-slate-400'}`}>
                {user.streak_count || 0}
              </span>
            </div>
          </div>
          <p className="text-indigo-600/80 mt-1 font-semibold text-lg flex items-center gap-2">
            {greeting}
          </p>
        </div>
        <div className="hidden sm:flex items-center justify-center">
          <Mascot size={110} mood={user.streak_count >= 2 ? 'cheer' : 'happy'} animate={true} />
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
              <Mascot size={70} mood="sleep" animate={true} />
            </div>
            <p className="text-indigo-600 font-bold text-lg">U là trời... Sao trống trơn vậy nè?</p>
            <p className="text-indigo-400 mt-1 font-medium text-sm">Thêm liền một môn học để Bíp Bíp còn có cái đu bám nha!</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <TaskList tasks={tasks} />
        </div>
        <div className="lg:col-span-5 space-y-6">
          <RecentSessionsCard recentSessions={recentSessions} />
        </div>
      </div>
    </div>
  );
}
