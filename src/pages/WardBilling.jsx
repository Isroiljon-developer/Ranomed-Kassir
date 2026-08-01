import { useState, useEffect } from 'react';
import MainLayout from '../layout/MainLayout.jsx';
import { toast } from 'sonner';
import Receipt from '../components/Receipt';
import api from '../api';

// Qo'shimcha xizmatlar ro'yxati (palata bilan birga)
const EXTRA_SERVICES = [
  { id: 'ekg', name: 'EKG (Elektrokardioqrafiya)', price: 80000, icon: '❤️' },
  { id: 'uzi_qorin', name: "UZI (Qorin bo'shlig'i)", price: 120000, icon: '🔬' },
  { id: 'uzi_yurak', name: 'ExoKG (Yurak UZI)', price: 150000, icon: '💓' },
  { id: 'rentgen', name: 'Rentgen (Ko\'krak)', price: 60000, icon: '🩻' },
  { id: 'qon_umumiy', name: 'Qon tahlili (umumiy)', price: 35000, icon: '🧪' },
  { id: 'qon_biokimyo', name: 'Qon biokimyosi', price: 80000, icon: '🧫' },
  { id: 'siydik', name: 'Siydik tahlili', price: 25000, icon: '💧' },
  { id: 'mrt', name: 'MRT (Miyа)', price: 450000, icon: '🧠' },
  { id: 'kt', name: 'KT (Skan)', price: 350000, icon: '⚡' },
  { id: 'glyukoza', name: 'Qon glyukozasi', price: 30000, icon: '🩸' },
  { id: 'koagulo', name: 'Koagulogramma', price: 90000, icon: '🔩' },
  { id: 'konsultatsiya', name: 'Shifokor konsultatsiyasi', price: 50000, icon: '👨‍⚕️' },
];

const PREPAY_DAYS = 5; // Majburiy oldindan to'lov kunlari

export default function WardBilling() {
  const [wards, setWards] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedWard, setSelectedWard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [extraServices, setExtraServices] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [receiptData, setReceiptData] = useState(null);
  const [customDays, setCustomDays] = useState(PREPAY_DAYS);

  useEffect(() => { fetchWards(); }, []);

  const fetchWards = async () => {
    try {
      setLoading(true);
      const data = await api.get('/cashier/wards');
      const formatted = data.map(w => {
        const occupancy = w.Occupants?.[0];
        return {
          id: w.id,
          room: w.name || `Xona #${w.id}`,
          type: w.type || 'Standard',
          pricePerDay: Number(w.price_per_day) || 200000,
          status: occupancy ? 'occupied' : 'empty',
          patient: occupancy ? {
            id: occupancy.Patient?.id,
            admissionId: occupancy.id,
            name: occupancy.Patient?.ism,
            checkIn: occupancy.admissionDate,
            checkOut: occupancy.dischargeDate || new Date().toISOString().split('T')[0]
          } : null
        };
      });
      setWards(formatted);
    } catch (error) {
      console.error(error);
      toast.error("Palatalarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount) => new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';

  const calculateDays = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut || new Date());
    return Math.max(1, Math.round(Math.abs(end - start) / (1000 * 60 * 60 * 24) * 10) / 10);
  };

  const isCheckoutToday = (checkOut) => {
    if (!checkOut) return false;
    return checkOut === new Date().toISOString().split('T')[0];
  };

  const filteredWards = wards.filter(w => {
    if (filter === 'occupied') return w.status === 'occupied';
    if (filter === 'empty') return w.status === 'empty';
    return true;
  });

  const toggleExtra = (service) => {
    setExtraServices(prev =>
      prev.find(s => s.id === service.id)
        ? prev.filter(s => s.id !== service.id)
        : [...prev, service]
    );
  };

  const prepayTotal = selectedWard ? customDays * selectedWard.pricePerDay : 0;
  const extrasTotal = extraServices.reduce((s, e) => s + e.price, 0);
  const grandTotal = prepayTotal + extrasTotal;

  const handleOpenModal = (ward) => {
    setSelectedWard(ward);
    setExtraServices([]);
    setCustomDays(PREPAY_DAYS);
    setPaymentMethod('cash');
  };

  const handlePayment = async () => {
    if (!selectedWard) return;
    try {
      const items = [
        { type: 'ward', name: `Palata ${selectedWard.room} (${customDays} kun oldindan to'lov)`, price: prepayTotal },
        ...extraServices.map(s => ({ type: 'extra', name: s.name, price: s.price }))
      ];

      const res = await api.post('/cashier/payment', {
        patientId: selectedWard.patient.id,
        wardAdmissionId: selectedWard.patient.admissionId,
        summa: grandTotal,
        usul: paymentMethod,
        xizmatlar: items
      });

      setReceiptData({
        patientName: selectedWard.patient.name,
        totalAmount: grandTotal,
        paymentMethod,
        paymentId: res.id || Date.now(),
        items
      });

      toast.success(`${selectedWard.patient.name} uchun ${formatMoney(grandTotal)} to'lov qabul qilindi!`);
      setSelectedWard(null);
    } catch (error) {
      console.error(error);
      toast.error("To'lovni saqlashda xatolik");
    }
  };

  return (
    <MainLayout title="Palata Hisobi">
      {receiptData && (
        <Receipt data={receiptData} onClose={() => { setReceiptData(null); fetchWards(); }} />
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl">🛏️</div>
          <div>
            <div className="text-3xl font-black text-main">{wards.length}</div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider mt-1">Jami palatalar</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-red-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-2xl">🤒</div>
          <div>
            <div className="text-3xl font-black text-danger">{wards.filter(w => w.status === 'occupied').length}</div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider mt-1">Band palatalar</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl">✨</div>
          <div>
            <div className="text-3xl font-black text-success">{wards.filter(w => w.status === 'empty').length}</div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider mt-1">Bo'sh palatalar</div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
        <span className="text-2xl">⚠️</span>
        <div>
          <p className="font-bold text-amber-900 text-sm">Majburiy oldindan to'lov</p>
          <p className="text-amber-700 text-xs mt-0.5">
            Palataga yotqizishda <strong>{PREPAY_DAYS} kunlik</strong> oldindan to'lov talab qilinadi.
            Qo'shimcha xizmatlar (EKG, UZI, tahlillar) ham shu to'lovga qo'shiladi.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6 shadow-sm">
        <div className="card-body p-4 flex gap-3">
          {[
            { key: 'all', label: 'Barchasi', count: wards.length },
            { key: 'occupied', label: 'Band', count: wards.filter(w => w.status === 'occupied').length, danger: true },
            { key: 'empty', label: "Bo'sh", count: wards.filter(w => w.status === 'empty').length, success: true },
          ].map(({ key, label, count, danger, success }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border ${
                filter === key
                  ? danger ? 'bg-danger text-white border-danger shadow-sm'
                  : success ? 'bg-success text-white border-success shadow-sm'
                  : 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-muted border-border hover:border-slate-300'
              }`}
            >
              {label}
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                filter === key ? 'bg-white/20' : 'bg-slate-100'
              }`}>{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Wards Grid */}
      {loading ? (
        <div className="text-center py-16 animate-pulse text-primary font-bold text-lg">Palatalar yuklanmoqda...</div>
      ) : filteredWards.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-border">
          <div className="text-5xl mb-4 opacity-40">🏥</div>
          <p className="text-muted font-semibold">Palatalar topilmadi</p>
        </div>
      ) : (
        <div className="ward-grid">
          {filteredWards.map(ward => (
            <div
              key={ward.id}
              className={`ward-card ${ward.status === 'occupied' ? 'occupied' : ''}`}
              style={{ cursor: ward.patient ? 'pointer' : 'default' }}
              onClick={() => ward.patient && handleOpenModal(ward)}
            >
              <div className="ward-card-header">
                <div>
                  <div className="ward-card-room">{ward.room}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginTop: 2 }}>
                    {ward.type}
                  </div>
                </div>
                <span className={`badge ${ward.status === 'occupied' ? 'badge-danger' : 'badge-success'}`}>
                  {ward.status === 'occupied' ? '🔴 Band' : '🟢 Bo\'sh'}
                </span>
              </div>

              {ward.patient ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: '1px dashed var(--border)', borderBottom: '1px dashed var(--border)' }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%',
                      background: 'var(--primary-glow)',
                      color: 'var(--primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: 16
                    }}>
                      {ward.patient.name.charAt(0)}
                    </div>
                    <div>
                      <div className="ward-card-patient">{ward.patient.name}</div>
                      {isCheckoutToday(ward.patient.checkOut) && (
                        <span className="badge badge-warning" style={{ fontSize: 10, marginTop: 2 }}>Bugun chiqadi</span>
                      )}
                    </div>
                  </div>
                  <div className="ward-card-info">📥 Kirish: {ward.patient.checkIn}</div>
                  <div className="ward-card-info">📤 Chiqish: {ward.patient.checkOut}</div>
                  <div className="ward-card-info">⏱️ Muddati: {calculateDays(ward.patient.checkIn, ward.patient.checkOut)} kun</div>
                  <div className="ward-card-total">💰 Oldindan to'lov: {formatMoney(PREPAY_DAYS * ward.pricePerDay)}</div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🍃</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{ward.type}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--success)', marginTop: 4 }}>{formatMoney(ward.pricePerDay)}/kun</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      {selectedWard && (
        <div className="modal-overlay" onClick={() => setSelectedWard(null)}>
          <div
            className="modal"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', borderBottom: 'none' }}>
              <div>
                <h3 className="modal-title" style={{ color: 'white', fontSize: 18 }}>
                  🛏️ {selectedWard.room} — To'lov
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 3 }}>
                  Bemor: <strong style={{ color: 'white' }}>{selectedWard.patient.name}</strong>
                </p>
              </div>
              <button className="modal-close" onClick={() => setSelectedWard(null)}
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                &times;
              </button>
            </div>

            <div className="modal-body" style={{ padding: '20px 24px' }}>
              {/* Oldindan to'lov */}
              <div style={{
                background: 'linear-gradient(135deg, #f0f4ff, #e8f0fe)',
                border: '1.5px solid #c7d7ff',
                borderRadius: 16,
                padding: 18,
                marginBottom: 20
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#3730a3', textTransform: 'uppercase', letterSpacing: 1 }}>
                      ⚠️ Majburiy Oldindan To'lov
                    </div>
                    <div style={{ fontSize: 12, color: '#6366f1', marginTop: 3 }}>
                      {PREPAY_DAYS} kunlik to'lov talab qilinadi
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: '#6366f1', fontWeight: 700, textTransform: 'uppercase' }}>Narx/kun</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#3730a3' }}>{formatMoney(selectedWard.pricePerDay)}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#3730a3', flexShrink: 0 }}>Kunlar soni:</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                    <button
                      onClick={() => setCustomDays(d => Math.max(1, d - 1))}
                      style={{ width: 32, height: 32, borderRadius: 8, background: 'white', border: '1.5px solid #c7d7ff', fontWeight: 700, cursor: 'pointer' }}
                    >−</button>
                    <span style={{ fontSize: 20, fontWeight: 900, color: '#3730a3', minWidth: 40, textAlign: 'center' }}>{customDays}</span>
                    <button
                      onClick={() => setCustomDays(d => d + 1)}
                      style={{ width: 32, height: 32, borderRadius: 8, background: 'white', border: '1.5px solid #c7d7ff', fontWeight: 700, cursor: 'pointer' }}
                    >+</button>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#4f46e5' }}>{formatMoney(prepayTotal)}</div>
                </div>
              </div>

              {/* Qo'shimcha xizmatlar */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  🩺 Qo'shimcha Xizmatlar
                  {extraServices.length > 0 && (
                    <span style={{ background: 'var(--primary)', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                      {extraServices.length} ta tanlandi
                    </span>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {EXTRA_SERVICES.map(service => {
                    const isSelected = extraServices.find(s => s.id === service.id);
                    return (
                      <button
                        key={service.id}
                        onClick={() => toggleExtra(service)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '10px 12px',
                          borderRadius: 12,
                          border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                          background: isSelected ? 'var(--primary-glow)' : 'white',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                          fontFamily: 'inherit'
                        }}
                      >
                        <span style={{ fontSize: 18 }}>{service.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: isSelected ? 'var(--primary)' : 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {service.name}
                          </div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }}>
                            {formatMoney(service.price)}
                          </div>
                        </div>
                        {isSelected && <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 14 }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* To'lov usuli */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 10 }}>💳 To'lov Usuli</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {[
                    { value: 'cash', icon: '💵', label: 'Naqd' },
                    { value: 'terminal', icon: '💳', label: 'Terminal' },
                    { value: 'paynet', icon: '📱', label: 'Paynet' },
                    { value: 'transfer', icon: '🏦', label: 'Bank' },
                  ].map(m => (
                    <button
                      key={m.value}
                      onClick={() => setPaymentMethod(m.value)}
                      style={{
                        padding: '12px 8px',
                        borderRadius: 12,
                        border: `2px solid ${paymentMethod === m.value ? 'var(--primary)' : 'var(--border)'}`,
                        background: paymentMethod === m.value ? 'var(--primary-glow)' : 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        fontFamily: 'inherit',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span style={{ fontSize: 22 }}>{m.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: paymentMethod === m.value ? 'var(--primary)' : 'var(--text-muted)' }}>
                        {m.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div style={{
                background: 'var(--bg-main)',
                borderRadius: 14,
                padding: 16,
                border: '1.5px solid var(--border)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>🛏️ Palata ({customDays} kun):</span>
                  <span style={{ fontWeight: 700 }}>{formatMoney(prepayTotal)}</span>
                </div>
                {extraServices.map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{s.icon} {s.name}:</span>
                    <span style={{ fontWeight: 700 }}>{formatMoney(s.price)}</span>
                  </div>
                ))}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingTop: 12, marginTop: 8, borderTop: '2px dashed var(--primary)'
                }}>
                  <span style={{ fontSize: 16, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-main)' }}>JAMI:</span>
                  <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--primary)' }}>{formatMoney(grandTotal)}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ gap: 12, padding: '16px 24px' }}>
              <button
                className="btn btn-outline"
                style={{ flex: 1, justifyContent: 'center', padding: '13px' }}
                onClick={() => setSelectedWard(null)}
              >
                Bekor qilish
              </button>
              <button
                className="btn btn-success"
                style={{ flex: 2, justifyContent: 'center', padding: '13px', fontSize: 15, boxShadow: '0 8px 20px rgba(16,185,129,0.3)' }}
                onClick={handlePayment}
              >
                ✓ To'lovni Qabul Qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
