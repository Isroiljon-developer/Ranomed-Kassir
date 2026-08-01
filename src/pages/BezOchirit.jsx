import { useState, useEffect, useRef } from 'react';
import MainLayout from '../layout/MainLayout.jsx';
import { toast } from 'sonner';
import api from '../api';

// ========== BEZ OCHIRIT LOCAL STORAGE KEY ==========
const BEZ_KEY = 'bez_ochirit_data';

function loadBezData() {
  try {
    const raw = localStorage.getItem(BEZ_KEY);
    return raw ? JSON.parse(raw) : { uses: [], count: 0 };
  } catch { return { uses: [], count: 0 }; }
}

function saveBezData(data) {
  localStorage.setItem(BEZ_KEY, JSON.stringify(data));
}

export default function BezOchirit() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [bezData, setBezData] = useState(loadBezData());
  const [showTicket, setShowTicket] = useState(false);
  const [lastTicket, setLastTicket] = useState(null);
  const [showList, setShowList] = useState(false);
  const [printMode, setPrintMode] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    api.get('/reception/patients').then(data => setPatients(data || [])).catch(console.error);
  }, []);

  const filteredPatients = patients.filter(p =>
    (p.ism || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.telefon || '').includes(search)
  ).slice(0, 20);

  // Today uses only
  const today = new Date().toISOString().split('T')[0];
  const todayUses = bezData.uses.filter(u => u.date.startsWith(today));
  const totalUses = todayUses.length;

  const formatTime = () => {
    return new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleGiveBezOchirit = () => {
    if (!selectedPatient) {
      toast.error('Avval bemorni tanlang');
      return;
    }

    const newUse = {
      id: Date.now(),
      patientId: selectedPatient.id,
      patientName: selectedPatient.ism,
      patientPhone: selectedPatient.telefon,
      date: new Date().toISOString(),
      useNumber: totalUses + 1
    };

    const newBezData = {
      uses: [...bezData.uses, newUse],
      count: bezData.count + 1
    };

    saveBezData(newBezData);
    setBezData(newBezData);

    const ticket = {
      ...newUse,
      todayCount: totalUses + 1,
      canEnter: (totalUses + 1) % 2 === 0 // Every 2nd use = can enter
    };

    setLastTicket(ticket);
    setShowTicket(true);
    setSelectedPatient(null);
    setSearch('');

    toast.success(
      ticket.canEnter
        ? `${selectedPatient.ism} uchun "Kirasiz" cheki tayyor!`
        : `${selectedPatient.ism} uchun bez ochirit qayd etildi (${ticket.todayCount}-chi marta)`
    );
  };

  const handlePrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 300);
  };

  return (
    <MainLayout title="Bez Ochirit">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body * { visibility: hidden; }
          .print-ticket, .print-ticket * { visibility: visible; }
          .print-ticket { position: fixed; left: 0; top: 0; width: 80mm; }
        }
        .print-only { display: none; }
      `}</style>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Issue ticket */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-border p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-2xl">🎫</div>
              <div>
                <div className="text-2xl font-black text-main">{totalUses}</div>
                <div className="text-xs font-semibold text-muted uppercase tracking-wider">Bugun berildi</div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl">✅</div>
              <div>
                <div className="text-2xl font-black text-success">{Math.floor(totalUses / 2)}</div>
                <div className="text-xs font-semibold text-muted uppercase tracking-wider">Kirishga ruxsat</div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">👥</div>
              <div>
                <div className="text-2xl font-black text-primary">{bezData.count}</div>
                <div className="text-xs font-semibold text-muted uppercase tracking-wider">Jami (umumiy)</div>
              </div>
            </div>
          </div>

          {/* Patient Selection */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Bemorni Tanlang</h3>
              <span className="badge badge-purple">Bez Navbat Qo'llash</span>
            </div>
            <div className="card-body">
              <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-lg">🔍</span>
                <input
                  type="text"
                  className="form-control pl-12"
                  placeholder="Ism yoki telefon raqam..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setShowList(true); }}
                  onFocus={() => setShowList(true)}
                />
              </div>

              {/* Patient List */}
              {showList && search && (
                <div className="border border-border rounded-xl overflow-hidden mb-4 max-h-64 overflow-y-auto">
                  {filteredPatients.length === 0 ? (
                    <div className="p-4 text-center text-muted text-sm">Bemor topilmadi</div>
                  ) : (
                    filteredPatients.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { setSelectedPatient(p); setSearch(p.ism); setShowList(false); }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-border last:border-0 flex items-center gap-3"
                      >
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                          {(p.ism || '?').charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{p.ism}</div>
                          <div className="text-xs text-muted">{p.telefon}</div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Selected Patient */}
              {selectedPatient && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                      {selectedPatient.ism.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-main">{selectedPatient.ism}</div>
                      <div className="text-xs text-muted">{selectedPatient.telefon}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelectedPatient(null); setSearch(''); }}
                    className="w-7 h-7 rounded-full bg-danger/10 text-danger flex items-center justify-center text-sm hover:bg-danger hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div className="text-sm text-amber-800">
                    <p className="font-bold mb-1">Qanday ishlaydi?</p>
                    <p>Har bir bemor uchun "Bez Ochirit" bosganingizda navbat qayd etiladi. <strong>Har 2 marta</strong> qayd etilgandan keyin bemor <strong>"Kirasiz"</strong> chekini oladi va navbatsiz kirishi mumkin.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleGiveBezOchirit}
                disabled={!selectedPatient}
                className="btn btn-primary w-full py-4 text-base font-bold justify-center"
                style={{ borderRadius: '14px', fontSize: '16px' }}
              >
                🎫 Bez Ochirit Berish
              </button>
            </div>
          </div>

          {/* Today's History */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Bugungi Qaydlar</h3>
              <span className="text-xs font-semibold text-muted bg-slate-100 px-3 py-1 rounded-full">{todayUses.length} ta</span>
            </div>
            <div className="card-body p-0">
              {todayUses.length === 0 ? (
                <div className="py-12 text-center text-muted">
                  <div className="text-4xl mb-3 opacity-30">📋</div>
                  <p className="text-sm">Bugun hali bez ochirit berilmagan</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {[...todayUses].reverse().map((use, idx) => {
                    const isCanEnter = use.useNumber % 2 === 0;
                    return (
                      <div key={use.id} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black ${
                          isCanEnter ? 'bg-success text-white' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {use.useNumber}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{use.patientName}</div>
                          <div className="text-xs text-muted">
                            {new Date(use.date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                            {' · '}{use.patientPhone}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          isCanEnter
                            ? 'bg-success text-white'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {isCanEnter ? '✓ Kirasiz' : '📝 Qayd'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Ticket Preview */}
        <div>
          {showTicket && lastTicket ? (
            <div style={{ position: 'sticky', top: 100 }}>
              <div className="card overflow-hidden mb-4">
                <div className="bg-slate-800 px-5 py-4 flex items-center justify-between">
                  <h3 className="font-bold text-white">Chek Ko'rinishi</h3>
                  <button
                    onClick={() => setShowTicket(false)}
                    className="w-7 h-7 rounded-full bg-white/10 text-white/70 hover:bg-white/20 flex items-center justify-center text-sm"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-5 bg-slate-50">
                  {/* The Ticket */}
                  <div className="print-ticket bg-white rounded-2xl overflow-hidden shadow-lg border border-border">
                    {/* Ticket Header */}
                    <div className={`p-6 text-center text-white ${lastTicket.canEnter
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                      : 'bg-gradient-to-br from-purple-600 to-indigo-700'
                    }`}>
                      <div className="text-sm font-bold uppercase tracking-widest opacity-80 mb-1">RANOMED KLINIKA</div>
                      <div className="text-5xl font-black my-3">
                        {lastTicket.canEnter ? '✓' : '🎫'}
                      </div>
                      <div className="text-2xl font-black tracking-tight">
                        {lastTicket.canEnter ? 'KIRASIZ!' : 'BEZ OCHIRIT'}
                      </div>
                      <div className="text-sm opacity-70 mt-1">
                        {lastTicket.canEnter
                          ? 'Navbatsiz kirish huquqi'
                          : `${lastTicket.todayCount}-chi qayd`
                        }
                      </div>
                    </div>

                    {/* Ticket Body */}
                    <div className="p-5">
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between pb-2 border-b border-dashed border-border">
                          <span className="text-muted font-medium">Bemor:</span>
                          <span className="font-bold">{lastTicket.patientName}</span>
                        </div>
                        <div className="flex justify-between pb-2 border-b border-dashed border-border">
                          <span className="text-muted font-medium">Telefon:</span>
                          <span className="font-semibold">{lastTicket.patientPhone}</span>
                        </div>
                        <div className="flex justify-between pb-2 border-b border-dashed border-border">
                          <span className="text-muted font-medium">Sana:</span>
                          <span className="font-semibold">{formatDate()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted font-medium">Vaqt:</span>
                          <span className="font-semibold">{formatTime()}</span>
                        </div>
                      </div>

                      {lastTicket.canEnter && (
                        <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                          <p className="text-emerald-800 font-bold text-sm">
                            ✅ Bu bemor navbatsiz kirishi mumkin!
                          </p>
                        </div>
                      )}

                      {!lastTicket.canEnter && (
                        <div className="mt-4 bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
                          <p className="text-purple-800 font-bold text-sm">
                            ℹ️ Keyingi marta "Kirasiz" cheki beriladi
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Ticket Footer */}
                    <div className="px-5 pb-5">
                      <div className="flex gap-2">
                        {[...Array(15)].map((_, i) => (
                          <div key={i} className="flex-1 h-1 rounded-full bg-border"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePrint}
                className="btn btn-primary w-full py-3 text-base font-bold justify-center"
                style={{ borderRadius: '14px' }}
              >
                🖨️ Chop Etish
              </button>
            </div>
          ) : (
            <div className="card">
              <div className="card-body py-16 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center text-4xl mb-4 border border-purple-100">
                  🎫
                </div>
                <h4 className="font-bold text-main mb-2">Chek Tayyor Emas</h4>
                <p className="text-sm text-muted">Bemorni tanlang va "Bez Ochirit Berish" tugmasini bosing</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
