import { NavLink, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Hourglass, 
    UserPlus, 
    BedDouble, 
    ReceiptText, 
    FileBarChart, 
    Ticket, 
    User,
    LogOut,
    Wallet
} from 'lucide-react';

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const menuItems = [
        { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard', section: 'ASOSIY' },
        { path: '/pending', icon: <Hourglass size={20} />, label: "To'lanmaganlar", section: null },
        { path: '/billing', icon: <UserPlus size={20} />, label: 'Bemor Hisobi', section: null },
        { path: '/wards', icon: <BedDouble size={20} />, label: 'Palata Hisobi', section: 'MOLIYA' },
        { path: '/receipts', icon: <ReceiptText size={20} />, label: 'Cheklar', section: null },
        { path: '/reports', icon: <FileBarChart size={20} />, label: 'Hisobotlar', section: null },
        { path: '/bez-ochirit', icon: <Ticket size={20} />, label: 'Bez Ochirit', section: 'QO\'SHIMCHA' },
        { path: '/profile', icon: <User size={20} />, label: 'Profil', section: 'SHAXSIY' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon"><Wallet size={24} /></div>
                    <div>
                        <div className="sidebar-title">Ranomed -2 </div>
                        <div className="sidebar-subtitle">Kassir Panel</div>
                    </div>
                </div>
            </div>

            <nav>
                <ul className="sidebar-nav">
                    {menuItems.map((item) => (
                        <li key={item.path} className="sidebar-nav-item">
                            {item.section && (
                                <div className="sidebar-nav-section">{item.section}</div>
                            )}
                            <NavLink
                                to={item.path}
                                end={item.path === '/'}
                                className={({ isActive }) =>
                                    `sidebar-nav-link ${isActive ? 'active' : ''}`
                                }
                            >
                                <span className="sidebar-nav-icon">{item.icon}</span>
                                <span>{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-user-avatar">
                        {(user.name || 'K')[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="sidebar-user-name">{user.name || 'Kassir'}</div>
                        <div className="sidebar-user-role">Kassir</div>
                    </div>
                    <button className="sidebar-logout-btn" onClick={handleLogout} title="Chiqish">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </aside>
    );

