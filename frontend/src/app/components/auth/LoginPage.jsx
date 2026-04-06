import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { BookOpen, Loader2, AlertCircle, Wifi } from 'lucide-react';
import { api } from '../../api';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 20000; // 20 giây mỗi lần retry

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warmingUp, setWarmingUp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const countdownRef = useRef(null);
  const formDataRef = useRef(null);

  useEffect(() => {
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, []);

  const startRetryCountdown = (onRetry) => {
    setWarmingUp(true);
    setCountdown(RETRY_DELAY_MS / 1000);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          setWarmingUp(false);
          onRetry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const attemptLogin = async (formData, attempt = 1) => {
    try {
      const data = await api.login(formData);
      localStorage.setItem('token', data.access_token);
      const profile = await api.getProfile();
      localStorage.setItem('user', JSON.stringify(profile));
      setLoading(false);
      setWarmingUp(false);
      navigate('/');
    } catch (err) {
      const isNetworkError = err.message.includes('Failed to fetch') || 
                             err.message.includes('NetworkError') ||
                             err.message.includes('fetch');
      if (isNetworkError && attempt < MAX_RETRIES) {
        setRetryCount(attempt);
        startRetryCountdown(() => attemptLogin(formData, attempt + 1));
      } else if (isNetworkError) {
        setLoading(false);
        setWarmingUp(false);
        setRetryCount(0);
        setError('Không thể kết nối sau nhiều lần thử. Backend có thể đang gặp sự cố. Vui lòng thử lại sau vài phút.');
      } else {
        setLoading(false);
        setWarmingUp(false);
        setRetryCount(0);
        if (err.message.includes('404')) {
          setError('Không tìm thấy API (404). Vui lòng kiểm tra cấu hình VITE_API_URL trên Render.');
        } else {
          setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
        }
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setRetryCount(0);

    if (!email || !password) {
      setError('Vui lòng nhập Email và Mật khẩu');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    formDataRef.current = formData;

    await attemptLogin(formData, 1);
  };

  const progressPercent = warmingUp ? ((RETRY_DELAY_MS / 1000 - countdown) / (RETRY_DELAY_MS / 1000)) * 100 : 0;

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
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-start gap-2 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {warmingUp && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="w-4 h-4 animate-pulse flex-shrink-0" />
                  <p className="font-semibold">
                    Server đang khởi động... ({retryCount}/{MAX_RETRIES - 1})
                  </p>
                </div>
                <p className="text-xs text-amber-600 mb-2">
                  Render Free tier cần 30-60 giây để wake up. Tự động thử lại sau <strong>{countdown}s</strong>...
                </p>
                <div className="w-full bg-amber-100 rounded-full h-1.5">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
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
                disabled={loading || warmingUp}
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
                disabled={loading || warmingUp}
                required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 transition-all font-semibold py-6 text-base"
              disabled={loading || warmingUp}
            >
              {loading && !warmingUp ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang xác thực...
                </>
              ) : warmingUp ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang chờ server ({countdown}s)...
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
    </div>
  );
}