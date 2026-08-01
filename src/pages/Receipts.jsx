import { useState, useEffect } from 'react';
import MainLayout from '../layout/MainLayout.jsx';
import { toast } from 'sonner';
import api from '../api';

const methodLabels = { cash: 'Naqd', terminal: 'Terminal', paynet: 'Paynet', transfer: "Bank o'tkazmasi" };

export default function Receipts() {
    const [receipts, setReceipts] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReceipts();
    }, []);

    const fetchReceipts = async () => {
        try {
            setLoading(true);
            const data = await api.get(`/cashier/receipts${search ? `?search=${search}` : ''}`);
            const formatted = (data || []).map(p => ({
                id: p.id,
                number: p.chekRaqam || String(p.id).padStart(5, '0'),
                patient: p.Patient?.ism || 'Noma\'lum',
                services: p.xizmatlar ? (typeof p.xizmatlar === 'string' ? JSON.parse(p.xizmatlar) : p.xizmatlar).map(s => s.name || s) : ['Xizmat'],
                amount: p.summa || 0,
                method: methodLabels[p.usul] || p.usul || 'Naqd',
                date: p.tolanganSana ? new Date(p.tolanganSana).toLocaleDateString() : '',
                time: p.tolanganSana ? new Date(p.tolanganSana).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                cashier: p.Kassir?.name || 'Kassir'
            }));
            setReceipts(formatted);
        } catch (error) {
            console.error(error);
            toast.error("Cheklarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
    };

    const filteredReceipts = receipts.filter(r =>
        r.patient.toLowerCase().includes(search.toLowerCase()) ||
        r.number.includes(search)
    );

    const handlePrint = (receipt) => {
        toast.success(`Chek #${receipt.number} chop etilmoqda...`);
        // In real app, this would trigger actual print
    };

    return (
        <MainLayout title="Cheklar">
            {/* Search */}
            <div className="card shadow-sm border-border mb-6">
                <div className="card-body p-4 flex gap-4 items-center flex-wrap">
                    <div className="relative flex-1 min-w-[300px]">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">🔍</span>
                        <input
                            type="text"
                            className="form-control pl-10"
                            placeholder="Bemor nomi yoki chek raqami orqali izlash..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ borderRadius: '12px' }}
                        />
                    </div>
                    <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl font-bold text-sm border border-primary/20">
                        {filteredReceipts.length} ta chek topildi
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Receipts List */}
                <div className="card lg:col-span-2 shadow-sm border-border h-[calc(100vh-220px)] flex flex-col">
                    <div className="card-header bg-slate-50/50 border-b border-border py-4 shrink-0">
                        <h3 className="card-title text-main">Cheklar ro'yxati</h3>
                    </div>
                    <div className="card-body p-0 overflow-auto flex-1">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-pulse text-primary font-bold">Yuklanmoqda...</div>
                            </div>
                        ) : filteredReceipts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted p-6">
                                <span className="text-4xl mb-4">📄</span>
                                <p>Cheklar topilmadi</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Chek #</th>
                                        <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Bemor</th>
                                        <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Xizmatlar</th>
                                        <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Summa</th>
                                        <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Usul</th>
                                        <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Sana</th>
                                        <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredReceipts.map(receipt => (
                                        <tr
                                            key={receipt.id}
                                            onClick={() => setSelectedReceipt(receipt)}
                                            className="transition-colors hover:bg-slate-50/80 cursor-pointer"
                                            style={{ background: selectedReceipt?.id === receipt.id ? 'var(--primary-glow)' : 'transparent' }}
                                        >
                                            <td className="p-4 font-bold text-main">#{receipt.number}</td>
                                            <td className="p-4 font-semibold text-main">{receipt.patient}</td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {receipt.services.map((s, i) => (
                                                        <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-medium border border-slate-200">
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4 font-black text-success whitespace-nowrap">{formatMoney(receipt.amount)}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                                    receipt.method === 'Naqd' ? 'bg-emerald-100 text-emerald-700' :
                                                    receipt.method === 'Terminal' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-purple-100 text-purple-700'
                                                }`}>
                                                    {receipt.method}
                                                </span>
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold">{receipt.date}</div>
                                                <div className="text-xs text-muted">{receipt.time}</div>
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-primary hover:text-white transition-colors flex items-center justify-center text-muted"
                                                    onClick={(e) => { e.stopPropagation(); handlePrint(receipt); }}
                                                    title="Chop etish"
                                                >
                                                    🖨️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Receipt Preview */}
                <div>
                    {selectedReceipt ? (
                        <div className="card shadow-lg border-primary" style={{ position: 'sticky', top: 100 }}>
                            <div className="card-header bg-primary text-white border-0 py-4 flex justify-between items-center">
                                <h3 className="card-title text-white m-0 flex items-center gap-2">
                                    <span className="text-xl">📄</span> Chek tafsilotlari
                                </h3>
                                <button 
                                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors border border-white/10" 
                                    onClick={() => handlePrint(selectedReceipt)}
                                >
                                    🖨️ Chop etish
                                </button>
                            </div>
                            <div className="card-body p-6 bg-slate-50">
                                <div className="bg-white p-6 rounded-xl border border-dashed border-slate-300 shadow-sm relative">
                                    {/* Receipt Cutouts */}
                                    <div className="absolute top-0 left-0 w-full flex justify-between -mt-2 px-4 opacity-50">
                                        {[...Array(12)].map((_, i) => (
                                            <div key={i} className="w-3 h-3 bg-slate-50 rounded-full shadow-inner"></div>
                                        ))}
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full flex justify-between -mb-2 px-4 opacity-50">
                                        {[...Array(12)].map((_, i) => (
                                            <div key={i} className="w-3 h-3 bg-slate-50 rounded-full shadow-inner"></div>
                                        ))}
                                    </div>

                                    <div className="text-center mb-6">
                                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-2xl mx-auto mb-3">🏥</div>
                                        <div className="font-black text-xl text-main tracking-tight">RANOMED</div>
                                        <div className="text-xs font-bold text-muted uppercase tracking-widest mt-1">Klinika kvitansiyasi</div>
                                    </div>

                                    <div className="space-y-4 mb-6 text-sm">
                                        <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-200">
                                            <span className="text-muted font-medium">Chek raqami:</span>
                                            <span className="font-bold">#{selectedReceipt.number}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-200">
                                            <span className="text-muted font-medium">Sana:</span>
                                            <span className="font-semibold">{selectedReceipt.date} {selectedReceipt.time}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-200">
                                            <span className="text-muted font-medium">Bemor:</span>
                                            <span className="font-bold text-main">{selectedReceipt.patient}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-200">
                                            <span className="text-muted font-medium">Kassir:</span>
                                            <span className="font-medium">{selectedReceipt.cashier}</span>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <div className="text-xs font-bold text-muted uppercase mb-3">Ko'rsatilgan xizmatlar:</div>
                                        <ul className="space-y-2">
                                            {selectedReceipt.services.map((service, i) => (
                                                <li key={i} className="flex gap-2 text-sm">
                                                    <span className="text-primary">•</span>
                                                    <span className="font-medium text-main">{service}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-muted font-medium">To'lov usuli:</span>
                                            <span className="font-bold text-sm">{selectedReceipt.method}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                            <span className="font-black text-main">JAMI YIG'INDI:</span>
                                            <span className="text-xl font-black text-primary">{formatMoney(selectedReceipt.amount)}</span>
                                        </div>
                                    </div>

                                    <div className="text-center text-xs text-muted font-medium">
                                        <p className="mb-1">Tashrifingiz uchun minnatdormiz!</p>
                                        <p>Sog'lig'ingiz - bizning boyligimiz.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card shadow-sm border-border h-full min-h-[400px]">
                            <div className="card-body flex flex-col items-center justify-center text-center p-8">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-5xl mb-4 border border-slate-100 shadow-sm text-slate-300">
                                    📄
                                </div>
                                <h4 className="font-bold text-main mb-2">Chek tanlanmagan</h4>
                                <p className="text-sm text-muted">Chek tafsilotlarini ko'rish uchun chap tomondan ro'yxatdan birini tanlang</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
