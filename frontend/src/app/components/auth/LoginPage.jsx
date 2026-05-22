import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { BookOpen, AlertCircle, Loader2, Mail, Lock, LogIn } from 'lucide-react';
import { api } from '../../api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.login(form.email, form.password);
      localStorage.setItem('token', data.access_token);

      const profile = await api.getProfile();
      localStorage.setItem('user', JSON.stringify(profile));

      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDuration: '6s' }} />

      <Card className="w-full max-w-md shadow-xl border-0 relative z-10 backdrop-blur-sm bg-white/95">
        <CardHeader className="space-y-3 text-center pb-2">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
            Chào mừng trở lại
          </CardTitle>
          <CardDescription className="text-slate-500">
            Đăng nhập vào tài khoản Study Planner
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pt-2">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email
              </label>
              <Input
                id="login-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="login-password" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Mật khẩu
              </label>
              <Input
                id="login-password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>

            <Button
              id="btn-login"
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-md shadow-indigo-200 hover:shadow-lg transition-all duration-200 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Đăng nhập
                </>
              )}
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-sm text-slate-500">
              Chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors underline underline-offset-2"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
