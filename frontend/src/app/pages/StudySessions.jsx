import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Plus, Clock, Calendar, TrendingUp } from 'lucide-react';

const sessions = [
{
  id: '1',
  subject: 'Advanced Mathematics',
  subjectColor: '#6366f1',
  date: 'Mar 25, 2026',
  startTime: '2:00 PM',
  endTime: '3:25 PM',
  durationMinutes: 85,
  notes: 'Completed calculus problems, focused on integration techniques.'
},
{
  id: '2',
  subject: 'Data Structures',
  subjectColor: '#8b5cf6',
  date: 'Mar 24, 2026',
  startTime: '10:00 AM',
  endTime: '12:00 PM',
  durationMinutes: 120,
  notes: 'Implemented binary search tree with insertion and deletion operations.'
},
{
  id: '3',
  subject: 'Web Development',
  subjectColor: '#ec4899',
  date: 'Mar 23, 2026',
  startTime: '3:00 PM',
  endTime: '4:30 PM',
  durationMinutes: 90,
  notes: 'Built responsive navigation component using Tailwind CSS.'
},
{
  id: '4',
  subject: 'Database Systems',
  subjectColor: '#14b8a6',
  date: 'Mar 22, 2026',
  startTime: '1:00 PM',
  endTime: '2:15 PM',
  durationMinutes: 75,
  notes: 'Practiced SQL joins and subqueries.'
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
          <h1 className="text-3xl font-bold text-gray-900">Study Sessions</h1>
          <p className="text-gray-600 mt-2">Track your study time and productivity</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Plus className="w-4 h-4" />
          Log Session
        </Button>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              This Week
            </CardTitle>
            <Clock className="w-4 h-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {weeklyStats.totalMinutes} min
            </div>
            <p className="text-xs text-gray-500 mt-1">Total study time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Daily Average
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {weeklyStats.averagePerDay} min
            </div>
            <p className="text-xs text-gray-500 mt-1">Per day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Longest Session
            </CardTitle>
            <Clock className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {weeklyStats.longestSession} min
            </div>
            <p className="text-xs text-gray-500 mt-1">This week</p>
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
                    
                      {session.durationMinutes} min
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