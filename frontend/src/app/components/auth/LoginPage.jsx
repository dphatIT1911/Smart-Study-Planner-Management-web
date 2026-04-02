import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Vui lòng nhập Email và Mật khẩu');
      }

      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const data = await api.login(formData);
      localStorage.setItem('token', data.access_token);
      
      const profile = await api.getProfile();
      localStorage.setItem('user', JSON.stringify(profile));
      
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      if (err.message.includes('Failed to fetch')) {
        setError('Không thể kết nối đến máy chủ API. Vui lòng kiểm tra xem Backend trên Render đã hoạt động chưa (có thể đang khởi động nguội).');
      } else if (err.message.includes('404')) {
        setError('Không tìm thấy API (404). Vui lòng kiểm tra cấu hình VITE_API_URL trên Render.');
      } else {
        setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Chào mừng trở lại</CardTitle>
          <CardDescription>Đăng nhập vào tài khoản Study Planner của bạn</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required />
              
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required />
              
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 transition-all font-semibold py-6 text-base"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                'Đăng nhập'
              )}
            </Button>
            <p className="text-sm text-center text-gray-600">
              Chưa có tài khoản?{' '}
              <Link to="/signup" className="text-indigo-600 hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>);

}