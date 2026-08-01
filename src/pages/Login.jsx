import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [redirecting, setRedirecting] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await api.post('/auth/login', { username, password });
            if (!response || !response.token || !response.user) {
                setError('Server javobida xatolik');
                setLoading(false);
                return;
            }
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            if (response.user.role === 'cashier') {
                navigate('/');
            } else if (response.redirectUrl) {
                const targetUrl = new URL(response.redirectUrl);
                targetUrl.searchParams.set('_token', response.token);
                targetUrl.searchParams.set('_user', JSON.stringify(response.user));
                setRedirecting(response.redirectUrl);
                setTimeout(() => { window.location.href = targetUrl.toString(); }, 1200);
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Kirishda xatolik yuz berdi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">💰</div>
                <h1 className="login-title">Ranomed -2 </h1>
                <p className="login-subtitle">Kassir Panel — Tizimga kirish</p>

                {redirecting && (
                    <div style={{
                        marginBottom: '16px', padding: '12px 15px',
                        background: '#f0fdf4', border: '1px solid #bbf7d0',
                        borderRadius: '12px', color: '#166534', fontSize: '13.5px',
                        fontWeight: 500, textAlign: 'center'
                    }}>
                        ✅ To'g'ri panelingizga yo'naltirilmoqda...
                    </div>
                )}
                {error && !redirecting && <div className="login-error">⚠️ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Username kiriting"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Parol</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="login-btn" disabled={loading || !!redirecting}>
                        {loading ? '⌛ Kuting...' : '💰 Kirish'}
                    </button>
                </form>

                <div style={{ marginTop: '22px', paddingTop: '18px', borderTop: '1px solid #f1f5f9' }}>
                    <p style={{
                        fontSize: '11px', fontWeight: 700, color: '#94a3b8',
                        textTransform: 'uppercase', letterSpacing: '1.5px',
                        marginBottom: '10px', textAlign: 'center'
                    }}>
                        🔑 Sinov uchun login va parol
                    </p>
                    <div
                        onClick={() => { setUsername('cashier'); setPassword('cashier123'); }}
                        style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '12px 14px', borderRadius: '12px',
                            background: '#f0f4ff', border: '1px solid #c7d2fe',
                            cursor: 'pointer', transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#e0e7ff'}
                        onMouseLeave={e => e.currentTarget.style.background = '#f0f4ff'}
                    >
                        <div>
                            <p style={{ fontSize: '11px', color: '#64748b', margin: 0, fontWeight: 500 }}>Kassir paneli uchun:</p>
                            <p style={{ fontSize: '13px', fontWeight: 700, color: '#3730a3', margin: '2px 0 0' }}>
                                Login: <span style={{ fontFamily: 'monospace', color: '#4f46e5' }}>cashier</span>
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Parol:</span>
                            <span style={{
                                fontSize: '12px', fontFamily: 'monospace', fontWeight: 800,
                                background: '#4f46e5', color: 'white',
                                padding: '3px 10px', borderRadius: '8px', display: 'inline-block', marginTop: '2px'
                            }}>cashier123</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
