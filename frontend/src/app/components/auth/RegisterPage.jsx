import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { BookOpen, AlertCircle, Loader2, Mail, Lock, User, UserPlus, CheckCircle2 } from 'lucide-react';
import { api } from '../../api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm_password: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Live password match indicator
  const passwordsMatch =
    form.password.length > 0 &&
    form.confirm_password.length > 0 &&
    form.password === form.confirm_password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password || !form.confirm_password) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (form.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }
    if (form.password !== form.confirm_password) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.register(form);
      localStorage.setItem('token', data.access_token);

      const profile = await api.getProfile();
      localStorage.setItem('user', JSON.stringify(profile));

      navigate('/');
    } catch (err) {
      console.error('Register error:', err);
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Decorative blobs */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDuration: '7s' }} />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDuration: '9s' }} />

      <Card className="w-full max-w-md shadow-xl border-0 relative z-10 backdrop-blur-sm bg-white/95">
        <CardHeader className="space-y-3 text-center pb-2">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">
            Tạo tài khoản mới
          </CardTitle>
          <CardDescription className="text-slate-500">
            Bắt đầu hành trình học tập thông minh
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
              <label htmlFor="reg-name" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Họ và tên
              </label>
              <Input
                id="reg-name"
                name="name"
                type="text"
                placeholder="Nguyễn Văn A"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                required
                minLength={3}
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="reg-email" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email
              </label>
              <Input
                id="reg-email"
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
              <label htmlFor="reg-password" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Mật khẩu
              </label>
              <Input
                id="reg-password"
                name="password"
                type="password"
                placeholder="Tối thiểu 8 ký tự"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
                minLength={8}
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="reg-confirm" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Xác nhận mật khẩu
                {passwordsMatch && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-auto" />
                )}
              </label>
              <Input
                id="reg-confirm"
                name="confirm_password"
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={form.confirm_password}
                onChange={handleChange}
                autoComplete="new-password"
                required
                minLength={8}
                className={`h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors ${
                  form.confirm_password && !passwordsMatch
                    ? 'border-red-300 focus:ring-red-200'
                    : passwordsMatch
                    ? 'border-emerald-300 focus:ring-emerald-200'
                    : ''
                }`}
              />
            </div>

            <Button
              id="btn-register"
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-md shadow-purple-200 hover:shadow-lg transition-all duration-200 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang tạo tài khoản...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Đăng ký
                </>
              )}
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-sm text-slate-500">
              Đã có tài khoản?{' '}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors underline underline-offset-2"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
