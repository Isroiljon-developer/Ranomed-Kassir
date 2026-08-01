import React from 'react';
import { Printer, X, CheckCircle2, Phone, Globe, Landmark } from 'lucide-react';

export default function Receipt({ data, onClose }) {
    const handlePrint = () => {
        const printContent = document.getElementById('printable-receipt').innerHTML;
        const printStyles = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        @media print {
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: white; font-family: 'Inter', sans-serif; }
          #printable-receipt { width: 76mm; margin: 0 auto; padding: 6mm; }
          .no-print { display: none !important; }
        }
        body { font-family: 'Inter', sans-serif; }
        #printable-receipt { width: 76mm; margin: 0 auto; padding: 6mm; }
        .no-print { display: none !important; }
      </style>
    `;
        const win = window.open('', '', 'width=400,height=650');
        win.document.write('<html><head><title>Chek</title>' + printStyles + '</head><body>');
        win.document.write(printContent);
        win.document.write('</body></html>');
        win.document.close();
        setTimeout(() => { win.print(); win.close(); }, 400);
    };

    if (!data) return null;

    const formattedAmount = new Intl.NumberFormat('uz-UZ').format(data.totalAmount || 0);

    const s = {
        overlay: {
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(15,23,42,0.55)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 3000, padding: '16px',
            animation: 'fadeIn 0.2s ease'
        },
        modal: {
            backgroundColor: 'white',
            width: '100%', maxWidth: '360px',
            borderRadius: '24px',
            boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            maxHeight: '90vh',
            animation: 'slideUp 0.25s ease'
        },
        modalHeader: {
            padding: '14px 16px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#fafbfc'
        },
        closeBtn: {
            width: '32px', height: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#f1f5f9',
            borderRadius: '8px', border: 'none',
            color: '#64748b', cursor: 'pointer', fontSize: '16px'
        },
        body: {
            overflowY: 'auto',
            flex: 1
        },
        receipt: {
            padding: '20px',
            textAlign: 'center',
            fontFamily: 'Inter, sans-serif'
        },
        successIcon: {
            width: '60px', height: '60px',
            backgroundColor: '#10b981',
            borderRadius: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 8px 20px rgba(16,185,129,0.4)'
        },
        amount: {
            fontSize: '28px', fontWeight: '900',
            color: '#059669', letterSpacing: '-1px',
            margin: '0 0 4px'
        },
        patientName: {
            fontSize: '11px', fontWeight: '700',
            color: '#94a3b8', textTransform: 'uppercase',
            letterSpacing: '2px', marginBottom: '16px'
        },
        pill: {
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '20px', padding: '6px 16px',
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            fontSize: '10px', fontWeight: '700',
            color: '#64748b', letterSpacing: '1px', marginBottom: '16px'
        },
        dot: { width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10b981' },
        infoCard: {
            backgroundColor: '#f8fafc',
            borderRadius: '14px', border: '1px solid #f1f5f9',
            padding: '14px', textAlign: 'left', marginBottom: '14px'
        },
        infoRow: {
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '10px'
        },
        infoLabel: {
            fontSize: '10px', fontWeight: '700',
            color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px'
        },
        infoValue: { fontSize: '11px', fontWeight: '700', color: '#0f172a' },
        divider: { height: '1px', backgroundColor: '#e2e8f0', margin: '10px 0' },
        serviceRow: {
            display: 'flex', justifyContent: 'space-between',
            marginBottom: '8px', fontSize: '11px'
        },
        dashed: {
            borderTop: '2px dashed #e2e8f0',
            margin: '14px 0'
        },
        qrBox: {
            padding: '10px', backgroundColor: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            borderRadius: '14px', display: 'inline-block',
            marginBottom: '12px'
        },
        contactRow: {
            display: 'flex', justifyContent: 'center', gap: '20px',
            paddingTop: '12px', borderTop: '1px solid #f1f5f9'
        },
        contactItem: {
            display: 'flex', alignItems: 'center', gap: '5px',
            fontSize: '9px', fontWeight: '700', color: '#94a3b8'
        },
        printBtn: {
            margin: '14px 20px',
            width: 'calc(100% - 40px)',
            padding: '13px',
            backgroundColor: '#059669', color: 'white',
            border: 'none', borderRadius: '14px',
            fontSize: '13px', fontWeight: '800',
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            gap: '8px', letterSpacing: '1px',
            textTransform: 'uppercase'
        }
    };

    return (
        <div style={s.overlay}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
            `}</style>
            <div style={s.modal}>
                {/* Header */}
                <div style={s.modalHeader}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                        ✅ To'lov Tasdiqlandi
                    </span>
                    <button onClick={onClose} style={s.closeBtn}>✕</button>
                </div>

                {/* Scrollable body */}
                <div style={s.body}>
                    <div id="printable-receipt" style={s.receipt}>

                        {/* Success Icon */}
                        <div style={s.successIcon}>
                            <CheckCircle2 size={30} color="white" />
                        </div>

                        {/* Amount */}
                        <h1 style={s.amount}>{formattedAmount} so'm</h1>
                        <div style={s.patientName}>{data.patientName}</div>

                        {/* DateTime */}
                        <div style={s.pill}>
                            <span>{new Date().toLocaleDateString('uz-UZ')}</span>
                            <div style={s.dot}></div>
                            <span>{new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        {/* Info */}
                        <div style={s.infoCard}>
                            <div style={s.infoRow}>
                                <span style={s.infoLabel}>Klinika</span>
                                <span style={s.infoValue}>RANOMED MEDICAL</span>
                            </div>
                            {data.doctorName && (
                                <div style={s.infoRow}>
                                    <span style={s.infoLabel}>Shifokor</span>
                                    <span style={s.infoValue}>{data.doctorName}</span>
                                </div>
                            )}
                            <div style={s.divider}></div>
                            <div style={s.infoRow}>
                                <span style={s.infoLabel}>To'lov usuli</span>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    background: 'white', padding: '4px 10px',
                                    borderRadius: '8px', border: '1px solid #f1f5f9'
                                }}>
                                    <Landmark size={11} color="#10b981" />
                                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#0f172a' }}>
                                        {data.paymentMethod === 'cash' ? 'NAQD PUL' :
                                            data.paymentMethod === 'terminal' ? 'TERMINAL' :
                                                data.paymentMethod === 'paynet' ? 'PAYNET' : 'BANK'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Services */}
                        {data.items && data.items.length > 0 && (
                            <div style={{ textAlign: 'left', marginBottom: '14px' }}>
                                <span style={s.infoLabel}>Xizmatlar</span>
                                <div style={{ marginTop: '10px' }}>
                                    {data.items.map((item, idx) => (
                                        <div key={idx} style={s.serviceRow}>
                                            <span style={{ color: '#475569', fontWeight: '600' }}>{item.name}</span>
                                            <span style={{ color: '#0f172a', fontWeight: '800' }}>
                                                {new Intl.NumberFormat('uz-UZ').format(item.price)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ ...s.serviceRow, marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                                    <span style={{ fontWeight: '800', fontSize: '12px' }}>JAMI</span>
                                    <span style={{ fontWeight: '900', color: '#059669', fontSize: '14px' }}>
                                        {formattedAmount} so'm
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Dashed separator */}
                        <div style={s.dashed}></div>

                        {/* QR & Contact */}
                        <div style={s.qrBox}>
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=RANOMED_${data.paymentId}`}
                                alt="QR"
                                style={{ width: '80px', height: '80px', display: 'block' }}
                            />
                        </div>
                        <p style={{ fontSize: '9px', fontWeight: '700', color: '#cbd5e1', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>
                            Tasdiqlandi
                        </p>

                        <div style={s.contactRow}>
                            <div style={s.contactItem}>
                                <Phone size={10} color="#10b981" />
                                <span>+998 71 123 45 67</span>
                            </div>
                            <div style={s.contactItem}>
                                <Globe size={10} color="#10b981" />
                                <span>ranomed.uz</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Print Button */}
                <button onClick={handlePrint} style={s.printBtn} className="no-print">
                    <Printer size={16} />
                    Chop etish
                </button>
            </div>
        </div>
    );
}
