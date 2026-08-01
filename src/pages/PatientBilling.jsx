import { useState, useEffect } from 'react';
import MainLayout from '../layout/MainLayout.jsx';
import { toast } from 'sonner';
import api from '../api';

const formatMoney = (amount) =>
    new Intl.NumberFormat('uz-UZ').format(amount || 0) + " so'm";

export default function PatientBilling() {
    const [admissions, setAdmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAdmission, setSelectedAdmission] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch all ward admissions that are admitted (active)
            const data = await api.get('/cashier/wards');
            setAdmissions(data || []);
        } catch (error) {
            console.error(error);
            toast.error("Ma'lumotlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    const calculateDays = (checkIn) => {
        if (!checkIn) return 0;
        const start = new Date(checkIn);
        const now = new Date();
        return Math.max(1, Math.ceil((now - start) / (1000 * 60 * 60 * 24)));
    };

    const filteredAdmissions = admissions.filter(adm => {
        const name = adm.Patient?.ism || '';
        const ward = adm.Ward?.name || adm.Ward?.room_number || '';
        return (
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(ward).toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <MainLayout title="Bemor Hisobi">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    borderRadius: '20px',
                    padding: '28px 32px',
                    marginBottom: '28px',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800' }}>
                            🏥 Palata Bemorlari Hisobi
                        </h2>
                        <p style={{ margin: '6px 0 0', opacity: 0.85, fontSize: '14px' }}>
                            Hozirda palatada yotgan bemorlar va ularning qarzlari
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '32px', fontWeight: '900' }}>{admissions.length}</div>
                        <div style={{ fontSize: '13px', opacity: 0.85 }}>Aktiv bemor</div>
                    </div>
                </div>

                {/* Search */}
                <div style={{ marginBottom: '20px' }}>
                    <input
                        type="text"
                        placeholder="🔍 Bemor yoki palata bo'yicha qidirish..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '13px 18px',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '14px',
                            fontSize: '14px',
                            outline: 'none',
                            background: 'white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Admission List */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', fontSize: '18px' }}>
                        ⏳ Yuklanmoqda...
                    </div>
                ) : filteredAdmissions.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        background: 'white',
                        borderRadius: '20px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏥</div>
                        <h3 style={{ color: '#64748b', margin: '0 0 8px' }}>Hozirda palatada bemor yo'q</h3>
                        <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
                            {searchTerm ? 'Qidiruv natijasi topilmadi' : 'Qabulxona orqali bemorlarni palataga joylashtiring'}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {filteredAdmissions.map((adm) => {
                            const days = calculateDays(adm.admissionDate);
                            const dailyPrice = adm.dailyPrice || adm.pricePerDay || (adm.totalAmount / (adm.expectedDays || 1));
                            const totalDebt = days * dailyPrice;
                            const prepaid = adm.prepaidAmount || adm.totalAmount || 0;
                            const remaining = Math.max(0, totalDebt - prepaid);
                            const wardName = adm.Ward?.name || adm.Ward?.room_number || `Palata #${adm.wardId}`;
                            const patientName = adm.Patient?.ism || 'Noma\'lum';

                            return (
                                <div
                                    key={adm.id}
                                    onClick={() => setSelectedAdmission(selectedAdmission?.id === adm.id ? null : adm)}
                                    style={{
                                        background: 'white',
                                        borderRadius: '18px',
                                        border: selectedAdmission?.id === adm.id
                                            ? '2px solid #6366f1'
                                            : '1px solid #e2e8f0',
                                        padding: '20px 24px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: selectedAdmission?.id === adm.id
                                            ? '0 4px 20px rgba(99,102,241,0.15)'
                                            : '0 2px 8px rgba(0,0,0,0.04)'
                                    }}
                                >
                                    {/* Row Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                        {/* Left: Patient info */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <div style={{
                                                width: '46px',
                                                height: '46px',
                                                borderRadius: '12px',
                                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: '800',
                                                fontSize: '16px',
                                                flexShrink: 0
                                            }}>
                                                {patientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '16px', color: '#0f172a' }}>
                                                    {patientName}
                                                </div>
                                                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                                                    🛏️ {wardName} &nbsp;|&nbsp; 📅 {days} kun yotdi
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Financial status */}
                                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>Jami qarz</div>
                                                <div style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                                                    {formatMoney(totalDebt)}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>To'langan</div>
                                                <div style={{ fontSize: '17px', fontWeight: '800', color: '#10b981' }}>
                                                    {formatMoney(prepaid)}
                                                </div>
                                            </div>
                                            <div style={{
                                                background: remaining > 0 ? '#fef2f2' : '#f0fdf4',
                                                border: `1px solid ${remaining > 0 ? '#fecaca' : '#bbf7d0'}`,
                                                borderRadius: '10px',
                                                padding: '8px 14px',
                                                textAlign: 'center'
                                            }}>
                                                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>
                                                    {remaining > 0 ? 'Qolgan qarz' : 'To\'liq to\'langan'}
                                                </div>
                                                <div style={{
                                                    fontSize: '18px',
                                                    fontWeight: '900',
                                                    color: remaining > 0 ? '#dc2626' : '#16a34a'
                                                }}>
                                                    {formatMoney(remaining)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Detail */}
                                    {selectedAdmission?.id === adm.id && (
                                        <div style={{
                                            marginTop: '20px',
                                            paddingTop: '20px',
                                            borderTop: '1px dashed #e2e8f0'
                                        }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                                                {[
                                                    { label: 'Kirish sanasi', value: adm.admissionDate ? new Date(adm.admissionDate).toLocaleDateString('uz-UZ') : '-' },
                                                    { label: 'Kunlik narx', value: formatMoney(dailyPrice) },
                                                    { label: 'Yotgan kunlar', value: `${days} kun` },
                                                    { label: 'Reja (kun)', value: `${adm.expectedDays || 5} kun` },
                                                    { label: 'Telefon', value: adm.Patient?.telefon || '-' },
                                                    { label: 'Shifokor', value: adm.Doctor?.name || '-' }
                                                ].map((item, i) => (
                                                    <div key={i} style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px' }}>
                                                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', marginBottom: '4px' }}>{item.label}</div>
                                                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{item.value}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                                {remaining > 0 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toast.info(`${patientName} - qolgan qarz: ${formatMoney(remaining)}`);
                                                        }}
                                                        style={{
                                                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '10px',
                                                            padding: '10px 20px',
                                                            fontWeight: '700',
                                                            cursor: 'pointer',
                                                            fontSize: '14px'
                                                        }}
                                                    >
                                                        💰 Qarzni to'lash
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.print();
                                                    }}
                                                    style={{
                                                        background: '#f1f5f9',
                                                        color: '#475569',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '10px',
                                                        padding: '10px 20px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        fontSize: '14px'
                                                    }}
                                                >
                                                    🖨️ Chek
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Total Summary */}
                {filteredAdmissions.length > 0 && (
                    <div style={{
                        marginTop: '24px',
                        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                        borderRadius: '20px',
                        padding: '24px 28px',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '20px'
                    }}>
                        <div>
                            <div style={{ fontSize: '13px', opacity: 0.7 }}>Jami bemorlar</div>
                            <div style={{ fontSize: '28px', fontWeight: '900' }}>{filteredAdmissions.length} ta</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '13px', opacity: 0.7 }}>Umumiy qarz</div>
                            <div style={{ fontSize: '28px', fontWeight: '900', color: '#f87171' }}>
                                {formatMoney(filteredAdmissions.reduce((sum, adm) => {
                                    const days = calculateDays(adm.admissionDate);
                                    const dailyPrice = adm.dailyPrice || adm.pricePerDay || (adm.totalAmount / (adm.expectedDays || 1));
                                    const totalDebt = days * dailyPrice;
                                    const prepaid = adm.prepaidAmount || adm.totalAmount || 0;
                                    return sum + Math.max(0, totalDebt - prepaid);
                                }, 0))}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '13px', opacity: 0.7 }}>Jami to'langan</div>
                            <div style={{ fontSize: '28px', fontWeight: '900', color: '#4ade80' }}>
                                {formatMoney(filteredAdmissions.reduce((sum, adm) =>
                                    sum + (adm.prepaidAmount || adm.totalAmount || 0), 0))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
