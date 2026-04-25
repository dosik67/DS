import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStore, DayRecord } from '../store';
import { format, addDays, differenceInCalendarDays } from 'date-fns';
import { Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { cn } from '../utils';
import { useNavigate } from 'react-router-dom';
import { getEntOptions, isEntDate } from '../ent';

export const HistoryView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, days, tasks, setActiveDate, deleteDay, moveDay } = useStore();
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  const [editDate, setEditDate] = React.useState<string>('');

  if (!currentUser) return null;

  const entOptions = getEntOptions();
  const entDates = entOptions.map((o) => o.value);
  const entMax = entDates.reduce((a, b) => (a > b ? a : b), entDates[0]);
  const today = format(new Date(), 'yyyy-MM-dd');
  const daysToShow = Math.max(1, differenceInCalendarDays(new Date(entMax), new Date(today)) + 1);
  const calendarDays = Array.from({ length: daysToShow }).map((_, i) => {
    const d = addDays(new Date(today), i);
    return format(d, 'yyyy-MM-dd');
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f8fafc] dark:bg-[#0f172a]">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CalendarIcon /> {t('sidebar.history')}
          </h1>
          <p className="text-slate-500 mt-2">
            {t('ent.historySubtitle', { defaultValue: 'ENT calendar. Click a day to manage it.' })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entOptions.map((opt, idx) => {
            const left = differenceInCalendarDays(new Date(opt.value), new Date(today));
            const isPast = left < 0;
            return (
              <div
                key={opt.value}
                className={cn(
                  "p-5 rounded-3xl border shadow-sm bg-white dark:bg-[#1e293b] dark:border-slate-700",
                  idx === 0 ? "border-indigo-200 dark:border-indigo-900/40" : "border-amber-200 dark:border-amber-900/40"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-black uppercase tracking-widest text-slate-400">
                    {t('ent.entDateLabel', { defaultValue: 'ENT date' })}
                  </div>
                  <div className={cn("px-3 py-1 rounded-full text-xs font-black", idx === 0 ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300" : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300")}>
                    {opt.label}
                  </div>
                </div>
                <div className="mt-3 text-4xl font-black text-slate-900 dark:text-white tabular-nums">
                  {isPast ? t('ent.passed', { defaultValue: 'passed' }) : left}
                </div>
                <div className="text-slate-500 font-bold">
                  {t('ent.daysLeft', { defaultValue: 'days left' })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {calendarDays.map(dateStr => {
            const dayRecord = days.find(d => d.date === dateStr && d.userId === currentUser.id);
            const dayTasks = tasks.filter(t => t.date === dateStr && t.userId === currentUser.id);
            
            let colorCls = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200";
            
            if (dayRecord && dayRecord.isCompleted) {
              const pct = dayTasks.length ? Math.round((dayTasks.filter(t => t.completed).length / dayTasks.length) * 100) : 0;
              if (pct < 40) colorCls = "bg-red-100 dark:bg-red-900/30 text-red-600 border-red-200 dark:border-red-900";
              else if (pct < 60) colorCls = "bg-amber-100 dark:bg-amber-900/30 text-amber-600 border-amber-200 dark:border-amber-900";
              else if (pct < 80) colorCls = "bg-blue-100 dark:bg-blue-900/30 text-blue-600 border-blue-200 dark:border-blue-900";
              else if (pct < 100) colorCls = "bg-green-100 dark:bg-green-900/30 text-green-600 border-green-200 dark:border-green-900";
              else colorCls = "bg-pink-100 dark:bg-pink-900/30 text-pink-600 border-pink-200 dark:border-pink-900 shadow-sm";
            } else if (dayRecord && !dayRecord.isCompleted) {
              colorCls = "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 animate-pulse";
            }

            const entMark = isEntDate(dateStr);
            const ring = entMark
              ? "ring-2 ring-fuchsia-400/70 dark:ring-fuchsia-500/50"
              : "";

            return (
              <div
                key={dateStr}
                onClick={() => {
                  setSelectedDate(dateStr);
                  setEditDate(dateStr);
                }}
                className={cn("p-4 rounded-2xl border flex flex-col justify-center items-center gap-2 aspect-square transition-all hover:scale-105 cursor-pointer", colorCls, ring)}
              >
                <span className="text-sm font-bold opacity-80">{format(new Date(dateStr), 'MMM d')}</span>
                {dayRecord ? (
                  <>
                    <span className="text-2xl font-black">{dayRecord.actualHours || dayRecord.plannedHours}h</span>
                    {dayRecord.isCompleted ? (
                      <span className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Done
                      </span>
                    ) : (
                      <span className="text-xs opacity-80">In Progress</span>
                    )}
                  </>
                ) : (
                  <span className="text-xs opacity-50 block mt-2">No record</span>
                )}
                {entMark && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-fuchsia-500 dark:text-fuchsia-300">
                    {t('ent.entMark', { defaultValue: 'ENT' })}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {selectedDate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md bg-white dark:bg-[#1e293b] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {t('history.manageDay', { defaultValue: 'Manage day' })}
                  </h3>
                  <p className="text-slate-500 mt-1 font-medium">
                    {selectedDate}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-2xl leading-none"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="mt-5 space-y-3">
                <button
                  onClick={() => {
                    setActiveDate(selectedDate);
                    navigate('/');
                    setSelectedDate(null);
                  }}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black"
                >
                  {t('history.openDay', { defaultValue: 'Open this day' })}
                </button>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-3">
                  <label className="block text-sm font-bold text-slate-600 dark:text-slate-300">
                    {t('history.changeDate', { defaultValue: 'Change date' })}
                  </label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={async () => {
                      const ok = window.confirm(t('history.changeDateConfirm', { from: selectedDate, to: editDate, defaultValue: 'Move {{from}} to {{to}}?' }));
                      if (!ok) return;
                      await moveDay(selectedDate, editDate);
                      setSelectedDate(null);
                    }}
                    className="w-full py-3 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black hover:opacity-90"
                  >
                    {t('history.saveChanges', { defaultValue: 'Save changes' })}
                  </button>
                </div>

                <button
                  onClick={async () => {
                    const ok = window.confirm(t('history.deleteConfirm', { date: selectedDate, defaultValue: 'Delete {{date}} and all its tasks?' }));
                    if (!ok) return;
                    await deleteDay(selectedDate);
                    setSelectedDate(null);
                  }}
                  className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black"
                >
                  {t('history.deleteDay', { defaultValue: 'Delete day' })}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};