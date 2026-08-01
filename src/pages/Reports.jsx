import { useState, useEffect } from 'react';
import MainLayout from '../layout/MainLayout.jsx';
import api from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Reports() {
    const [period, setPeriod] = useState('week');
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalPayments: 0,
        byDoctor: [],
        byService: [],
        byMethod: [],
        monthlyTrend: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                const data = await api.get(`/cashier/reports?period=${period}`);
                setStats(data || {
                    totalRevenue: 0,
                    totalPayments: 0,
                    byDoctor: [],
                    byService: [],
                    byMethod: []
                });
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, [period]);

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
    };

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4'];

    if (loading) return (
        <MainLayout title="Hisobotlar">
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-xl font-bold text-primary">Hisobotlar yuklanmoqda...</div>
            </div>
        </MainLayout>
    );

    return (
        <MainLayout title="Hisobotlar">
            {/* Period Filter */}
            <div className="card mb-6 border-none shadow-sm bg-white">
                <div className="card-body p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h3 className="font-bold text-main text-lg m-0">Moliyaviy ko'rsatkichlar</h3>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${period === 'day' ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-main'}`}
                            onClick={() => setPeriod('day')}
                        >
                            Bugun
                        </button>
                        <button
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${period === 'week' ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-main'}`}
                            onClick={() => setPeriod('week')}
                        >
                            Hafta
                        </button>
                        <button
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${period === 'month' ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-main'}`}
                            onClick={() => setPeriod('month')}
                        >
                            Oy
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl backdrop-blur-sm">
                                💰
                            </div>
                            <div className="text-sm font-semibold uppercase tracking-wider text-white/80">Jami tushum</div>
                        </div>
                        <div className="text-3xl font-black">{formatMoney(stats.totalRevenue)}</div>
                    </div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-xl">
                            🧾
                        </div>
                        <div className="text-sm font-semibold uppercase tracking-wider text-muted">Tranzaksiyalar</div>
                    </div>
                    <div className="text-3xl font-black text-main">{stats.totalPayments} <span className="text-base font-semibold text-muted lowercase">ta chek</span></div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-xl">
                            📈
                        </div>
                        <div className="text-sm font-semibold uppercase tracking-wider text-muted">O'rtacha chek</div>
                    </div>
                    <div className="text-3xl font-black text-main">
                        {formatMoney(stats.totalRevenue / (stats.totalPayments || 1))}
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="card shadow-sm border-border h-[400px]">
                    <div className="card-header bg-transparent border-b border-dashed border-border py-4">
                        <h3 className="card-title text-main">Xizmatlar bo'yicha ulush</h3>
                    </div>
                    <div className="card-body h-[320px] flex items-center justify-center">
                        {stats.byService.length === 0 ? (
                            <div className="text-muted text-center py-10">Ma'lumot yo'q</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.byService}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {stats.byService.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value) => formatMoney(value)}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="card shadow-sm border-border h-[400px]">
                    <div className="card-header bg-transparent border-b border-dashed border-border py-4">
                        <h3 className="card-title text-main">To'lov usullari</h3>
                    </div>
                    <div className="card-body h-[320px] pt-8">
                        {stats.byMethod.length === 0 ? (
                            <div className="text-muted text-center py-10">Ma'lumot yo'q</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.byMethod} barSize={40}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
                                    <Tooltip 
                                        formatter={(value) => formatMoney(value)}
                                        cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                        {stats.byMethod.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[1]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Daily Trend */}
            {stats.monthlyTrend && stats.monthlyTrend.length > 0 && (
                <div className="card shadow-sm border-border mb-8" style={{ height: '320px' }}>
                    <div className="card-header bg-transparent border-b border-dashed border-border py-4">
                        <h3 className="card-title text-main">📅 Kunlik tushum dinamikasi</h3>
                    </div>
                    <div className="card-body" style={{ height: '240px', paddingTop: '16px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.monthlyTrend} barSize={28}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={8} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dx={-8} tickFormatter={(v) => (v >= 1000000 ? (v/1000000).toFixed(1)+'M' : v >= 1000 ? (v/1000).toFixed(0)+'K' : v)} />
                                <Tooltip
                                    formatter={(value) => formatMoney(value)}
                                    labelFormatter={(label) => `Sana: ${label}`}
                                    cursor={{ fill: 'rgba(99, 102, 241, 0.06)' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="#6366f1" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Doctor Revenue Table */}
            <div className="card shadow-sm border-border overflow-hidden">
                <div className="card-header bg-slate-50/50 border-b border-border py-4">
                    <h3 className="card-title text-main">Shifokorlar bo'yicha reyting</h3>
                </div>
                <div className="card-body p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-border">
                                    <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">#</th>
                                    <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Shifokor</th>
                                    <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Tushum</th>
                                    <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Ulushi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {stats.byDoctor.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-muted">Ma'lumot topilmadi</td>
                                    </tr>
                                ) : (
                                    stats.byDoctor.map((doc, index) => {
                                        const percent = ((doc.amount / (stats.totalRevenue || 1)) * 100).toFixed(1);
                                        return (
                                            <tr key={doc.doctor} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-4 font-bold text-muted">{index + 1}</td>
                                                <td className="p-4 font-bold text-main flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">
                                                        {doc.doctor.charAt(0)}
                                                    </div>
                                                    {doc.doctor}
                                                </td>
                                                <td className="p-4 font-black text-success">
                                                    {formatMoney(doc.amount)}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-primary rounded-full" 
                                                                style={{ width: `${Math.min(100, percent)}%` }} 
                                                            />
                                                        </div>
                                                        <span className="text-xs font-bold text-muted">{percent}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
