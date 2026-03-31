import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Plus, Clock, Calendar, TrendingUp } from 'lucide-react';

const sessions = [
{
  id: '1',
  subject: 'Toán Cao Cấp',
  subjectColor: '#6366f1',
  date: '25 Th03, 2026',
  startTime: '14:00',
  endTime: '15:25',
  durationMinutes: 85,
  notes: 'Hoàn thành bài tập giải tích, tập trung vào kỹ thuật tích phân.'
},
{
  id: '2',
  subject: 'Cấu Trúc Dữ Liệu',
  subjectColor: '#8b5cf6',
  date: '24 Th03, 2026',
  startTime: '10:00',
  endTime: '12:00',
  durationMinutes: 120,
  notes: 'Đã cài đặt cây tìm kiếm nhị phân với các thao tác thêm và xóa.'
},
{
  id: '3',
  subject: 'Phát Triển Web',
  subjectColor: '#ec4899',
  date: '23 Th03, 2026',
  startTime: '15:00',
  endTime: '16:30',
  durationMinutes: 90,
  notes: 'Đã xây dựng UI thanh điều hướng tương thích bằng Tailwind CSS.'
},
{
  id: '4',
  subject: 'Hệ Quản Trị CSDL',
  subjectColor: '#14b8a6',
  date: '22 Th03, 2026',
  startTime: '13:00',
  endTime: '14:15',
  durationMinutes: 75,
  notes: 'Thực hành các câu lệnh thao tác kết nối JOIN và truy vấn lồng SQL.'
}];


const weeklyStats = {
  totalMinutes: 370,
  averagePerDay: 92.5,
  longestSession: 120
};

export default function StudySessions() {
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tuần này
            </CardTitle>
            <Clock className="w-4 h-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {weeklyStats.totalMinutes} phút
            </div>
            <p className="text-xs text-gray-500 mt-1">Tổng thời gian học</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Trung bình mỗi ngày
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {weeklyStats.averagePerDay} phút
            </div>
            <p className="text-xs text-gray-500 mt-1">Mỗi ngày</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Phiên học dài nhất
            </CardTitle>
            <Clock className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {weeklyStats.longestSession} phút
            </div>
            <p className="text-xs text-gray-500 mt-1">Tuần này</p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.map((session) =>
        <Card key={session.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: session.subjectColor + '20' }}>
                
                  <Clock className="w-6 h-6" style={{ color: session.subjectColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {session.subject}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{session.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>
                            {session.startTime} - {session.endTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge
                    variant="outline"
                    className="text-base px-3 py-1"
                    style={{
                      borderColor: session.subjectColor,
                      color: session.subjectColor
                    }}>
                    
                      {session.durationMinutes} phút
                    </Badge>
                  </div>
                  {session.notes &&
                <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600">{session.notes}</p>
                    </div>
                }
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>);

}