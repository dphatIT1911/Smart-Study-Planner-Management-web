import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Plus, Clock, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { api } from '../api';
import { format } from 'date-fns';

export default function StudySessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMinutes: 0,
    averagePerDay: 0,
    longestSession: 0
  });

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const data = await api.sessions.getAll();
        setSessions(data);
        
        // Calculate basic stats
        if (data.length > 0) {
          const total = data.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
          const longest = Math.max(...data.map(s => s.duration_minutes || 0));
          const avg = total / data.length; // Simplified avg
          
          setStats({
            totalMinutes: total,
            averagePerDay: Math.round(avg * 10) / 10,
            longestSession: longest
          });
        }
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) {
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
        <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Plus className="w-4 h-4" />
          Ghi lại phiên học
        </Button>
      </div>

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
           <Card className="p-12 text-center border-dashed border-2 bg-gray-50/30">
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                  <Clock className="w-7 h-7 text-gray-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Chưa có phiên học nào được ghi lại</h3>
                  <p className="text-gray-500 text-sm">Bắt đầu một phiên học để theo dõi dữ liệu của bạn.</p>
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
