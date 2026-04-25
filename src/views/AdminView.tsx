import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { AlertTriangle, User as UserIcon, Shield, TestTube2, Send } from 'lucide-react';
import { cn } from '../utils';

export const AdminView = () => {
  const { t } = useTranslation();
  const { users, days, notifications, sendWarning, sendAdminMessage, impersonateUser } = useStore();
  const [isTestUnlocked, setIsTestUnlocked] = React.useState(false);
  const [pw, setPw] = React.useState('');
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState('');

  const clients = users.filter(u => u.role === 'client');

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#f8fafc] dark:bg-[#0f172a]">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {t('admin.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Overview of all users tracking their 30h/week goal.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] rounded-2xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                <Shield size={18} />
              </div>
              <div>
                <div className="font-black text-slate-900 dark:text-white">
                  {t('admin.testModeTitle', { defaultValue: 'Admin test mode' })}
                </div>
                <div className="text-sm text-slate-500">
                  {t('admin.testModeSubtitle', { defaultValue: 'Enter password to open client playground' })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder={t('admin.passwordPlaceholder', { defaultValue: 'Password' })}
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => {
                  if (pw === '676767ZHANDOS') setIsTestUnlocked(true);
                  else alert(t('admin.badPassword', { defaultValue: 'Wrong password' }));
                }}
                className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black"
              >
                {t('admin.unlock', { defaultValue: 'Unlock' })}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e2e8f0] dark:border-[#334155] bg-gray-50 dark:bg-slate-800/50">
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Client</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Logged Hours</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Target</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => {
                const clientLogs = days.filter(d => d.userId === client.id && d.isCompleted);
                const totalHours = clientLogs.reduce((acc, log) => acc + (log.actualHours || log.plannedHours), 0);
                
                const isFailing = totalHours < 15;

                const hasWarning = notifications.some(n => n.userId === client.id);

                return (
                  <tr key={client.id} className="border-b border-[#e2e8f0] dark:border-[#334155] hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-full">
                          <UserIcon size={16} />
                        </div>
                        <button
                          onClick={() => setSelectedUserId(client.id)}
                          className="font-medium hover:underline text-left"
                        >
                          {client.name}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-bold", 
                          isFailing ? "text-red-500" : "text-green-500"
                        )}>
                          {totalHours}h
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      30h
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => sendWarning(client.id)}
                          disabled={hasWarning}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                            hasWarning 
                              ? "bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-gray-500 cursor-not-allowed"
                              : "bg-orange-100 text-orange-600 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50"
                          )}
                        >
                          <AlertTriangle size={16} />
                          {hasWarning ? t('admin.warningSent') : t('admin.sendWarning')}
                        </button>

                        <button
                          onClick={() => setSelectedUserId(client.id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                          <Send size={16} />
                          {t('admin.message', { defaultValue: 'Message' })}
                        </button>

                        <button
                          onClick={() => {
                            if (!isTestUnlocked) return alert(t('admin.lockedTestMode', { defaultValue: 'Unlock test mode first' }));
                            impersonateUser(client.id);
                          }}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-black transition-colors",
                            isTestUnlocked
                              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                              : "bg-indigo-100 text-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-600 cursor-not-allowed"
                          )}
                        >
                          <TestTube2 size={16} />
                          {t('admin.openPlayground', { defaultValue: 'Open playground' })}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {clients.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No clients available.
            </div>
          )}
        </div>

        {selectedUserId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg bg-white dark:bg-[#1e293b] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {t('admin.sendMessageTitle', { defaultValue: 'Send message' })}
                  </h3>
                  <p className="text-slate-500 mt-1 font-medium">
                    {clients.find((c) => c.id === selectedUserId)?.name}
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedUserId(null); setMessage(''); }}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-2xl leading-none"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="mt-5 space-y-3">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder={t('admin.messagePlaceholder', { defaultValue: 'Type a message to the client...' })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={async () => {
                    await sendAdminMessage(selectedUserId, message);
                    setSelectedUserId(null);
                    setMessage('');
                  }}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black"
                >
                  {t('admin.send', { defaultValue: 'Send' })}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
