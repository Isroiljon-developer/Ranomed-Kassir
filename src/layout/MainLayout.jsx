import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function MainLayout({ children, title }) {
    return (
        <div className="layout">
            <Sidebar />
            <main className="main-content">
                <Topbar title={title} />
                <div className="page-content">
                    {children}
                </div>
            </main>
        </div>
    );
}
