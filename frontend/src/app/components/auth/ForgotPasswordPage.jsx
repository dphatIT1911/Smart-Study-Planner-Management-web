import { useState } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { BookOpen, AlertCircle, Loader2, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import { api } from '../../api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setStatus('error');
      setMessage('Vui lòng nhập email.');
      return;
    }

    setStatus('loading');
    try {
      const data = await api.forgotPassword(email);
      setStatus('success');
      setMessage(data.message || 'Đã gửi liên kết khôi phục mật khẩu. Vui lòng kiểm tra email của bạn.');
    } catch (err) {
      console.error('Forgot password error:', err);
      setStatus('error');
      setMessage(err.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDuration: '6s' }} />

      <Card className="w-full max-w-md shadow-xl border-0 relative z-10 backdrop-blur-sm bg-white/95">
        <CardHeader className="space-y-3 text-center pb-2">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
            Khôi phục mật khẩu
          </CardTitle>
          <CardDescription className="text-slate-500">
            Nhập email của bạn để nhận liên kết đặt lại mật khẩu
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pt-2">
          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{message}</p>
            </div>
          )}

          {status === 'success' ? (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-sm font-medium">{message}</p>
              </div>
              <Button asChild className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white">
                <Link to="/login">Quay lại trang đăng nhập</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Email đăng ký
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>

              <Button
                type="submit"
                disabled={status === 'loading'}
                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-md shadow-indigo-200 hover:shadow-lg transition-all duration-200 gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  'Gửi yêu cầu'
                )}
              </Button>
            </form>
          )}

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Quay lại đăng nhập
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
