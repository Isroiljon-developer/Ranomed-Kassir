import { useState, useEffect } from 'react';
import MainLayout from '../layout/MainLayout.jsx';
import { toast } from 'sonner';
import api from '../api';
import Receipt from '../components/Receipt.jsx';

export default function PendingPayments() {
    const [payments, setPayments] = useState([]);
    const [filter, setFilter] = useState('all');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [loading, setLoading] = useState(true);
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState(null);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const data = await api.get('/cashier/pending');
            setPayments(data || []);
        } catch (error) {
            toast.error("To'lovlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
    };

    const getServiceInfo = (payment) => {
        const xizmatlar = payment.xizmatlar;
        const services = Array.isArray(xizmatlar) ? xizmatlar : (xizmatlar ? JSON.parse(xizmatlar) : []);
        const labService = services.find(x => x.labTestId || (x.name && x.name.toLowerCase().includes('laborator')));
        if (labService) {
            return { name: labService.name || 'Laboratoriya tahlili', type: 'lab' };
        }
        if (payment.Visit) {
            return { name: payment.Visit.tashxis || 'Shifokor ko\'rigi', type: 'service' };
        }
        if (payment.WardAdmission) {
            return { name: payment.WardAdmission.Ward?.name || 'Palata', type: 'ward' };
        }
        const wardService = services.find(x => x.name && x.name.includes('Palata'));
        if (wardService) {
            return { name: wardService.name, type: 'ward' };
        }
        const anyService = services[0];
        if (anyService) {
            return { name: anyService.name, type: 'service' };
        }
        return { name: 'Noma\'lum xizmat', type: 'other' };
    };

    const filteredPayments = payments.filter(p => {
        if (filter === 'all') return true;
        const info = getServiceInfo(p);
        return info.type === filter;
    });

    const handleMarkAsPaid = (payment) => {
        setSelectedPayment(payment);
        setShowModal(true);
    };

    const confirmPayment = async () => {
        try {
            await api.put(`/cashier/pending/${selectedPayment.id}/pay`, { usul: paymentMethod });
            toast.success(`${selectedPayment.Patient?.ism || 'Bemor'} uchun to'lov tasdiqlandi!`);

            const info = getServiceInfo(selectedPayment);
            setReceiptData({
                patientName: selectedPayment.Patient?.ism,
                totalAmount: selectedPayment.summa,
                doctorName: selectedDoctorName(selectedPayment),
                paymentMethod: paymentMethod,
                paymentId: selectedPayment.id,
                items: [{ name: info.name, price: selectedPayment.summa }]
            });

            setShowModal(false);
            setShowReceipt(true);
            fetchPayments();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const selectedDoctorName = (p) => {
        return p.Visit?.User?.name || p.WardAdmission?.shifokor?.name || 'Noma\'lum';
    };

    return (
        <MainLayout title="To'lanmaganlar">
            <div className="card mb-6">
                <div className="card-body">
                    <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
                        <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('all')}>
                            Barchasi <span className="badge badge-info">{payments.length}</span>
                        </button>
                        <button className={`btn ${filter === 'ward' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('ward')}>
                            🛏️ Palata <span className="badge badge-warning">{payments.filter(p => getServiceInfo(p).type === 'ward').length}</span>
                        </button>
                        <button className={`btn ${filter === 'service' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('service')}>
                            👨‍⚕️ Shifokor <span className="badge badge-success">{payments.filter(p => getServiceInfo(p).type === 'service').length}</span>
                        </button>
                        <button className={`btn ${filter === 'lab' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('lab')} style={filter === 'lab' ? {background: '#0891b2'} : {}}>
                            🧪 Laboratoriya <span className="badge badge-purple">{payments.filter(p => getServiceInfo(p).type === 'lab').length}</span>
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="animate-pulse" style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--primary)' }}>Yuklanmoqda...</div>
                </div>
            ) : filteredPayments.length === 0 ? (
                <div className="card">
                    <div className="card-body flex flex-col items-center justify-center p-12">
                        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
                        <h3 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)' }}>Barcha to'lovlar amalga oshirilgan!</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Hozirgi kunda to'lanmagan to'lovlar yo'q.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {filteredPayments.map(payment => {
                        const info = getServiceInfo(payment);
                        return (
                            <div key={payment.id} className="card hover:shadow-md" style={{ transition: 'all 0.25s ease' }}>
                                <div className="card-header flex justify-between items-center" style={{ background: '#fafbfc' }}>
                                    <div>
                                        <div className="font-bold text-main" style={{ fontSize: 16 }}>{payment.Patient?.ism || 'Noma\'lum Bemor'}</div>
                                        <div className="text-xs text-muted" style={{ marginTop: 2 }}>Sana: {new Date(payment.createdAt).toLocaleDateString()} {new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--success)' }}>
                                        {formatMoney(payment.summa)}
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: '12px' }}>
                                            <div className="text-xs text-muted uppercase font-bold mb-1">Xizmat Turi</div>
                                            <div className="font-semibold text-sm">{info.name}</div>
                                        </div>
                                        {(payment.Visit?.User || payment.WardAdmission?.shifokor) ? (
                                            <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: '12px' }}>
                                                <div className="text-xs text-muted uppercase font-bold mb-1">Shifokor</div>
                                                <div className="font-semibold text-sm">{selectedDoctorName(payment)}</div>
                                            </div>
                                        ) : (
                                            <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: '12px' }}>
                                                <div className="text-xs text-muted uppercase font-bold mb-1">Kategoriya</div>
                                                <div className="font-semibold text-sm">{info.type === 'lab' ? 'Laboratoriya' : 'Umumiy'}</div>
                                            </div>
                                        )}
                                    </div>
                                    <button className="btn btn-success" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleMarkAsPaid(payment)}>
                                        <span style={{ fontSize: 18 }}>✓</span> To'lovni qabul qilish
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showModal && selectedPayment && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">To'lovni tasdiqlash</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="text-center mb-6">
                                <div style={{ fontSize: 42, color: 'var(--success)', fontWeight: 900, letterSpacing: '-1px' }}>
                                    {formatMoney(selectedPayment.summa)}
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: 15, fontWeight: 600, marginTop: 4 }}>
                                    Bemor: <span style={{ color: 'var(--text-main)' }}>{selectedPayment.Patient?.ism}</span>
                                </div>
                            </div>

                            <div className="form-group mb-4">
                                <label className="form-label">To'lov turi</label>
                                <select className="form-select" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ padding: '14px', fontSize: 15 }}>
                                    <option value="cash">💵 Naqd pul</option>
                                    <option value="terminal">💳 Terminal</option>
                                    <option value="paynet">📱 Paynet</option>
                                    <option value="transfer">🏦 Bank o'tkazmasi</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ padding: '20px 24px' }}>
                            <button className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Bekor qilish</button>
                            <button className="btn btn-success" onClick={confirmPayment} style={{ flex: 2, justifyContent: 'center' }}>
                                ✓ Tasdiqlash va Chek chiqarish
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showReceipt && receiptData && (
                <Receipt
                    data={receiptData}
                    onClose={() => {
                        setShowReceipt(false);
                        setSelectedPayment(null);
                    }}
                />
            )}
        </MainLayout>
    );
}
