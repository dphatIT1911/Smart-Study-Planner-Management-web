import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Clock, Calendar } from 'lucide-react';














export default function SessionTracker({ recentSession }) {
  if (!recentSession) {
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
      </Card>);

  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phiên học gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: recentSession.subjectColor + '20' }}>
              
              <Clock className="w-6 h-6" style={{ color: recentSession.subjectColor }} />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{recentSession.subject}</h4>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{recentSession.localDate || recentSession.date || 'Gần đây'}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {recentSession.durationMinutes}
              </div>
              <div className="text-xs text-gray-500">phút</div>
            </div>
          </div>
          {recentSession.notes &&
          <div className="pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-600">{recentSession.notes}</p>
            </div>
          }
        </div>
      </CardContent>
    </Card>);

}