import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', formData);

      if (response && response.token && response.user) {
        const role = response.user.role;
        if (role !== 'admin' && role !== 'cashier') {
          setError("Sizda ushbu panelga kirish huquqi yo'q");
          setLoading(false);
          return;
        }
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/');
      } else if (response && response.mock) {
        localStorage.setItem('token', 'mock-token-cashier');
        localStorage.setItem('user', JSON.stringify({ name: 'Kassir', role: 'cashier' }));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/');
      } else {
        setError("Server javobida xatolik");
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || "Login yoki parol noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      fontFamily: "'Inter', -apple-system, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decorations */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-30%', right: '-20%', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-15%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)' }} />
      </div>

      <div style={{ position: 'relative', width: '100%', maxWidth: 440, zIndex: 1 }}>
        {/* Logo & Branding */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            
            width: 72, height: 72,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: 20,
            boxShadow: '0 20px 50px rgba(16,185,129,0.3)',
            marginBottom: 20,
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M12 4v16"/>
              <path d="M2 10h20"/>
              <path d="M7 15h.01"/>
              <path d="M17 15h.01"/>
            </svg>
          </div>
          <h1 style={{
            fontSize: 28, fontWeight: 800, color: 'white',
            margin: 0, letterSpacing: '-0.5px',
          }}>
            Ranomed - 2
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.5)', marginTop: 6,
            fontSize: 14, fontWeight: 500, letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}>
            Kassir paneli
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 24,
          padding: '36px 32px',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'white', margin: 0 }}>Tizimga kirish</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', marginTop: 8, fontSize: 14 }}>
              Ma'lumotlaringizni kiriting
            </p>
          </div>

          {error && (
            <div style={{
              marginBottom: 20, padding: '12px 16px',
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 12, color: '#fca5a5', fontSize: 13, textAlign: 'center',
              fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 8, letterSpacing: '0.3px' }}>Login</label>
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  type="text" value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  style={{
                    width: '100%', boxSizing: 'border-box', paddingLeft: 44, paddingRight: 16,
                    paddingTop: 14, paddingBottom: 14,
                    border: '1.5px solid rgba(255,255,255,0.12)',
                    borderRadius: 12, fontSize: 15, outline: 'none',
                    transition: 'all 0.25s',
                    background: 'rgba(255,255,255,0.06)',
                    color: 'white',
                  }}
                  placeholder="Loginni kiriting" required
                  onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 26 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 8, letterSpacing: '0.3px' }}>Parol</label>
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'} value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{
                    width: '100%', boxSizing: 'border-box', paddingLeft: 44, paddingRight: 48,
                    paddingTop: 14, paddingBottom: 14,
                    border: '1.5px solid rgba(255,255,255,0.12)',
                    borderRadius: 12, fontSize: 15, outline: 'none',
                    transition: 'all 0.25s',
                    background: 'rgba(255,255,255,0.06)',
                    color: 'white',
                  }}
                  placeholder="Parolni kiriting" required
                  onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4,
                }}>
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '15px 0',
                background: loading ? 'rgba(16,185,129,0.4)' : 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white', border: 'none', borderRadius: 14,
                fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 8px 28px rgba(16,185,129,0.35)',
                transition: 'all 0.3s',
                letterSpacing: '0.3px',
              }}
            >
              {loading ? 'Kirish...' : 'Kirish'}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div style={{
            marginTop: 20,
            padding: '12px 14px',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 12,
            border: '1px dashed rgba(255, 255, 255, 0.15)',
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ color: 'rgba(255, 255, 255, 0.4)', display: 'block', fontSize: 11 }}>Sinov uchun:</span>
              <strong>Login:</strong> <code style={{ color: '#34d399', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: 4 }}>cashier</code>
            </div>
            <div>
              <strong>Parol:</strong> <code style={{ color: '#34d399', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: 4 }}>cashier123</code>
            </div>
          </div>

          {/* Powered by footer */}
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
              Ranomed - 2 Klinika Boshqaruv Tizimi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
