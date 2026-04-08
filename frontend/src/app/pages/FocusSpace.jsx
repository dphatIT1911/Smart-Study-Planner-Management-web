import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Play,
  Pause,
  RotateCcw,
  Target,
  CheckCircle2,
  ArrowLeft,
  Maximize,
  Minimize,
  Clock,
  Coffee,
  AlertTriangle,
  Music,
  Volume2,
  VolumeX,
  Wind,
  CloudRain,
  Sparkles,
} from "lucide-react";
import { Switch } from "../components/ui/switch"; // Music toggle component
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { api } from "../api";

export default function FocusSpace() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialTaskId = searchParams.get("taskId");

  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(initialTaskId || "none");

  const [isZenMode, setIsZenMode] = useState(false);
  const [pomodoroTarget, setPomodoroTarget] = useState(25);
  const [timerMode, setTimerMode] = useState("FOCUS"); // 'FOCUS' or 'BREAK'
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [elapsedSeconds, setElapsedSeconds] = useState(0); // Track ACTUAL study time


  // Music Settings
  const [isMusicEnabled, setIsMusicEnabled] = useState(() => {
    return localStorage.getItem("study_music_enabled") === "true";
  });
  const [selectedTrack, setSelectedTrack] = useState(() => {
    return localStorage.getItem("study_music_track") || "lofi";
  });
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef(null);

  // Music Tracks Data (YouTube IDs)
  const musicTracks = {
    lofi: {
      name: "Lofi Chill",
      url: "jfKfPfyJRdk", // Lofi Girl Radio
      icon: "Coffee",
    },
    rain: {
      name: "Tiếng Mưa",
      url: "mPZkdNFkNps", // Rain for 10 hours
      icon: "CloudRain",
    },
    nature: {
      name: "Interstella",
      url: "yCGsJuZP8Ck", // Forest sounds
      icon: "Wind",
    },
  };

  // State for total study time for this task
  const [pastSessionsMinutes, setPastSessionsMinutes] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  // Use refs
  const timeLeftRef = useRef(timeLeft);
  const selectedTaskIdRef = useRef(selectedTaskId);
  const elapsedSecondsRef = useRef(elapsedSeconds);

  // Sync refs
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);
  useEffect(() => {
    selectedTaskIdRef.current = selectedTaskId;
  }, [selectedTaskId]);
  useEffect(() => {
    elapsedSecondsRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  // YouTube Player Ref for direct control
  const iframeRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  // Audio Control Logic (YouTube Version)
  useEffect(() => {
    const sendCommand = (func, args = []) => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func, args }),
          "*"
        );
      }
    };

    const shouldPlay =
      isMusicEnabled &&
      ((pomodoroActive && timerMode === "FOCUS") ||
        (!pomodoroActive && isPreviewPlaying));

    // Small delay to ensure iframe is ready if the track just changed
    const timer = setTimeout(() => {
      if (shouldPlay) {
        sendCommand("unMute");
        sendCommand("setVolume", [volume * 100]);
        sendCommand("playVideo");
        setIsPlaying(true);
      } else {
        sendCommand("pauseVideo");
        setIsPlaying(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isMusicEnabled, pomodoroActive, timerMode, selectedTrack, volume, isPreviewPlaying]);

  useEffect(() => {
    if (pomodoroActive && isPreviewPlaying) {
      setIsPreviewPlaying(false);
    }
  }, [pomodoroActive, isPreviewPlaying]);

  useEffect(() => {
    if (!isMusicEnabled && isPreviewPlaying) {
      setIsPreviewPlaying(false);
    }
  }, [isMusicEnabled, isPreviewPlaying]);

  // Preview Music Logic (YouTube Version)
  const togglePreview = (trackId) => {
    if (pomodoroActive) return;

    const isChanging = selectedTrack !== trackId;
    if (isChanging) {
      setSelectedTrack(trackId);
      setIsPreviewPlaying(true);
      return;
    }

    setIsPreviewPlaying((prev) => !prev);
  };

  useEffect(() => {
    Promise.all([api.tasks.getAll(), api.subjects.getAll()]).then(
      ([allTasks, allSubjects]) => {
        const mappedTasks = allTasks.map((task) => ({
          ...task,
          subject: task.subject_id
            ? allSubjects.find(
                (s) => s.id?.toString() === task.subject_id?.toString()
              )
            : null,
        }));
        const activeTasks = mappedTasks.filter((t) => t.status !== "DONE");
        setTasks(activeTasks);
      }
    );
  }, []);

  // Fetch past sessions when a task is selected to calculate total time
  useEffect(() => {
    if (selectedTaskId && selectedTaskId !== "none") {
      api.sessions.getAll().then((sessions) => {
        const taskSessions = sessions.filter(
          (s) => s.task_id?.toString() === selectedTaskId.toString()
        );
        const totalMin = taskSessions.reduce(
          (acc, curr) => acc + (curr.duration_minutes || 0),
          0
        );
        setPastSessionsMinutes(totalMin);
      });
    } else {
      setPastSessionsMinutes(0);
    }
  }, [selectedTaskId]);

  const selectedTask = tasks.find(
    (t) => t.id.toString() === selectedTaskId.toString()
  );

  // Calculate remaining global time vs estimated minutes
  const targetTotalMinutes = selectedTask?.estimated_minutes || 0;
  const minutesRemainingToTarget =
    targetTotalMinutes > 0
      ? Math.max(0, targetTotalMinutes - pastSessionsMinutes)
      : 0;
  const isNearTarget =
    targetTotalMinutes > 0 &&
    minutesRemainingToTarget > 0 &&
    minutesRemainingToTarget <= 10;

  const savePartialSession = async (currentElapsedSeconds, mode) => {
    if (
      mode === "FOCUS" &&
      selectedTaskIdRef.current &&
      selectedTaskIdRef.current !== "none" &&
      currentElapsedSeconds > 0
    ) {
      const durationMin = Math.floor((currentElapsedSeconds + 10) / 60);


      if (durationMin <= 0) {
        setElapsedSeconds(0);
        setSessionStartTime(null);
        toast.info('Học hơi "nén" nhỉ?', {
          description:
            "Chưa đầy 50 giây nên chưa bõ công hệ thống ghi nhận. Cố thêm tí nữa nhé!",
        });
        return;
      }


      try {
        const now = new Date();
        const endTime = now.toISOString();
        // Ensure startTime is significantly before endTime
        const startTime =
          sessionStartTime ||
          new Date(now.getTime() - currentElapsedSeconds * 1000).toISOString();

        await api.sessions.create({
          task_id: parseInt(selectedTaskIdRef.current),
          start_time: startTime,
          end_time: endTime,
          duration_minutes: durationMin,
        });
        setPastSessionsMinutes((prev) => prev + durationMin);
        setElapsedSeconds(0);
        toast.success("Đỉnh chóp!", {
          description: `Đã nạp thành công +${durationMin} phút vào não bộ. Tiếp tục phát huy nào!`,
        });
      } catch (err) {
        console.error("Lỗi lưu session", err);
        console.error("Lỗi lưu session", err);
      }
    }
    setSessionStartTime(null);
  };

  const handleTimerComplete = async (mode) => {
    setPomodoroActive(false);

    if (mode === "FOCUS") {
      await savePartialSession(elapsedSecondsRef.current, "FOCUS");
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      toast.success("Hết giờ tập trung!", {
        description:
          "Bộ não của bạn xứng đáng được nghỉ ngơi 5 phút. Đi uống nước đi nào!",
      });
      setTimerMode("BREAK");
      setTimeLeft(5 * 60);
    } else {
      toast.info("Hết giờ xả hơi!", {
        description: 'Pin đã sạc đầy, quay lại "pơ-phẹc" nốt công việc nào!',
      });
      setTimerMode("FOCUS");
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
    if (pomodoroActive && timerMode === "FOCUS") {
      await savePartialSession(elapsedSeconds, timerMode);
    }
    setPomodoroActive(false);
    setIsZenMode(false);
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (e) { }
  };

  useEffect(() => {
    const handleFullscreenChange = async () => {
      if (!document.fullscreenElement && isZenMode) {
        if (pomodoroActive && timerMode === "FOCUS") {
          // This is triggered by ESC - Use Ref for absolute latest value
          await savePartialSession(elapsedSecondsRef.current, timerMode);
        }
        setIsZenMode(false);
        setPomodoroActive(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [isZenMode, pomodoroActive, timerMode]);

  useEffect(() => {
    let interval = null;
    if (pomodoroActive) {
      interval = setInterval(() => {
        if (timeLeftRef.current > 0) {
          if (timerMode === "BREAK" && timeLeftRef.current === 60) {
            toast.info("Chuẩn bị nhé!", {
              description: "Còn 1 phút nữa là hết giờ nghỉ ngơi rồi.",
            });
          }
          setTimeLeft((prev) => prev - 1);
          if (timerMode === "FOCUS") {
            setElapsedSeconds((prev) => prev + 1);
          }
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
      await savePartialSession(elapsedSeconds, timerMode);
      setPomodoroActive(false);
    } else {
      // Starting
      if (!sessionStartTime) {
        setSessionStartTime(new Date().toISOString());
      }
      setPomodoroActive(true);
    }
  };

  const resetTimer = () => {
    setPomodoroActive(false);
    setElapsedSeconds(0);
    setTimeLeft(timerMode === "FOCUS" ? pomodoroTarget * 60 : 5 * 60);
  };

  const handleTargetChange = (minutes) => {
    if (pomodoroActive) return;
    setPomodoroTarget(minutes);
    setTimerMode("FOCUS");
    setTimeLeft(minutes * 60);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentMaxTime = timerMode === "FOCUS" ? pomodoroTarget * 60 : 5 * 60;
  const progressPercent = 100 - (timeLeft / currentMaxTime) * 100;

  // Main Render Logic with Zen Mode wrapper
  return (
    <div className="min-h-screen relative">
      {isZenMode ? (
        <div
          className={`fixed inset-0 z-[9999] ${
            timerMode === "BREAK" ? "bg-sky-950" : "bg-slate-950"
          } text-slate-100 flex flex-col items-center justify-center transition-colors duration-1000`}
        >
          <div className="absolute top-8 left-8">
            <Button
              variant="ghost"
              className="text-slate-400 hover:text-slate-100 hover:bg-slate-800 gap-2 font-medium"
              onClick={exitZenMode}
            >
              Thoát Không Gian
            </Button>
          </div>

          {targetTotalMinutes > 0 && selectedTaskId !== "none" && (
            <div className="absolute top-8 right-8 text-right">
              <div
                className={`px-4 py-2 rounded-xl flex items-center gap-3 border ${
                  isNearTarget
                    ? "bg-rose-950/50 border-rose-500/50 text-rose-300"
                    : "bg-slate-900/50 border-slate-700 text-slate-300"
                }`}
              >
                <Clock className="w-5 h-5" />
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold tracking-wider uppercase opacity-70">
                    Tiến độ mục tiêu
                  </span>
                  <span className="font-bold">
                    {pastSessionsMinutes} phút / {targetTotalMinutes} phút
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center w-full max-w-2xl px-6">
            <div className="mb-12 text-center space-y-3">
              <div
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 font-medium text-sm mb-2 shadow-sm transition-colors ${
                  timerMode === "BREAK" ? "text-sky-400" : "text-indigo-400"
                }`}
              >
                {timerMode === "BREAK" ? (
                  <Coffee className="w-4 h-4" />
                ) : (
                  <Target className="w-4 h-4" />
                )}
                {timerMode === "BREAK"
                  ? "MÀN NGHỈ NGƠI 5 PHÚT"
                  : "ĐANG TẬP TRUNG CAO ĐỘ"}
              </div>
              {selectedTask ? (
                <>
                  <h2 className="text-3xl font-black tracking-tight text-white">
                    {selectedTask.title}
                  </h2>
                  <p className="text-slate-400 font-medium">
                    Môn học: {selectedTask.subject?.name || "Chưa phân loại"}
                  </p>
                </>
              ) : (
                <h2 className="text-3xl font-black tracking-tight text-white">
                  Chế độ Học Tự Do
                </h2>
              )}
            </div>

            <div className="relative mb-16 mt-4">
              {pomodoroActive && (
                <div
                  className={`absolute inset-0 ${
                    timerMode === "BREAK" ? "bg-sky-500" : "bg-indigo-500"
                  }/20 rounded-full animate-ping opacity-20 scale-125 pointer-events-none`}
                  style={{ animationDuration: "3s" }}
                />
              )}
              <div
                className={`w-[22rem] h-[22rem] rounded-full flex items-center flex-col justify-center relative z-10 bg-slate-900 border-2 transition-all duration-700 shadow-2xl ${
                  pomodoroActive
                    ? `border-${
                        timerMode === "BREAK" ? "sky" : "indigo"
                      }-500/50`
                    : "border-slate-800 shadow-xl"
                }`}
              >
                <div
                  className={`text-8xl font-mono tracking-tighter font-black z-20 transition-colors drop-shadow-md ${
                    pomodoroActive
                      ? timerMode === "BREAK"
                        ? "text-sky-400"
                        : "text-indigo-400"
                      : "text-slate-300"
                  }`}
                >
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
                    ? "bg-slate-800 hover:bg-slate-700 text-white"
                    : "bg-indigo-600 hover:bg-indigo-500"
                }`}
              >
                {pomodoroActive ? (
                  <Pause className="w-6 h-6 mr-3" />
                ) : (
                  <Play className="w-6 h-6 mr-3" />
                )}
                {pomodoroActive ? "Tạm dừng" : "Bắt đầu cày"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full bg-slate-50 min-h-[calc(100vh-theme(spacing.16))]">
          <div className="p-8 max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center relative z-10">
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center">
              <div className="flex items-center gap-3 text-indigo-900 mb-2">
                <h1 className="text-3xl font-black uppercase tracking-tight">
                  Khu vực tập trung
                </h1>
              </div>
              <p className="text-slate-500 mb-10 font-medium">
                Chuẩn bị trước khi bước vào không gian tĩnh lặng
              </p>

              <div className="w-full max-w-lg mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <label className="text-sm font-bold text-slate-700 uppercase mb-3 block">
                  Lựa chọn Nhiệm vụ
                </label>
                <Select
                  value={selectedTaskId}
                  onValueChange={setSelectedTaskId}
                >
                  <SelectTrigger className="w-full h-14 bg-white border-slate-200 text-slate-800 font-medium text-lg shadow-sm">
                    <SelectValue placeholder="-- Không chọn công việc --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      -- Học tự do (Không lưu lịch sử) --
                    </SelectItem>
                    {tasks.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full max-w-lg flex flex-col items-center">
                <div className="w-full max-w-lg mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Music className="w-5 h-5 text-indigo-600" />
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-tight">
                        Âm thanh tập trung
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase">
                        {isMusicEnabled ? "Bật" : "Tắt"}
                      </span>
                      <Switch
                        checked={isMusicEnabled}
                        onCheckedChange={setIsMusicEnabled}
                      />
                    </div>
                  </div>

                  <div
                    className={`grid grid-cols-3 gap-3 transition-all duration-300 ${
                      !isMusicEnabled
                        ? "opacity-40 grayscale pointer-events-none"
                        : ""
                    }`}
                  >
                    {Object.entries(musicTracks).map(([id, track]) => {
                      const Icon =
                        id === "lofi"
                          ? Coffee
                          : id === "rain"
                          ? CloudRain
                          : Wind;
                      return (
                        <button
                          key={id}
                          onClick={() => togglePreview(id)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                            selectedTrack === id
                              ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm"
                              : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-black uppercase tracking-tighter">
                              {track.name}
                            </span>
                            {selectedTrack === id && isPlaying && (
                              <Sparkles className="w-2.5 h-2.5 animate-pulse text-indigo-500" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {isMusicEnabled && (
                    <div className="mt-6 flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-100">
                      <div className="text-slate-400">
                        {volume === 0 ? (
                          <VolumeX className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={volume}
                          onChange={(e) =>
                            setVolume(parseFloat(e.target.value))
                          }
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 w-8">
                        {Math.round(volume * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  size="lg"
                  onClick={enterZenMode}
                  className="w-full h-16 rounded-2xl shadow-lg shadow-indigo-200 font-bold text-xl transition-all bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02]"
                >
                  Tiến Vào Không Gian Tập Trung
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ALWAYS RENDERED - YouTube Player */}
      <div className="fixed bottom-0 right-0 opacity-0 pointer-events-none scale-0 overflow-hidden w-1 h-1">
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${musicTracks[selectedTrack].url}?enablejsapi=1&autoplay=0&mute=1&controls=0&origin=${window.location.origin}`}
          allow="autoplay; encrypted-media"
          title="Study Music Provider"
        />
      </div>
    </div>
  );
}
