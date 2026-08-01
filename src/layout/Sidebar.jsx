import { NavLink, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const menuItems = [
        { path: '/', icon: 'рџ“Љ', label: 'Dashboard', section: 'ASOSIY' },
        { path: '/pending', icon: 'вЏі', label: "To'lanmaganlar", section: null },
        { path: '/billing', icon: 'рџ§ѕ', label: 'Bemor Hisobi', section: null },
        { path: '/wards', icon: 'рџ›ЏпёЏ', label: 'Palata Hisobi', section: 'MOLIYA' },
        { path: '/receipts', icon: 'рџ“„', label: 'Cheklar', section: null },
        { path: '/reports', icon: 'рџ“€', label: 'Hisobotlar', section: null },
        { path: '/bez-ochirit', icon: 'рџЋ«', label: 'Bez Ochirit', section: 'QO\'SHIMCHA' },
        { path: '/profile', icon: 'рџ‘¤', label: 'Profil', section: 'SHAXSIY' },
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
                    <div className="sidebar-logo-icon">рџ’°</div>
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
                        рџљЄ
                    </button>
                </div>
            </div>
        </aside>
    );
}

