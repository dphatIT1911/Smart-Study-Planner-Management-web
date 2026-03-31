import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Plus, BookOpen } from 'lucide-react';

const subjects = [
{
  id: '1',
  name: 'Toán Cao Cấp',
  semester: 'Kỳ Xuân 2026',
  color: '#6366f1',
  targetScore: 95,
  currentProgress: 78,
  credits: 4,
  instructor: 'TS. Sarah Johnson'
},
{
  id: '2',
  name: 'Cấu Trúc Dữ Liệu',
  semester: 'Kỳ Xuân 2026',
  color: '#8b5cf6',
  targetScore: 90,
  currentProgress: 85,
  credits: 3,
  instructor: 'GS. Michael Chen'
},
{
  id: '3',
  name: 'Phát Triển Web',
  semester: 'Kỳ Xuân 2026',
  color: '#ec4899',
  targetScore: 92,
  currentProgress: 65,
  credits: 3,
  instructor: 'TS. Emily Rodriguez'
},
{
  id: '4',
  name: 'Hệ Quản Trị CSDL',
  semester: 'Kỳ Xuân 2026',
  color: '#14b8a6',
  targetScore: 88,
  currentProgress: 72,
  credits: 4,
  instructor: 'GS. David Kim'
}];


export default function MySubjects() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Môn học của tôi</h1>
          <p className="text-gray-600 mt-2">Quản lý khóa học và theo dõi tiến độ</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Plus className="w-4 h-4" />
          Thêm môn học
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjects.map((subject) =>
        <Card key={subject.id} className="relative overflow-hidden">
            <div
            className="absolute top-0 left-0 right-0 h-1.5"
            style={{ backgroundColor: subject.color }} />
          
            <CardHeader>
              <div className="flex items-start gap-4">
                <div
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: subject.color + '20' }}>
                
                  <BookOpen className="w-6 h-6" style={{ color: subject.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl mb-1">{subject.name}</CardTitle>
                  <p className="text-sm text-gray-500">{subject.semester}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Giảng viên</p>
                  <p className="font-medium text-gray-900 mt-1">{subject.instructor}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tín chỉ</p>
                  <p className="font-medium text-gray-900 mt-1">{subject.credits}</p>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Tiến độ đạt mục tiêu</span>
                  <span className="font-medium text-gray-900">{subject.currentProgress}%</span>
                </div>
                <Progress value={subject.currentProgress} className="h-2" />
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <div className="text-sm">
                  <span className="text-gray-500">Mục tiêu: </span>
                  <span className="font-semibold text-gray-900">{subject.targetScore}</span>
                </div>
                <Button variant="outline" size="sm">
                  Xem chi tiết
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>);

}