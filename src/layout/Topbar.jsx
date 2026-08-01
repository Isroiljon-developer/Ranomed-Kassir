import { useState, useEffect } from 'react';

export default function Topbar({ title }) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <header className="topbar">
            <div className="topbar-left">
                <h1 className="topbar-title">{title}</h1>
            </div>
            <div className="topbar-right">
                <div className="topbar-time">
                    🕐 {time.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    &nbsp;&nbsp;|&nbsp;&nbsp;
                    {time.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
                <div className="topbar-user">
                    <div className="topbar-avatar">
                        {(user.name || 'K')[0].toUpperCase()}
                    </div>
                    <span className="topbar-name">{user.name || 'Kassir'}</span>
                </div>
            </div>
        </header>
    );
}
