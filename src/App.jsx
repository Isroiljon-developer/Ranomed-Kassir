import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PendingPayments from './pages/PendingPayments.jsx';
import PatientBilling from './pages/PatientBilling.jsx';
import WardBilling from './pages/WardBilling.jsx';
import BotPayments from './pages/BotPayments.jsx';
import Receipts from './pages/Receipts.jsx';
import Reports from './pages/Reports.jsx';
import Profile from './pages/Profile.jsx';
import BezOchirit from './pages/BezOchirit.jsx';

// Boshqa paneldan redirect bo'lib kelsa URL'dagi tokenni o'qib saqlash
(function readTokenFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('_token');
    const user = params.get('_user');
    if (token) {
        localStorage.setItem('token', token);
        if (user) localStorage.setItem('user', user);
        // URL'ni tozalash
        window.history.replaceState({}, '', window.location.pathname);
    }
})();

function PrivateRoute({ children }) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'http://localhost:5173/login';
        return null;
    }
    return children;
}

function App() {
    return (
        <BrowserRouter>
            <Toaster position="top-right" richColors />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/pending" element={<PrivateRoute><PendingPayments /></PrivateRoute>} />
                <Route path="/billing" element={<PrivateRoute><PatientBilling /></PrivateRoute>} />
                <Route path="/wards" element={<PrivateRoute><WardBilling /></PrivateRoute>} />
                <Route path="/bot" element={<PrivateRoute><BotPayments /></PrivateRoute>} />
                <Route path="/receipts" element={<PrivateRoute><Receipts /></PrivateRoute>} />
                <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/bez-ochirit" element={<PrivateRoute><BezOchirit /></PrivateRoute>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
