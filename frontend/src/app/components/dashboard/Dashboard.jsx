import StatCard from './StatCard';
import SubjectCard from './SubjectCard';
import TaskList from './TaskList';
import SessionTracker from './SessionTracker';
import { Clock, Target, CheckCircle2, TrendingUp } from 'lucide-react';

// Mock data matching database schema
const mockStats = {
  totalStudyTime: 1245, // sum of actual_minutes from STUDY_SESSION
  estimatedTime: 1500, // sum of estimated_minutes from TASK
  completedTasks: 12,
  activeSubjects: 4
};

const mockSubjects = [
{
  id: '1',
  name: 'Toán Cao Cấp',
  semester: 'Kỳ Xuân 2026',
  color: '#6366f1', // Indigo
  targetScore: 95,
  currentProgress: 78
},
{
  id: '2',
  name: 'Cấu Trúc Dữ Liệu',
  semester: 'Kỳ Xuân 2026',
  color: '#8b5cf6', // Purple
  targetScore: 90,
  currentProgress: 85
},
{
  id: '3',
  name: 'Phát Triển Web',
  semester: 'Kỳ Xuân 2026',
  color: '#ec4899', // Pink
  targetScore: 92,
  currentProgress: 65
},
{
  id: '4',
  name: 'Hệ Quản Trị CSDL',
  semester: 'Kỳ Xuân 2026',
  color: '#14b8a6', // Teal
  targetScore: 88,
  currentProgress: 72
}];


const mockTasks = [
{
  id: '1',
  title: 'Hoàn thành bài tập chương 5',
  subject: 'Toán Cao Cấp',
  dueDate: '28 Th03, 2026',
  priority: 'Cao',
  status: 'Đang làm',
  estimatedMinutes: 90
},
{
  id: '2',
  title: 'Cài đặt cây tìm kiếm nhị phân',
  subject: 'Cấu Trúc Dữ Liệu',
  dueDate: '29 Th03, 2026',
  priority: 'Trung bình',
  status: 'Cần làm',
  estimatedMinutes: 120
},
{
  id: '3',
  title: 'Thiết kế website cá nhân',
  subject: 'Phát Triển Web',
  dueDate: '30 Th03, 2026',
  priority: 'Trung bình',
  status: 'Đang làm',
  estimatedMinutes: 180
},
{
  id: '4',
  title: 'Thực hành truy vấn SQL',
  subject: 'Hệ Quản Trị CSDL',
  dueDate: '27 Th03, 2026',
  priority: 'Thấp',
  status: 'Cần làm',
  estimatedMinutes: 60
}];


const mockRecentSession = {
  id: '1',
  subject: 'Toán Cao Cấp',
  subjectColor: '#6366f1',
  date: '25 Th03, 2026',
  durationMinutes: 85,
  notes: 'Hoàn thành bài tập giải tích, tập trung vào kỹ thuật tích phân.'
};

export default function Dashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển</h1>
        <p className="text-gray-600 mt-2">Chào mừng trở lại! Đây là tổng quan học tập của bạn.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Tổng thời gian học"
          value={`${mockStats.totalStudyTime} phút`}
          subtitle={`Dự kiến ${mockStats.estimatedTime} phút`}
          icon={Clock}
          iconColor="bg-indigo-100 text-indigo-600" />
        
        <StatCard
          title="Công việc đã xong"
          value={mockStats.completedTasks}
          subtitle="Tháng này"
          icon={CheckCircle2}
          iconColor="bg-green-100 text-green-600" />
        
        <StatCard
          title="Môn học đang học"
          value={mockStats.activeSubjects}
          subtitle="Kỳ Xuân 2026"
          icon={Target}
          iconColor="bg-purple-100 text-purple-600" />
        
        <StatCard
          title="Tiến độ học tập"
          value={`${Math.round(mockStats.totalStudyTime / mockStats.estimatedTime * 100)}%`}
          subtitle="Đúng tiến độ"
          icon={TrendingUp}
          iconColor="bg-blue-100 text-blue-600" />
        
      </div>

      {/* Subject Overview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Môn học của tôi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockSubjects.map((subject) =>
          <SubjectCard
            key={subject.id}
            name={subject.name}
            semester={subject.semester}
            color={subject.color}
            targetScore={subject.targetScore}
            currentProgress={subject.currentProgress} />

          )}
        </div>
      </div>

      {/* Tasks and Session */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TaskList tasks={mockTasks} />
        </div>
        <div>
          <SessionTracker recentSession={mockRecentSession} />
        </div>
      </div>
    </div>);

}