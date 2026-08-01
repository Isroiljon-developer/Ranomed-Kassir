import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Stethoscope, Lock, User } from 'lucide-react';
import api from '../api';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', formData);

      if (!response || !response.token || !response.user) {
        setError("Server javobida xatolik");
        setLoading(false);
        return;
      }

      const isNurseOrLab = ('cashier' === 'nurse' && (response.user.role === 'nurse' || response.user.role === 'hamshira')) || ('cashier' === 'lab' && (response.user.role === 'lab' || response.user.role === 'laborant'));
      
      if (response.user.role !== 'admin' && response.user.role !== 'cashier' && !isNurseOrLab) {
        setError("Bu panel faqat Kassir uchun! Siz " + response.user.role + " rolidagilar uchun boshqa panelga kirishingiz kerak.");
        setLoading(false);
        return;
      }

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'Login yoki parol noto\'g\'ri');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-2xl mb-4">
            <Stethoscope className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white">Ranomed - 2</h1>
          <p className="text-white/80 mt-2 font-medium">Kassir paneli</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Xush kelibsiz!</h2>
            <p className="text-gray-500 mt-1">Tizimga kirish uchun ma'lumotlarni kiriting</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Login</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50"
                  placeholder="Loginni kiriting"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Parol</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50"
                  placeholder="Parolni kiriting"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors" disabled={loading}>
              {loading ? 'Kirish...' : 'Kirish'}
            </button>
          </form>

          {/* Test Login Ma'lumotlari */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">
              Sinov uchun login va parol:
            </p>
            <div 
              onClick={() => setFormData({ username: 'cashier', password: 'cashier123' })}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 cursor-pointer transition-all"
            >
              <div>
                <p className="text-xs text-gray-500 font-medium">Kassir uchun:</p>
                <p className="text-sm font-semibold text-gray-700">Login: <span className="font-mono text-blue-600">cashier</span></p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 block">Parol:</span>
                <span className="text-xs font-mono font-bold bg-gray-200 text-gray-700 px-2 py-1 rounded">cashier123</span>
              </div>
            </div>
            <p className="text-[11px] text-center text-gray-400 mt-2">
              (Ustiga bossangiz, avtomatik to'ldiriladi)
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
