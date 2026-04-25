import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { HistoryView } from './views/HistoryView';
import { AdminView } from './views/AdminView';
import { ProgressView } from './views/ProgressView';
import { ThemeProvider } from './ThemeContext';
import { useStore } from './store';
import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './i18n';

const NotificationToast = () => {
  const { currentUser, notifications, markNotificationRead } = useStore();
  const { t } = useTranslation();
  
  if (!currentUser) return null;
  
  const unreadNotifications = notifications.filter(n => n.userId === currentUser.id && !n.read);

  if (unreadNotifications.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
      {unreadNotifications.map(notification => (
        <div key={notification.id} className="bg-red-500 text-white p-4 rounded-xl shadow-lg flex items-start gap-4 max-w-sm animate-in slide-in-from-right-8 fade-in">
          <Bell className="flex-shrink-0 mt-1" size={20} />
          <div className="flex-1">
            <h4 className="font-bold mb-1">{t('common.adminWarning')}</h4>
            <p className="text-sm text-red-50">{notification.message}</p>
          </div>
          <button 
            onClick={() => markNotificationRead(notification.id)}
            className="text-red-200 hover:text-white"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}

const AuthScreen = () => {
  const { login, register } = useStore();
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = React.useState(true);
  const [name, setName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState<'client'|'admin'>('client');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    let success = false;
    
    if (isLogin) {
      success = await login(name, password);
    } else {
      success = await register(name, password, role);
    }
    
    setIsLoading(false);
    if (!success) {
      setError(isLogin ? 'Invalid name or password' : 'Error during registration. Name might be taken.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f172a]">
      <div className="w-full max-w-md p-8 bg-white dark:bg-[#1e293b] rounded-2xl shadow-xl space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Discipline Tracker</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isLogin ? 'Login to your account' : 'Register a new account'}
          </p>
        </div>
        
        {error && <p className="text-red-500 text-sm text-center bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Name</label>
            <input 
              type="text" 
              required 
              value={name} 
              onChange={e => setName(e.target.value)} 
              disabled={isLoading}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              disabled={isLoading}
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
            />
          </div>
          
          {!isLogin && (
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Role</label>
              <select 
                value={role} 
                onChange={e => setRole(e.target.value as 'client'|'admin')} 
                disabled={isLoading}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] dark:text-white focus:border-blue-500 outline-none"
              >
                <option value="client">Client</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-semibold transition-colors mt-2 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>
        
        <p 
          className="text-center text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:underline mt-4" 
          onClick={() => { setIsLogin(!isLogin); setError(''); }}
        >
          {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
        </p>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { currentUser, adminOriginalUser, stopImpersonation, loadInitialData, loading } = useStore();
  const { t } = useTranslation();

  useEffect(() => {
    loadInitialData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f172a]">
        <div className="text-gray-500 dark:text-gray-400 text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-[#f8fafc] w-full text-slate-800 dark:text-slate-200">
        <Sidebar />
        <main className="flex-1 overflow-hidden flex flex-col relative w-full h-full">
          {adminOriginalUser && (
            <div className="sticky top-0 z-40 bg-amber-200/80 dark:bg-amber-900/40 border-b border-amber-300/70 dark:border-amber-800/50 backdrop-blur px-4 py-3 flex items-center justify-between gap-4">
              <div className="text-sm font-black text-amber-900 dark:text-amber-100">
                {t('admin.testModeBanner', { defaultValue: 'TEST MODE: You are logged in as a client' })}
              </div>
              <button
                onClick={() => stopImpersonation()}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-black hover:opacity-90"
              >
                {t('admin.exitTestMode', { defaultValue: 'Back to Admin' })}
              </button>
            </div>
          )}
          <Routes>
            <Route 
              path="/" 
              element={currentUser.role === 'client' ? <DashboardView /> : <Navigate to="/admin" />} 
            />
            <Route 
              path="/history" 
              element={currentUser.role === 'client' ? <HistoryView /> : <Navigate to="/" />} 
            />
            <Route 
              path="/progress" 
              element={currentUser.role === 'client' ? <ProgressView /> : <Navigate to="/" />} 
            />
            <Route 
              path="/admin" 
              element={currentUser.role === 'admin' ? <AdminView /> : <Navigate to="/" />} 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <NotificationToast />
        </main>
      </div>
    </BrowserRouter>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
