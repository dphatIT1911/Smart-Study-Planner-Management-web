import { useState, useEffect } from 'react';
import StatCard from './StatCard';
import SubjectCard from './SubjectCard';
import TaskList from './TaskList';
import SessionTracker from './SessionTracker';
import { Badge } from '../ui/badge';
import { Clock, Target, CheckCircle2, TrendingUp, Loader2 } from 'lucide-react';
import Mascot from '../mascot/Mascot';
import { api } from '../../api';

export default function Dashboard() {
  const [greeting, setGreeting] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeClosing, setWelcomeClosing] = useState(false);
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

        const mappedTasks = Array.isArray(allTasks) ? allTasks.map(task => ({
          ...task,
          subject: task.subject_id ? allSubjects.find(s => s.id?.toString() === task.subject_id?.toString()) : null
        })) : [];

        setTasks(mappedTasks.slice(0, 5));
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
    let currentGreeting = '';
    if (hour < 5) currentGreeting = 'Cú đêm ơi, chạy deadline rực rỡ nhé! 🦉';
    else if (hour < 11) currentGreeting = 'Sáng rồi đồng chí ơi, bật mode năng suất thuiii ⚡';
    else if (hour < 14) currentGreeting = 'Trưa rồi nạp năng lượng rùi cày tiếp nha 🍔';
    else if (hour < 18) currentGreeting = 'Trời chiều mát mẻ, dứt điểm deadline nào 🌅';
    else currentGreeting = 'Lên đèn lên đồ... à nhầm lên bàn học thui! 🚀';
    
    setGreeting(currentGreeting);

    // Show welcome popup once per session
    if (!sessionStorage.getItem('hasWelcomed_genz')) {
      setTimeout(() => {
        setShowWelcome(true);
        sessionStorage.setItem('hasWelcomed_genz', 'true');
        // Auto-dismiss after 5 seconds
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
              <Mascot size={100} mood="cheer" animate={true} />
            </div>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              color: '#3730a3',
              marginBottom: '0.75rem',
              letterSpacing: '-0.02em',
            }}>
              Bíp bíp! Chào bạn nè!
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
              <span style={{ opacity: 0.75, fontSize: '1rem' }}>Chúc bạn học thật vui! 💪✨</span>
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
              Cày thôi nào! 🚀
            </button>
          </div>
        </div>
      )}

      {/* Keyframe animations for the welcome popup */}
      <style>{`
        @keyframes welcomeOverlayIn {
          from { background-color: rgba(0,0,0,0); backdrop-filter: blur(0px); }
          to { background-color: rgba(0,0,0,0.5); backdrop-filter: blur(4px); }
        }
        @keyframes welcomePopIn {
          from { transform: scale(0.6); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes welcomeBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

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
        <div className="hidden sm:flex items-center justify-center">
           <Mascot size={90} mood="happy" animate={true} />
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
