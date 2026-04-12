import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { BookOpen, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email) {
        throw new Error('Vui lòng nhập email');
      }

      await api.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
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
          <CardTitle className="text-2xl">Quên mật khẩu?</CardTitle>
          <CardDescription>Nhập địa chỉ email của bạn để nhận liên kết đặt lại mật khẩu.</CardDescription>
        </CardHeader>
        
        {success ? (
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-6 rounded-xl flex flex-col items-center gap-3 text-center animate-in zoom-in-95">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
              <div>
                <p className="font-bold text-lg">Đã gửi email thành công!</p>
                <p className="text-sm mt-1 opacity-90">Vui lòng kiểm tra hộp thư (và cả thư rác) để tiếp tục đổi mật khẩu nhé.</p>
              </div>
            </div>
            <Button 
                variant="outline" 
                className="w-full mt-4" 
                onClick={() => window.location.href = '/login'}
            >
                Quay về trang đăng nhập
            </Button>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Nhập email của bạn</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required />
                <p className="text-xs text-gray-400">
                    Chúng tôi sẽ gửi một liên kết đổi mật khẩu vào email này.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 transition-all font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang gửi...
                  </>
                ) : 'Gửi yêu cầu'}
              </Button>
              <p className="text-sm text-center text-gray-600">
                Nhớ ra mật khẩu rồi?{' '}
                <Link to="/login" className="text-indigo-600 hover:underline font-medium">
                  Đăng nhập ngay
                </Link>
              </p>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
