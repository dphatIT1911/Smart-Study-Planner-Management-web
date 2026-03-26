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
  activeSubjects: 4,
};

const mockSubjects = [
  {
    id: '1',
    name: 'Advanced Mathematics',
    semester: 'Spring 2026',
    color: '#6366f1', // Indigo
    targetScore: 95,
    currentProgress: 78,
  },
  {
    id: '2',
    name: 'Data Structures',
    semester: 'Spring 2026',
    color: '#8b5cf6', // Purple
    targetScore: 90,
    currentProgress: 85,
  },
  {
    id: '3',
    name: 'Web Development',
    semester: 'Spring 2026',
    color: '#ec4899', // Pink
    targetScore: 92,
    currentProgress: 65,
  },
  {
    id: '4',
    name: 'Database Systems',
    semester: 'Spring 2026',
    color: '#14b8a6', // Teal
    targetScore: 88,
    currentProgress: 72,
  },
];

const mockTasks = [
  {
    id: '1',
    title: 'Complete Chapter 5 Exercises',
    subject: 'Advanced Mathematics',
    dueDate: 'Mar 28, 2026',
    priority: 'High' as const,
    status: 'In-progress' as const,
    estimatedMinutes: 90,
  },
  {
    id: '2',
    title: 'Build Binary Search Tree',
    subject: 'Data Structures',
    dueDate: 'Mar 29, 2026',
    priority: 'Med' as const,
    status: 'To-do' as const,
    estimatedMinutes: 120,
  },
  {
    id: '3',
    title: 'Design Portfolio Website',
    subject: 'Web Development',
    dueDate: 'Mar 30, 2026',
    priority: 'Med' as const,
    status: 'In-progress' as const,
    estimatedMinutes: 180,
  },
  {
    id: '4',
    title: 'SQL Query Practice',
    subject: 'Database Systems',
    dueDate: 'Mar 27, 2026',
    priority: 'Low' as const,
    status: 'To-do' as const,
    estimatedMinutes: 60,
  },
];

const mockRecentSession = {
  id: '1',
  subject: 'Advanced Mathematics',
  subjectColor: '#6366f1',
  date: 'Mar 25, 2026',
  durationMinutes: 85,
  notes: 'Completed calculus problems, focused on integration techniques.',
};

export default function Dashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your study overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Study Time"
          value={`${mockStats.totalStudyTime} min`}
          subtitle={`${mockStats.estimatedTime} min estimated`}
          icon={Clock}
          iconColor="bg-indigo-100 text-indigo-600"
        />
        <StatCard
          title="Completed Tasks"
          value={mockStats.completedTasks}
          subtitle="This month"
          icon={CheckCircle2}
          iconColor="bg-green-100 text-green-600"
        />
        <StatCard
          title="Active Subjects"
          value={mockStats.activeSubjects}
          subtitle="Spring 2026"
          icon={Target}
          iconColor="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Progress Rate"
          value={`${Math.round((mockStats.totalStudyTime / mockStats.estimatedTime) * 100)}%`}
          subtitle="On track"
          icon={TrendingUp}
          iconColor="bg-blue-100 text-blue-600"
        />
      </div>

      {/* Subject Overview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Subjects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockSubjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              name={subject.name}
              semester={subject.semester}
              color={subject.color}
              targetScore={subject.targetScore}
              currentProgress={subject.currentProgress}
            />
          ))}
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
    </div>
  );
}