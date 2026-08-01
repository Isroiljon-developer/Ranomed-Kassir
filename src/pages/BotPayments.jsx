import { useState, useEffect } from 'react';
import MainLayout from '../layout/MainLayout.jsx';
import { toast } from 'sonner';
import api from '../api';

export default function BotPayments() {
    const [payments, setPayments] = useState([]);
    const [filter, setFilter] = useState('all');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const data = await api.get('/cashier/bot');
            const formatted = (data || []).map(p => ({
                id: p.id,
                telegram: p.Patient?.telefon || 'Noma\'lum',
                patient: p.Patient?.ism || 'Noma\'lum',
                phone: p.Patient?.telefon,
                branch: p.Branch?.name || 'Noma\'lum',
                doctor: p.Visit?.User?.name || 'Belgilanmagan',
                service: p.Visit?.Service?.name || 'Bot so\'rovi',
                amount: p.summa || 0,
                date: new Date(p.createdAt).toLocaleDateString(),
                time: new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: p.holat,
                receiptUrl: p.chekRaqam
            }));
            setPayments(formatted);
        } catch (error) {
            console.error(error);
            toast.error("Bot to'lovlarini yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
    };

    const filteredPayments = payments.filter(p => {
        if (filter === 'all') return true;
        return p.status === filter;
    });

    const handleConfirm = async (payment) => {
        try {
            await api.put(`/cashier/bot/${payment.id}/confirm`);
            toast.success(`${payment.patient} to'lovi tasdiqlandi!`);
            setSelectedPayment(null);
            fetchPayments();
        } catch (error) {
            toast.error("Xatolik yuz berdi");
        }
    };

    const handleReject = async (payment) => {
        const sabab = prompt("Rad etish sababini kiriting:");
        if (sabab === null) return;
        try {
            await api.put(`/cashier/bot/${payment.id}/reject`, { sabab });
            toast.error(`${payment.patient} to'lovi rad etildi`);
            setSelectedPayment(null);
            fetchPayments();
        } catch (error) {
            toast.error("Xatolik yuz berdi");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className="badge badge-warning">Kutilmoqda</span>;
            case 'receipt_uploaded': return <span className="badge badge-info">Chek yuklangan</span>;
            case 'paid': return <span className="badge badge-success">Tasdiqlangan</span>;
            case 'rejected': return <span className="badge badge-danger">Rad etilgan</span>;
            default: return <span className="badge badge-outline">{status}</span>;
        }
    };

    return (
        <MainLayout title="Bot To'lovlari">
            {/* Stats */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="stat-card">
                    <div className="stat-icon blue">🤖</div>
                    <div>
                        <div className="stat-value">{payments.length}</div>
                        <div className="stat-label">Jami so'rovlar</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon yellow">⏳</div>
                    <div>
                        <div className="stat-value">{payments.filter(p => p.status === 'pending' || p.status === 'receipt_uploaded').length}</div>
                        <div className="stat-label">Kutilmoqda</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">✅</div>
                    <div>
                        <div className="stat-value">{payments.filter(p => p.status === 'paid').length}</div>
                        <div className="stat-label">Tasdiqlangan</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon red">❌</div>
                    <div>
                        <div className="stat-value">{payments.filter(p => p.status === 'rejected').length}</div>
                        <div className="stat-label">Rad etilgan</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-body" style={{ display: 'flex', gap: 12 }}>
                    <button
                        className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFilter('all')}
                    >
                        Hammasi
                    </button>
                    <button
                        className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFilter('pending')}
                    >
                        Kutilmoqda
                    </button>
                    <button
                        className={`btn ${filter === 'receipt_uploaded' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFilter('receipt_uploaded')}
                    >
                        Chek yuklangan
                    </button>
                    <button
                        className={`btn ${filter === 'paid' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFilter('paid')}
                    >
                        Tasdiqlangan
                    </button>
                </div>
            </div>

            {/* Payments Table */}
            <div className="card">
                <div className="card-body">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Telegram</th>
                                    <th>Bemor</th>
                                    <th>Filial</th>
                                    <th>Xizmat</th>
                                    <th>Summa</th>
                                    <th>Vaqt</th>
                                    <th>Status</th>
                                    <th>Amallar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.map(payment => (
                                    <tr key={payment.id}>
                                        <td>
                                            <div style={{ fontWeight: 600, color: '#1e88e5' }}>{payment.telegram}</div>
                                            <div style={{ fontSize: 12, color: '#64748b' }}>{payment.phone}</div>
                                        </td>
                                        <td><strong>{payment.patient}</strong></td>
                                        <td>{payment.branch}</td>
                                        <td>
                                            <div>{payment.service}</div>
                                            <div style={{ fontSize: 12, color: '#64748b' }}>{payment.doctor}</div>
                                        </td>
                                        <td style={{ fontWeight: 600, color: '#1e88e5' }}>{formatMoney(payment.amount)}</td>
                                        <td>
                                            <div>{payment.date}</div>
                                            <div style={{ fontSize: 12, color: '#64748b' }}>{payment.time}</div>
                                        </td>
                                        <td>{getStatusBadge(payment.status)}</td>
                                        <td>
                                            {(payment.status === 'pending' || payment.status === 'receipt_uploaded') && (
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => setSelectedPayment(payment)}
                                                    >
                                                        Ko'rish
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedPayment && (
                <div className="modal-overlay" onClick={() => setSelectedPayment(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Bot to'lovi</h3>
                            <button className="modal-close" onClick={() => setSelectedPayment(null)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                <div style={{ fontSize: 32, color: '#1e88e5', fontWeight: 700 }}>
                                    {formatMoney(selectedPayment.amount)}
                                </div>
                                <div style={{ color: '#64748b' }}>{selectedPayment.service}</div>
                            </div>

                            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, marginBottom: 20 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                                    <div>
                                        <div style={{ fontSize: 12, color: '#64748b' }}>Telegram</div>
                                        <div style={{ fontWeight: 500 }}>{selectedPayment.telegram}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 12, color: '#64748b' }}>Bemor</div>
                                        <div style={{ fontWeight: 500 }}>{selectedPayment.patient}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 12, color: '#64748b' }}>Telefon</div>
                                        <div style={{ fontWeight: 500 }}>{selectedPayment.phone}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 12, color: '#64748b' }}>Filial</div>
                                        <div style={{ fontWeight: 500 }}>{selectedPayment.branch}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 12, color: '#64748b' }}>Shifokor</div>
                                        <div style={{ fontWeight: 500 }}>{selectedPayment.doctor}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 12, color: '#64748b' }}>Sana/Vaqt</div>
                                        <div style={{ fontWeight: 500 }}>{selectedPayment.date} {selectedPayment.time}</div>
                                    </div>
                                </div>
                            </div>

                            {selectedPayment.receiptUrl && (
                                <div style={{ marginBottom: 20 }}>
                                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Yuklangan chek:</div>
                                    <div style={{ background: '#e2e8f0', padding: 40, borderRadius: 8, textAlign: 'center' }}>
                                        📄 Chek rasmi
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-danger" onClick={() => handleReject(selectedPayment)}>
                                ❌ Rad etish
                            </button>
                            <button className="btn btn-success" onClick={() => handleConfirm(selectedPayment)}>
                                ✅ Tasdiqlash
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
