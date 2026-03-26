import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';

interface SubjectCardProps {
  name: string;
  semester: string;
  color: string;
  targetScore: number;
  currentProgress: number;
}

export default function SubjectCard({ name, semester, color, targetScore, currentProgress }: SubjectCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: color }}
      />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{name}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">{semester}</p>
          </div>
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progress to Target</span>
            <span className="font-medium text-gray-900">{currentProgress}%</span>
          </div>
          <Progress value={currentProgress} className="h-2" />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Target Score</span>
          <span className="font-medium">{targetScore}</span>
        </div>
      </CardContent>
    </Card>
  );
}
