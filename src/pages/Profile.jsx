import { useState, useEffect } from 'react';
import MainLayout from '../layout/MainLayout.jsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../api';
import { User, Phone, Mail, Building, Clock, Calendar, Save, LogOut, Camera } from 'lucide-react';

export default function Profile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState({
        name: '',
        username: '',
        phone: '',
        role: '',
        photo: '',
        Branch: { name: '' }
    });

    const [editData, setEditData] = useState({
        name: '',
        phone: '',
        password: '',
        photo: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await api.get('/auth/me');
            setUser(data);
            setEditData({
                name: data.name,
                phone: data.phone || '',
                password: '',
                photo: data.photo || ''
            });
        } catch (error) {
            toast.error('Profil ma\'lumotlarini yuklashda xatolik');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await api.put('/auth/profile', editData);
            toast.success('Profil muvaffaqiyatli yangilandi');
            fetchProfile();
        } catch (error) {
            toast.error(error.message || 'Yangilashda xatolik');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Tizimdan chiqdingiz');
        window.location.href = '/login';
    };

    if (loading) return <MainLayout title="Profil"><div className="p-4">Yuklanmoqda...</div></MainLayout>;

    return (
        <MainLayout title="Profil">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <div className="card text-center p-6 bg-white rounded-xl shadow-sm">
                        <div className="relative inline-block mx-auto mb-4">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-emerald-100 flex items-center justify-center border-4 border-emerald-50">
                                {user.photo ? (
                                    <img src={`http://localhost:9000/uploads/${user.photo}`} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-bold text-emerald-600">{user.name[0]}</span>
                                )}
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
                        <p className="text-emerald-600 font-medium uppercase text-sm tracking-wider">{user.role}</p>
                        <div className="mt-6 space-y-3">
                            <div className="flex items-center text-slate-600 text-sm">
                                <Building className="w-4 h-4 mr-3 text-slate-400" />
                                {user.Branch?.name || 'Filial tanlanmagan'}
                            </div>
                            <div className="flex items-center text-slate-600 text-sm">
                                <Calendar className="w-4 h-4 mr-3 text-slate-400" />
                                {new Date(user.createdAt).toLocaleDateString('uz-UZ')} da qo'shilgan
                            </div>
                        </div>
                        <button className="btn btn-danger w-full mt-8 flex items-center justify-center gap-2" onClick={handleLogout}>
                            <LogOut className="w-4 h-4" /> Chiqish
                        </button>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <div className="card bg-white rounded-xl shadow-sm">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">Ma'lumotlarni tahrirlash</h3>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">F.I.SH</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={editData.name} 
                                        onChange={e => setEditData({...editData, name: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Telefon</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={editData.phone} 
                                        onChange={e => setEditData({...editData, phone: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Yangi parol (ixtiyoriy)</label>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        placeholder="O'zgartirmaslik uchun bo'sh qoldiring"
                                        value={editData.password} 
                                        onChange={e => setEditData({...editData, password: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Login</label>
                                    <input type="text" className="form-control bg-slate-50" value={user.username} disabled />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button type="submit" className="btn btn-primary flex items-center gap-2" disabled={saving}>
                                    {saving ? 'Saqlanmoqda...' : <><Save className="w-4 h-4" /> Saqlash</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}


