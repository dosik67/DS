import React, { useMemo } from 'react';
import { useStore } from '../store';
import { motion } from 'motion/react';
import { format, startOfWeek, endOfWeek, isWithinInterval, addDays, differenceInCalendarDays } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Trophy, Zap, Target, TrendingUp, CheckCircle, BarChart3 } from 'lucide-react';
import { cn } from '../utils';
import { getEntOptions } from '../ent';

export const ProgressView = () => {
  const { currentUser, days, tasks } = useStore();
  const { t } = useTranslation();

  const WEEKLY_GOAL = 30;

  const { thisWeekDays, totalHours, progressPct, weekStart, weekEnd } = useMemo(() => {
    const now = new Date();
    // Monday as start of week
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const thisWeekDays = days.filter(d => 
      d.userId === currentUser?.id &&
      isWithinInterval(new Date(d.date), { start: weekStart, end: weekEnd })
    );

    const hoursForDay = (date: string) => {
      const day = thisWeekDays.find((d) => d.date === date);
      const fromTasks = tasks
        .filter((t) => t.userId === currentUser?.id && t.date === date)
        .reduce((acc, t) => acc + (t.timerSeconds || 0), 0) / 3600;
      return Math.max(day?.actualHours ?? 0, fromTasks);
    };

    const totalHours = thisWeekDays.reduce((acc, curr) => acc + hoursForDay(curr.date), 0);
    const progressPct = Math.min((totalHours / WEEKLY_GOAL) * 100, 100);

    return { thisWeekDays, totalHours, progressPct, weekStart, weekEnd };
  }, [days, tasks, currentUser]);

  if (!currentUser) return null;

  // Chart data calculation
  const weekDaysShort = (t('progress.weekDaysShort', { returnObjects: true }) as unknown as string[]) ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const chartData = weekDaysShort.map((dayName, idx) => {
    const dateObj = addDays(weekStart, idx);
    const formattedDate = format(dateObj, 'yyyy-MM-dd');
    const dayRecord = thisWeekDays.find(d => d.date === formattedDate);
    const fromTasks = tasks
      .filter((t) => t.userId === currentUser?.id && t.date === formattedDate)
      .reduce((acc, t) => acc + (t.timerSeconds || 0), 0) / 3600;
    const mergedHours = Math.max(dayRecord?.actualHours ?? 0, fromTasks);
    return {
      name: dayName,
      date: formattedDate,
      hours: dayRecord ? mergedHours : fromTasks,
      isToday: formattedDate === format(new Date(), 'yyyy-MM-dd')
    };
  });

  const remainingHours = Math.max(0, WEEKLY_GOAL - totalHours);
  const isGoalReached = totalHours >= WEEKLY_GOAL;

  const entOptions = useMemo(() => getEntOptions(), []);
  const todayYmd = format(new Date(), 'yyyy-MM-dd');

  const { currentStreak, streakBadges } = useMemo(() => {
    const completed = days
      .filter((d) => d.userId === currentUser?.id && d.isCompleted)
      .map((d) => d.date)
      .sort((a, b) => a.localeCompare(b));

    const set = new Set(completed);
    const last = completed.at(-1);
    let streak = 0;
    if (last) {
      let cursor = new Date(last);
      while (true) {
        const key = format(cursor, 'yyyy-MM-dd');
        if (!set.has(key)) break;
        streak += 1;
        cursor = addDays(cursor, -1);
      }
    }

    const milestones = [1, 7, 30, 100];
    const badges = milestones.map((m) => ({
      days: m,
      unlocked: streak >= m,
    }));

    return { currentStreak: streak, streakBadges: badges };
  }, [days, currentUser]);

  const recentDays = useMemo(() => {
    return days
      .filter((d) => d.userId === currentUser?.id)
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 12);
  }, [days, currentUser]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-[#0f172a]">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header section with awesome spring animation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {t('sidebar.progress') || 'Progress Hub'}
            </h1>
            <p className="text-lg text-slate-500 font-medium tracking-wide mt-1">
              {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
            </p>
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 bg-white dark:bg-[#1e293b] px-6 py-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 font-black text-xl text-indigo-600 dark:text-indigo-400"
          >
            <Trophy className={isGoalReached ? "text-yellow-500 fill-yellow-500" : "text-slate-400"} />
            <span>{t('progress.goalLabel', { hours: WEEKLY_GOAL })}</span>
          </motion.div>
        </motion.div>

        {/* Big Progress Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Main Ring */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="col-span-1 lg:col-span-1 bg-white dark:bg-[#1e293b] p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center relative overflow-hidden"
          >
            {/* Background glowing effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
            
            <h3 className="font-bold text-slate-400 uppercase tracking-widest text-sm mb-6 z-10 w-full text-center">{t('progress.currentWeek')}</h3>
            
            {/* Circular Progress mimicking a neon ring */}
            <div className="relative w-48 h-48 flex items-center justify-center mb-6 z-10">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100 dark:text-slate-700" />
                <motion.circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  stroke="currentColor" 
                  strokeWidth="6" 
                  fill="transparent" 
                  strokeDasharray="283"
                  initial={{ strokeDashoffset: 283 }}
                  animate={{ strokeDashoffset: 283 - (283 * progressPct) / 100 }}
                  transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
                  className={cn("drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]", isGoalReached ? "text-green-500" : "text-indigo-500")}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: "spring" }}
                  className="text-4xl font-black text-slate-900 dark:text-white leading-none"
                >
                  {totalHours.toFixed(1)}
                </motion.span>
                <span className="text-sm font-bold text-slate-400 uppercase mt-1">{t('progress.hours')}</span>
              </div>
            </div>

            <div className="text-center z-10">
              {isGoalReached ? (
                <div className="text-green-500 font-bold flex items-center justify-center gap-2">
                  <CheckCircle size={20} /> {t('progress.goalCrushed')}
                </div>
              ) : (
                <div className="text-slate-500 font-medium">
                  {t('progress.leftToGoal', { hours: remainingHours.toFixed(1) })}
                </div>
              )}
            </div>
          </motion.div>

          {/* Bar Chart Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="col-span-1 lg:col-span-2 bg-white dark:bg-[#1e293b] p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-slate-400 uppercase tracking-widest text-sm flex items-center gap-2"><BarChart3 size={18} /> {t('progress.dailyBreakdown')}</h3>
            </div>
            
            <div className="flex items-end justify-between h-48 gap-2">
              {chartData.map((day, i) => {
                const maxChartHours = Math.max(10, Math.max(...chartData.map(d => d.hours)));
                const barHeight = Math.max(5, (day.hours / maxChartHours) * 100);
                
                return (
                  <div key={i} className="flex flex-col items-center flex-1 group">
                    <div className="text-xs font-bold text-slate-400 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {day.hours > 0 ? `${day.hours}h` : '-'}
                    </div>
                    <div className="w-full max-w-[40px] h-full bg-slate-100 dark:bg-slate-700 rounded-t-xl relative overflow-hidden flex items-end justify-center">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${barHeight}%` }}
                        transition={{ duration: 1, delay: 0.4 + (i * 0.1), type: "spring" }}
                        className={cn(
                          "w-full rounded-t-xl", 
                          day.isToday ? "bg-amber-500" : "bg-indigo-500"
                        )}
                      />
                    </div>
                    <div className={cn("mt-4 text-xs font-black uppercase", day.isToday ? "text-amber-500" : "text-slate-500")}>
                      {day.name}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* ENT countdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, type: "spring" }}
          className="bg-white dark:bg-[#1e293b] p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {t('ent.title', { defaultValue: 'ENT Countdown' })}
            </h3>
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
              {t('ent.today', { defaultValue: 'Today' })}: {format(new Date(), 'dd.MM')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {entOptions.map((opt, idx) => {
              const left = differenceInCalendarDays(new Date(opt.value), new Date(todayYmd));
              const clamped = Math.max(0, left);
              return (
                <motion.div
                  key={opt.value}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + idx * 0.08, type: "spring" }}
                  className={cn(
                    "p-6 rounded-3xl border shadow-sm relative overflow-hidden",
                    idx === 0
                      ? "bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-[#1e293b] border-indigo-200 dark:border-indigo-900/40"
                      : "bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-[#1e293b] border-amber-200 dark:border-amber-900/40"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-black uppercase tracking-widest text-slate-400">
                      {t('ent.entDateLabel', { defaultValue: 'ENT date' })}
                    </div>
                    <div className={cn("px-3 py-1 rounded-full text-xs font-black", idx === 0 ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200" : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200")}>
                      {opt.label}
                    </div>
                  </div>

                  <motion.div
                    key={left}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                    className="mt-4 text-5xl font-black text-slate-900 dark:text-white tabular-nums"
                  >
                    {left < 0 ? t('ent.passed', { defaultValue: 'passed' }) : clamped}
                  </motion.div>
                  <div className="text-slate-500 font-bold">
                    {t('ent.daysLeft', { defaultValue: 'days left' })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent days list (always shows saved days) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, type: "spring" }}
          className="bg-white dark:bg-[#1e293b] p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {t('progress.recentDays', { defaultValue: 'Recent days' })}
            </h3>
            <div className="text-xs font-black uppercase tracking-widest text-slate-400">
              {t('progress.totalDays', { count: days.filter((d) => d.userId === currentUser?.id).length, defaultValue: 'Total: {{count}}' })}
            </div>
          </div>

          {recentDays.length === 0 ? (
            <div className="text-slate-500 font-medium">
              {t('progress.noDays', { defaultValue: 'No days yet' })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentDays.map((d, idx) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + idx * 0.04, type: "spring" }}
                  className={cn(
                    "p-5 rounded-3xl border shadow-sm flex items-center justify-between gap-4",
                    d.isCompleted
                      ? "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700"
                      : "bg-indigo-50/60 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-900/40"
                  )}
                >
                  <div>
                    <div className="text-sm font-black text-slate-900 dark:text-white">
                      {format(new Date(d.date), 'dd.MM.yyyy')}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
                      {d.isCompleted
                        ? t('progress.dayDone', { defaultValue: 'Done' })
                        : t('progress.dayInProgress', { defaultValue: 'In progress' })}
                    </div>
                  </div>
                  <div className="text-right">
                    {(() => {
                      const fromTasks = tasks
                        .filter((t) => t.userId === currentUser?.id && t.date === d.date)
                        .reduce((acc, t) => acc + (t.timerSeconds || 0), 0) / 3600;
                      const merged = Math.max(d.actualHours ?? 0, fromTasks);
                      return (
                    <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                      {(merged || d.plannedHours).toFixed(1)}h
                    </div>
                      );
                    })()}
                    <div className="text-xs font-bold text-slate-400">
                      {t('progress.planned', { defaultValue: 'plan' })}: {d.plannedHours}h
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-3xl text-white shadow-lg shadow-indigo-500/20">
            <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4"><TrendingUp /></div>
            <h4 className="text-indigo-100 font-bold uppercase tracking-wider text-sm mb-1">{t('progress.consistency')}</h4>
            <p className="text-3xl font-black">{chartData.filter(d => d.hours > 0).length} <span className="text-lg font-medium opacity-80">{t('progress.daysLogged')}</span></p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="bg-amber-100 dark:bg-amber-900/30 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-amber-600 dark:text-amber-500"><Zap /></div>
            <h4 className="text-slate-500 font-bold uppercase tracking-wider text-sm mb-1">{t('progress.mostProductive')}</h4>
            <p className="text-3xl font-black text-slate-800 dark:text-white">
              {Math.max(...chartData.map(d => d.hours)) > 0 
                ? chartData.reduce((prev, current) => (prev.hours > current.hours) ? prev : current).name 
                : t('progress.notAvailable')
              }
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-500"><Target /></div>
            <h4 className="text-slate-500 font-bold uppercase tracking-wider text-sm mb-1">{t('progress.pace')}</h4>
            <p className="text-3xl font-black text-slate-800 dark:text-white">
              {totalHours > 0 ? (totalHours / (new Date().getDay() || 7)).toFixed(1) : 0}h <span className="text-lg font-medium text-slate-400">{t('progress.perDayAvg')}</span>
            </p>
          </motion.div>
        </div>

        {/* Achievements / Streaks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, type: "spring" }}
          className="bg-white dark:bg-[#1e293b] p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {t('progress.achievementsTitle', { defaultValue: 'Achievements' })}
              </h3>
              <p className="text-slate-500 font-medium">
                {t('progress.currentStreak', { days: currentStreak, defaultValue: 'Current streak: {{days}} days' })}
              </p>
            </div>
            <motion.div
              key={currentStreak}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-lg shadow-lg shadow-indigo-500/20"
            >
              {t('progress.streakBadge', { days: currentStreak, defaultValue: '{{days}} days in a row' })}
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {streakBadges.map((b, idx) => (
              <motion.div
                key={b.days}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.06, type: "spring" }}
                className={cn(
                  "p-5 rounded-2xl border shadow-sm relative overflow-hidden",
                  b.unlocked
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                    : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700"
                )}
              >
                {b.unlocked && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute -top-8 -right-8 w-24 h-24 bg-emerald-500/20 blur-2xl rounded-full pointer-events-none"
                  />
                )}
                <div className={cn("text-2xl font-black", b.unlocked ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500")}>
                  {b.days}
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
                  {t('progress.daysLabel', { defaultValue: 'days' })}
                </div>
                <div className="mt-3 text-sm font-bold">
                  {b.unlocked
                    ? t('progress.unlocked', { defaultValue: 'Unlocked' })
                    : t('progress.locked', { defaultValue: 'Locked' })}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
};
