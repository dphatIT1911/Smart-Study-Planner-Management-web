import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Play, Pause, RotateCcw, Target, CheckCircle2, ArrowLeft, Maximize, Minimize, Clock, Coffee, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { api } from '../api';

export default function FocusSpace() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialTaskId = searchParams.get('taskId');

  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(initialTaskId || 'none');
  
  const [isZenMode, setIsZenMode] = useState(false);
  const [pomodoroTarget, setPomodoroTarget] = useState(25);
  const [timerMode, setTimerMode] = useState('FOCUS'); // 'FOCUS' or 'BREAK'
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  
  // State for total study time for this task
  const [pastSessionsMinutes, setPastSessionsMinutes] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  // Use refs
  const timeLeftRef = useRef(timeLeft);
  const selectedTaskIdRef = useRef(selectedTaskId);

  // Sync refs
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);
  useEffect(() => { selectedTaskIdRef.current = selectedTaskId; }, [selectedTaskId]);

  useEffect(() => {
    Promise.all([
      api.tasks.getAll(),
      api.subjects.getAll()
    ]).then(([allTasks, allSubjects]) => {
      const mappedTasks = allTasks.map(task => ({
        ...task,
        subject: task.subject_id ? allSubjects.find(s => s.id?.toString() === task.subject_id?.toString()) : null
      }));
      const activeTasks = mappedTasks.filter(t => t.status !== 'DONE');
      setTasks(activeTasks);
    });
  }, []);

  // Fetch past sessions when a task is selected to calculate total time
  useEffect(() => {
    if (selectedTaskId && selectedTaskId !== 'none') {
      api.sessions.getAll().then(sessions => {
        const taskSessions = sessions.filter(s => s.task_id?.toString() === selectedTaskId.toString());
        const totalMin = taskSessions.reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0);
        setPastSessionsMinutes(totalMin);
      });
    } else {
      setPastSessionsMinutes(0);
    }
  }, [selectedTaskId]);

  const selectedTask = tasks.find(t => t.id.toString() === selectedTaskId.toString());
  
  // Calculate remaining global time vs estimated minutes
  const targetTotalMinutes = selectedTask?.estimated_minutes || 0;
  const minutesRemainingToTarget = targetTotalMinutes > 0 ? Math.max(0, targetTotalMinutes - pastSessionsMinutes) : 0;
  const isNearTarget = targetTotalMinutes > 0 && minutesRemainingToTarget > 0 && minutesRemainingToTarget <= 10;

  const savePartialSession = async (finalTimeLeft, mode) => {
    if (mode === 'FOCUS' && sessionStartTime && selectedTaskIdRef.current && selectedTaskIdRef.current !== 'none') {
      const durationSeconds = (pomodoroTarget * 60) - finalTimeLeft;
      const durationMin = Math.ceil(durationSeconds / 60);
      
      if (durationSeconds > 0) { // Save even if it's very short for testing/accuracy
        try {
           const endTime = new Date().toISOString();
           await api.sessions.create({
             task_id: parseInt(selectedTaskIdRef.current),
             start_time: sessionStartTime,
             end_time: endTime,
             duration_minutes: durationMin
           });
           setPastSessionsMinutes(prev => prev + durationMin);
           toast.success('Đã tự động lưu', { description: `Ghi nhận +${durationMin} phút vào hệ thống.`});
        } catch (err) {
           console.error("Lỗi lưu session", err);
        }
      }
    }
    setSessionStartTime(null);
  };

  const handleTimerComplete = async (mode) => {
    setPomodoroActive(false);
    
    if (mode === 'FOCUS') {
      await savePartialSession(0, 'FOCUS');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      toast.success('Xuất sắc! Hết giờ tập trung rùi', { description: 'Luân chuyển sang giờ nghỉ ngơi 5 phút nhé.' });
      setTimerMode('BREAK');
      setTimeLeft(5 * 60);
    } else {
      toast.info('Hết giờ nghỉ giải lao!', { description: 'Đã đến lúc quay lại cày tiếp!' });
      setTimerMode('FOCUS');
      setTimeLeft(pomodoroTarget * 60);
    }
  };

  const enterZenMode = async () => {
    setIsZenMode(true);
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.warn("Fullscreen API not supported");
    }
  };

  const exitZenMode = async () => {
    // Save any ongoing session before exiting
    if (pomodoroActive) {
      await savePartialSession(timeLeftRef.current, timerMode);
    }
    setPomodoroActive(false);
    setIsZenMode(false);
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (e) {}
  };

  useEffect(() => {
    const handleFullscreenChange = async () => {
      if (!document.fullscreenElement && isZenMode) {
        if (pomodoroActive) {
           await savePartialSession(timeLeftRef.current, timerMode);
        }
        setIsZenMode(false);
        setPomodoroActive(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isZenMode, pomodoroActive, timerMode]);

  useEffect(() => {
    let interval = null;
    if (pomodoroActive) {
      interval = setInterval(() => {
        if (timeLeftRef.current > 0) {
           if (timerMode === 'BREAK' && timeLeftRef.current === 60) {
             toast.info('Chuẩn bị nhé!', { description: 'Còn 1 phút nữa là hết giờ nghỉ ngơi rồi.' });
           }
           setTimeLeft(prev => prev - 1);
        } else {
          clearInterval(interval);
          handleTimerComplete(timerMode);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [pomodoroActive, timerMode]);

  const toggleTimer = async () => {
    if (pomodoroActive) {
      // Pausing -> Save partial 
      await savePartialSession(timeLeft, timerMode);
      setPomodoroActive(false);
    } else {
      // Starting
      setSessionStartTime(new Date().toISOString());
      setPomodoroActive(true);
    }
  };

  const resetTimer = () => {
    setPomodoroActive(false);
    setTimeLeft(timerMode === 'FOCUS' ? pomodoroTarget * 60 : 5 * 60);
  };

  const handleTargetChange = (minutes) => {
    if (pomodoroActive) return;
    setPomodoroTarget(minutes);
    setTimerMode('FOCUS');
    setTimeLeft(minutes * 60);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentMaxTime = timerMode === 'FOCUS' ? (pomodoroTarget * 60) : (5 * 60);
  const progressPercent = 100 - (timeLeft / currentMaxTime) * 100;

  if (isZenMode) {
    const isBreak = timerMode === 'BREAK';
    const bgClass = isBreak ? 'bg-sky-950' : 'bg-slate-950';
    const ringClass = isBreak ? 'bg-sky-500' : 'bg-indigo-500';
    const themeHoverClass = isBreak ? 'bg-sky-600 hover:bg-sky-500 hover:shadow-sky-900/50' : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-900/50';
    const textTargetClass = isBreak ? 'text-sky-400' : 'text-indigo-400';
    
    return (
      <div className={`fixed inset-0 z-[9999] ${bgClass} text-slate-100 flex flex-col items-center justify-center transition-colors duration-1000`}>
        
        <div className="absolute top-8 left-8">
          <Button variant="ghost" className="text-slate-400 hover:text-slate-100 hover:bg-slate-800 gap-2 font-medium" onClick={exitZenMode}>
            <Minimize className="w-5 h-5" />
            Thoát Không Gian
          </Button>
        </div>

        {targetTotalMinutes > 0 && selectedTaskId !== 'none' && (
          <div className="absolute top-8 right-8 text-right">
            <div className={`px-4 py-2 rounded-xl flex items-center gap-3 border ${
               isNearTarget ? 'bg-rose-950/50 border-rose-500/50 text-rose-300' : 'bg-slate-900/50 border-slate-700 text-slate-300'
            }`}>
              <Clock className="w-5 h-5" />
              <div className="flex flex-col items-end">
                <span className="text-xs font-semibold tracking-wider uppercase opacity-70">Tiến độ mục tiêu</span>
                <span className="font-bold">{pastSessionsMinutes} phút / {targetTotalMinutes} phút</span>
              </div>
            </div>
            {isNearTarget && (
               <p className="text-xs text-rose-400 font-medium mt-2 mr-2 flex items-center justify-end gap-1">
                 <AlertTriangle className="w-3.5 h-3.5" />
                 Sắp đạt mục tiêu (Chỉ còn &lt;= 10p)!
               </p>
            )}
          </div>
        )}

        <div className="flex flex-col items-center w-full max-w-2xl px-6">
          <div className="mb-12 text-center space-y-3">
             <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 font-medium text-sm mb-2 shadow-sm transition-colors ${textTargetClass}`}>
                {isBreak ? <Coffee className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                {isBreak ? 'MÀN NGHỈ NGƠI 5 PHÚT' : 'ĐANG TẬP TRUNG CAO ĐỘ'}
             </div>
             {selectedTask ? (
               <>
                 <h2 className="text-3xl font-black tracking-tight text-white">{selectedTask.title}</h2>
                 <p className="text-slate-400 font-medium">Môn học: {selectedTask.subject?.name || 'Chưa phân loại'}</p>
               </>
             ) : (
               <h2 className="text-3xl font-black tracking-tight text-white">Chế độ Học Tự Do</h2>
             )}
          </div>

          <div className="relative mb-16 mt-4">
            {pomodoroActive && (
              <>
                <div className={`absolute inset-0 ${ringClass}/20 rounded-full animate-ping opacity-20 scale-125 pointer-events-none`} style={{ animationDuration: '3s' }} />
                <div className={`absolute inset-0 ${ringClass}/20 rounded-full animate-ping opacity-10 scale-150 pointer-events-none`} style={{ animationDuration: '4s' }} />
              </>
            )}
            
            <div className={`w-[22rem] h-[22rem] rounded-full flex items-center flex-col justify-center relative z-10 bg-slate-900 border-2 transition-all duration-700 shadow-2xl ${
              pomodoroActive ? `border-${isBreak ? 'sky' : 'indigo'}-500/50 shadow-${isBreak ? 'sky' : 'indigo'}-900/50` : 'border-slate-800 shadow-xl'
            }`}>
              
              <div className={`absolute bottom-0 left-0 right-0 ${ringClass}/30 rounded-b-full overflow-hidden`} style={{ height: '0%', transition: 'height 1s linear' }}>
                 <div className={`w-full ${ringClass}/20 absolute bottom-0`} style={{ height: `${progressPercent}%`, transition: 'height 1s linear' }} />
              </div>

              <div className={`text-8xl font-mono tracking-tighter font-black z-20 transition-colors drop-shadow-md ${
                pomodoroActive ? textTargetClass : 'text-slate-300'
              }`}>
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6 z-20 relative">
            <Button
              size="lg"
              onClick={toggleTimer}
              className={`h-16 rounded-full px-12 shadow-xl font-bold text-xl transition-all border-none ${
                pomodoroActive 
                  ? "bg-slate-800 hover:bg-slate-700 text-white hover:scale-105" 
                  : `${themeHoverClass} hover:scale-105`
              }`}
            >
              {pomodoroActive ? <Pause className="w-6 h-6 mr-3" /> : <Play className="w-6 h-6 mr-3" />}
              {pomodoroActive ? "Tạm dừng" : "Bắt đầu cày"}
            </Button>
            
            {!pomodoroActive && timeLeft < currentMaxTime && (
              <Button 
                variant="outline" 
                size="icon"
                className="h-16 w-16 rounded-full hover:bg-slate-800 hover:text-white border-slate-700 bg-slate-900 text-slate-400 border-2 transition-all hover:scale-105"
                onClick={resetTimer}
                title="Làm mới"
              >
                <RotateCcw className="w-6 h-6" />
              </Button>
            )}
          </div>

          <div className="mt-16 flex gap-3 relative z-20">
             <span className="text-slate-500 font-medium flex items-center mr-2">Chu kỳ:</span>
             {[15, 25, 45, 60, 90].map((t) => (
               <button
                 key={t}
                 disabled={pomodoroActive || isBreak}
                 onClick={() => handleTargetChange(t)}
                 className={`px-4 py-2 font-bold rounded-xl transition-colors min-w-[60px] border ${
                   pomodoroTarget === t && !isBreak
                    ? 'bg-indigo-900/50 text-indigo-300 border-indigo-500/50 shadow-inner' 
                    : 'bg-slate-900 text-slate-500 border-slate-800 hover:bg-slate-800 hover:text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-900'
                 }`}
               >
                 {t}p
               </button>
             ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-[calc(100vh-theme(spacing.16))] relative">
      <div className="p-8 max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center relative z-10">
        <div className="mb-8">
          <Button variant="ghost" className="text-slate-500 gap-2 hover:bg-slate-200" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
            Trở lại danh sách
          </Button>
        </div>

        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center">
          <div className="flex items-center gap-3 text-indigo-900 mb-2">
            <Target className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-black uppercase tracking-tight">Khu vực tập trung</h1>
          </div>
          <p className="text-slate-500 mb-10 font-medium">Chuẩn bị trước khi bước vào không gian tĩnh lặng</p>
          
          <div className="w-full max-w-lg mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <label className="text-sm font-bold text-slate-700 uppercase mb-3 block">Lựa chọn Nhiệm vụ</label>
            <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
              <SelectTrigger className="w-full h-14 bg-white border-slate-200 text-slate-800 font-medium text-lg shadow-sm">
                <SelectValue placeholder="-- Không chọn công việc --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- Học tự do (Không lưu lịch sử) --</SelectItem>
                {tasks.map(t => (
                  <SelectItem key={t.id} value={t.id.toString()}>{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedTask ? (
               <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between">
                 <div>
                    <p className="text-sm text-slate-500">Môn học:</p>
                    <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-medium inline-block mt-1">
                      {selectedTask.subject?.name || 'Chưa phân loại'}
                    </span>
                 </div>
                 {targetTotalMinutes > 0 && (
                   <div className="text-right">
                     <p className="text-sm text-slate-500">Mục tiêu tổng:</p>
                     <span className="font-bold text-indigo-600">{targetTotalMinutes} phút</span>
                   </div>
                 )}
               </div>
            ) : null}
          </div>

          <div className="w-full max-w-lg flex flex-col items-center">
            <Button size="lg" onClick={enterZenMode} className="w-full h-16 rounded-2xl shadow-lg shadow-indigo-200 font-bold text-xl transition-all bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02]">
              <Maximize className="w-6 h-6 mr-3" />
              Tiến Vào Không Gian Tập Trung
            </Button>
            <span className="text-xs text-slate-400 font-medium mt-4">Chế độ này sẽ phóng to toàn màn hình và tự lưu lại lịch trình</span>
          </div>
        </div>
      </div>
    </div>
  );
}
