import { useState, useEffect } from 'react';
import MainLayout from '../layout/MainLayout.jsx';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        todayRevenue: 0,
        pendingPayments: 0,
        wardBilling: 0,
        botPayments: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await api.get('/cashier/stats');
            setStats(data || { todayRevenue: 0, pendingPayments: 0, wardBilling: 0, botPayments: 0 });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatMoney = (amount) => new Intl.NumberFormat('uz-UZ').format(amount || 0) + ' so\'m';

    const chartData = [
        { name: '09:00', amount: stats.todayRevenue * 0.08 },
        { name: '10:00', amount: stats.todayRevenue * 0.18 },
        { name: '11:00', amount: stats.todayRevenue * 0.32 },
        { name: '12:00', amount: stats.todayRevenue * 0.48 },
        { name: '13:00', amount: stats.todayRevenue * 0.55 },
        { name: '14:00', amount: stats.todayRevenue * 0.65 },
        { name: '15:00', amount: stats.todayRevenue * 0.78 },
        { name: '16:00', amount: stats.todayRevenue * 0.88 },
        { name: '17:00', amount: stats.todayRevenue * 0.95 },
        { name: '18:00', amount: stats.todayRevenue },
    ];

    const now = new Date();
    const greeting = now.getHours() < 12 ? 'Xayrli tong' : now.getHours() < 17 ? 'Xayrli kun' : 'Xayrli kech';
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <MainLayout title="Boshqaruv Paneli">
            {/* Greeting */}
            <div style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5, #3730a3)',
                borderRadius: 20, padding: '24px 28px', marginBottom: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(99,102,241,0.35)'
            }}>
                <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -40, right: 80, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
                        {greeting}, {user.name || 'Kassir'}! 👋
                    </div>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4, fontWeight: 500 }}>
                        {now.toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700 }}>Kassa holati</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, justifyContent: 'flex-end' }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399', display: 'inline-block', boxShadow: '0 0 8px #34d399' }}></span>
                        <span style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>OCHIQ</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid" style={{ marginBottom: 28 }}>
                <StatGradientCard
                    icon="💰"
                    value={loading ? '...' : formatMoney(stats.todayRevenue)}
                    label="Bugungi tushum"
                    trend="+12%"
                    trendUp
                    gradient="linear-gradient(135deg, #10b981, #059669)"
                    shadow="rgba(16,185,129,0.3)"
                />
                <StatGradientCard
                    icon="⏳"
                    value={loading ? '...' : stats.pendingPayments}
                    label="To'lanmaganlar"
                    trend="Hozir"
                    onClick={() => navigate('/pending')}
                    gradient={stats.pendingPayments > 0 ? "linear-gradient(135deg, #f59e0b, #d97706)" : "linear-gradient(135deg, #94a3b8, #64748b)"}
                    shadow="rgba(245,158,11,0.3)"
                    clickable
                />
                <StatGradientCard
                    icon="🛏️"
                    value={loading ? '...' : formatMoney(stats.wardBilling)}
                    label="Palata to'lovlari"
                    trend="Yotib davolanish"
                    onClick={() => navigate('/wards')}
                    gradient="linear-gradient(135deg, #6366f1, #4f46e5)"
                    shadow="rgba(99,102,241,0.3)"
                    clickable
                />
                <StatGradientCard
                    icon="🤖"
                    value={loading ? '...' : stats.botPayments}
                    label="Bot to'lovlar"
                    trend="Avtomatik"
                    gradient="linear-gradient(135deg, #06b6d4, #0891b2)"
                    shadow="rgba(6,182,212,0.3)"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
                {/* Revenue Chart */}
                <div className="card">
                    <div className="card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📈</div>
                            <h3 className="card-title">Kunlik tushum dinamikasi</h3>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, background: '#d1fae5', color: '#065f46', padding: '4px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            🟢 Jonli
                        </span>
                    </div>
                    <div className="card-body">
                        <div style={{ height: 280 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: 14, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: 12, fontWeight: 600 }}
                                        formatter={(val) => [formatMoney(val), "Tushum"]}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="card" style={{ flex: 1 }}>
                        <div className="card-header" style={{ paddingBottom: 14 }}>
                            <h3 className="card-title">Tezkor Amallar</h3>
                        </div>
                        <div className="card-body" style={{ paddingTop: 12 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {[
                                    { icon: '💳', title: "Yangi to'lov", desc: "Bemor hisobini to'ldirish", path: '/billing', color: '#6366f1', bg: '#ede9fe' },
                                    { icon: '⏳', title: "To'lanmaganlar", desc: `${stats.pendingPayments} ta to'lov kutmoqda`, path: '/pending', color: '#f59e0b', bg: '#fef3c7' },
                                    { icon: '🛏️', title: "Palata to'lovlari", desc: "5 kunlik oldindan to'lov", path: '/wards', color: '#3b82f6', bg: '#dbeafe' },
                                    { icon: '🎫', title: "Bez Ochirit", desc: "Navbatsiz kirish cheki", path: '/bez-ochirit', color: '#8b5cf6', bg: '#f5f3ff' },
                                    { icon: '📊', title: "Hisobotlar", desc: "Kunlik tushum tahlili", path: '/reports', color: '#10b981', bg: '#ecfdf5' },
                                ].map(item => (
                                    <button
                                        key={item.path}
                                        onClick={() => navigate(item.path)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 12,
                                            padding: '11px 14px', borderRadius: 12,
                                            border: '1.5px solid #e2e8f0',
                                            background: 'white', cursor: 'pointer',
                                            textAlign: 'left', fontFamily: 'inherit',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = item.bg;
                                            e.currentTarget.style.borderColor = item.color + '40';
                                            e.currentTarget.style.transform = 'translateX(4px)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = 'white';
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                            e.currentTarget.style.transform = 'translateX(0)';
                                        }}
                                    >
                                        <div style={{
                                            width: 38, height: 38, borderRadius: 10,
                                            background: item.bg,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 18, flexShrink: 0
                                        }}>
                                            {item.icon}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{item.title}</div>
                                            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{item.desc}</div>
                                        </div>
                                        <span style={{ color: '#cbd5e1', fontSize: 16 }}>›</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

function StatGradientCard({ icon, value, label, trend, trendUp, gradient, shadow, onClick, clickable }) {
    return (
        <div
            onClick={onClick}
            style={{
                background: 'white',
                borderRadius: 18,
                border: '1px solid #e2e8f0',
                padding: '0',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'all 0.25s ease',
                cursor: clickable ? 'pointer' : 'default',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
            onMouseEnter={e => {
                if (clickable) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 12px 28px ${shadow}`;
                }
            }}
            onMouseLeave={e => {
                if (clickable) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                }
            }}
        >
            <div style={{ background: gradient, padding: '18px 22px 14px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ fontSize: 28, lineHeight: 1, marginBottom: 8, position: 'relative', zIndex: 1 }}>{icon}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'white', letterSpacing: '-0.5px', position: 'relative', zIndex: 1, lineHeight: 1.2 }}>
                    {value}
                </div>
            </div>
            <div style={{ padding: '12px 22px 16px', flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b' }}>{label}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: trendUp ? '#059669' : '#94a3b8', marginTop: 4 }}>
                    {trendUp && '↑ '}{trend}
                </div>
            </div>
        </div>
    );
}
