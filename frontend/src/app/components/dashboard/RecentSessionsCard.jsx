import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Clock, Calendar } from 'lucide-react';

export default function RecentSessionsCard({ recentSessions }) {
  const sessions = Array.isArray(recentSessions) ? recentSessions : [];

  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Phiên học gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Chưa có phiên học nào</p>
            <p className="text-sm mt-1">Bắt đầu theo dõi thời gian học của bạn!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phiên học gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sessions.slice(0, 5).map((session, idx) => (
            <div
              key={session.id ?? idx}
              className={idx === 0 ? '' : 'pt-3 border-t border-gray-100'}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: (session.subjectColor || '#6366f1') + '20',
                  }}
                >
                  <Clock
                    className="w-6 h-6"
                    style={{ color: session.subjectColor || '#6366f1' }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {session.subject || 'Phiên học nhanh'}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="truncate">
                      {session.localDate || session.date || 'Gần đây'}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-bold text-gray-900">
                    {session.durationMinutes ?? session.duration_minutes ?? 0}
                  </div>
                  <div className="text-xs text-gray-500">phút</div>
                </div>
              </div>
              {session.notes && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">{session.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

