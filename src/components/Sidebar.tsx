import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../ThemeContext';
import { useStore } from '../store';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, LogOut, Sun, Moon, Globe, TrendingUp } from 'lucide-react';
import { cn } from '../utils';

export const Sidebar = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const currentUser = useStore(state => state.currentUser);
  const logout = useStore(state => state.logout);
  const location = useLocation();

  const changeLanguage = () => {
    const langs = ['en', 'ru', 'kk'];
    const nextLang = langs[(langs.indexOf(i18n.language) + 1) % langs.length];
    i18n.changeLanguage(nextLang);
  };

  const navItems = currentUser?.role === 'admin' 
    ? [{ path: '/admin', icon: Users, label: t('sidebar.admin') }]
    : [
        { path: '/', icon: LayoutDashboard, label: t('sidebar.dashboard') },
        { path: '/progress', icon: TrendingUp, label: t('sidebar.progress') },
        { path: '/history', icon: CalendarDays, label: t('sidebar.history') }
      ];

  if (!currentUser) return null;

  return (
    <div className="flex flex-col w-64 h-screen border-r border-[#e2e8f0] dark:border-[#334155] bg-white dark:bg-[#1e293b] p-4 transition-colors">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold">
          D
        </div>
        <h1 className="text-xl font-bold">Discipline</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                isActive 
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
              )}
            >
              <Icon size={20} className={cn(isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-[#e2e8f0] dark:border-[#334155] space-y-2">
        <button
          onClick={changeLanguage}
          className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <Globe size={18} />
            {t('common.language')}
          </div>
          <span className="uppercase text-xs font-bold text-gray-400">{i18n.language}</span>
        </button>

        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {t('common.theme')}
        </button>

        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-4"
        >
          <LogOut size={18} />
          {t('sidebar.logout')}
        </button>
      </div>
    </div>
  );
};
