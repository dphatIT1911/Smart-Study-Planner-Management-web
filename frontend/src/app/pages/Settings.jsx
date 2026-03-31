import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';

const timezones = [
'UTC',
'America/New_York',
'America/Chicago',
'America/Denver',
'America/Los_Angeles',
'Europe/London',
'Europe/Paris',
'Asia/Tokyo',
'Asia/Shanghai',
'Australia/Sydney'];


export default function Settings() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [timezone, setTimezone] = useState('UTC');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:8000/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const user = await response.json();
          setName(user.name || '');
          setEmail(user.email || '');
          setTimezone(user.timezone || 'UTC');
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    };
    
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, timezone })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to save settings');
      }

      const updatedUser = await response.json();
      localStorage.setItem('user', JSON.stringify(updatedUser)); // update local storage with new info

      setSuccessMsg('Settings saved successfully!');
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cài đặt</h1>
        <p className="text-gray-600 mt-2">Quản lý tùy chọn tài khoản của bạn</p>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-100">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 rounded-md border border-green-100">
          {successMsg}
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
            <CardDescription>Cập nhật chi tiết cá nhân và tùy chọn của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên của bạn" />
              
            </div>
            <div className="space-y-2 opacity-60">
              <Label htmlFor="email">Email (Không thể thay đổi)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Múi giờ</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) =>
                  <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Study Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Tùy chọn học tập</CardTitle>
            <CardDescription>Tùy chỉnh trải nghiệm lên kế hoạch học tập của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="daily-goal">Mục tiêu học tập hàng ngày (phút)</Label>
              <Input
                id="daily-goal"
                type="number"
                placeholder="120"
                defaultValue="120" />
              
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminder-time">Thời gian nhắc nhở học tập</Label>
              <Input
                id="reminder-time"
                type="time"
                defaultValue="09:00" />
              
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Thông báo</CardTitle>
            <CardDescription>Quản lý cách bạn nhận cập nhật</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Thông báo qua Email</p>
                <p className="text-sm text-gray-500 mt-1">
                  Nhận email nhắc nhở cho các công việc sắp tới
                </p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5 text-indigo-600 rounded"
                defaultChecked />
              
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Nhắc nhở học tập</p>
                <p className="text-sm text-gray-500 mt-1">
                  Nhận nhắc nhở hàng ngày để giữ đúng tiến độ
                </p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5 text-indigo-600 rounded"
                defaultChecked />
              
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Cập nhật tiến độ</p>
                <p className="text-sm text-gray-500 mt-1">
                  Bản tóm tắt hàng tuần về thành tích của bạn
                </p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5 text-indigo-600 rounded"
                defaultChecked />
              
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button variant="outline">Hủy biểu mẫu</Button>
          <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>
    </div>);

}