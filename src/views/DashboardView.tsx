import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore, DayRecord } from '../store';
import { format, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Clock, Flame, Play, Pause, Save, Plus, X, Timer } from 'lucide-react';
import { cn } from '../utils';

const formatTime = (secs: number) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
};

export const DashboardView = () => {
  const { t } = useTranslation();
  const { currentUser, days, tasks, incrementTaskTime, activeDate } = useStore();
  const setActiveDate = useStore((s) => s.setActiveDate);
  const todayStr = activeDate || format(new Date(), 'yyyy-MM-dd');
  
  const todayRecord = days.find(d => d.date === todayStr && d.userId === currentUser?.id);
  const todayTasks = tasks.filter(t => t.date === todayStr && t.userId === currentUser?.id);

  const [activeTimerId, setActiveTimerId] = useState<string | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (activeTimerId && !todayRecord?.isCompleted) {
      interval = setInterval(() => incrementTaskTime(activeTimerId, 1), 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimerId, incrementTaskTime, todayRecord?.isCompleted]);

  if (!currentUser) return null;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
      <div className="max-w-5xl mx-auto mb-6">
        <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-700 p-4 md:p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-slate-400">
              {t('dashboard.pickDate')}
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              {todayStr}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={todayStr}
              onChange={(e) => setActiveDate(e.target.value)}
              className="px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => setActiveDate(format(new Date(), 'yyyy-MM-dd'))}
              className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black"
            >
              {t('dashboard.today')}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {!todayRecord && (
          <motion.div key="start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="max-w-2xl mx-auto mt-10">
            <StartDayForm todayStr={todayStr} />
          </motion.div>
        )}

        {todayRecord && !todayRecord.isCompleted && (
          <motion.div key="active" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -100 }} className="w-full max-w-5xl mx-auto pb-20">
            <ActiveDay day={todayRecord} tasks={todayTasks} activeTimerId={activeTimerId} setActiveTimerId={setActiveTimerId} />
          </motion.div>
        )}

        {todayRecord && todayRecord.isCompleted && (
          <motion.div key="completed" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto mt-10">
            <DaySummary day={todayRecord} tasks={todayTasks} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StartDayForm = ({ todayStr }: { todayStr: string }) => {
  const { t } = useTranslation();
  const { currentUser, startDay } = useStore();
  const days = useStore((s) => s.days);
  const tasks = useStore((s) => s.tasks);
  const deleteDay = useStore((s) => s.deleteDay);
  const activeDate = useStore((s) => s.activeDate);
  const setActiveDate = useStore((s) => s.setActiveDate);
  const [plannedHours, setPlannedHours] = useState(5);
  const [taskInputs, setTaskInputs] = useState(['', '']);
  const [dateStr, setDateStr] = useState(activeDate || todayStr);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTasks = taskInputs.map(t => t.trim()).filter(Boolean).map(title => ({ title }));
    if (cleanTasks.length === 0) return alert("Please add at least one task!");
    const realToday = format(new Date(), 'yyyy-MM-dd');
    if (dateStr !== realToday) {
      const ok = window.confirm(t('dashboard.dateMismatchConfirm', { selected: dateStr, today: realToday }));
      if (!ok) return;
    }

    const existingDay = days.find((d) => d.userId === currentUser?.id && d.date === dateStr);
    const existingTasksCount = tasks.filter((tt) => tt.userId === currentUser?.id && tt.date === dateStr).length;
    if (existingDay || existingTasksCount > 0) {
      const ok = window.confirm(t('dashboard.dayExistsConfirm', { date: dateStr, defaultValue: 'A day already exists for {{date}}. Overwrite it?' }));
      if (!ok) return;
      await deleteDay(dateStr);
    }

    setActiveDate(dateStr);
    await startDay(dateStr, plannedHours, cleanTasks);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl dark:border-slate-700 border">
      <h2 className="text-3xl font-extrabold mb-2">{t('dashboard.welcome', { name: currentUser?.name })}</h2>
      <p className="text-slate-500 mb-8">{t('dashboard.startDay')}</p>
      
      <form onSubmit={handleStart} className="space-y-6">
        <div>
          <label className="block text-sm font-bold mb-2">{t('dashboard.date')}</label>
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">{t('dashboard.plannedHours')}</label>
          <div className="flex gap-4 items-center">
            <input type="range" min="1" max="12" step="0.5" value={plannedHours} onChange={e => setPlannedHours(parseFloat(e.target.value))} className="flex-1 accent-indigo-600"/>
            <span className="text-xl font-black w-16 text-indigo-600">{plannedHours}h</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">{t('dashboard.planTitle')}</label>
          <div className="space-y-3">
            {taskInputs.map((val, idx) => (
              <div key={idx} className="flex gap-2">
                <input type="text" value={val} onChange={e => {
                  const newInputs = [...taskInputs]; newInputs[idx] = e.target.value; setTaskInputs(newInputs);
                }} placeholder={`Task ${idx + 1}`} className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                <button type="button" onClick={() => setTaskInputs(taskInputs.filter((_, i) => i !== idx))} className="p-3 text-slate-400 hover:text-red-500"><X size={20} /></button>
              </div>
            ))}
            <button type="button" onClick={() => setTaskInputs([...taskInputs, ''])} className="flex items-center gap-2 text-indigo-500 font-bold"><Plus size={18} /> Add task</button>
          </div>
        </div>

        <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg">{t('dashboard.savePlan')}</button>
      </form>
    </div>
  );
};

const ActiveDay = ({ day, tasks, activeTimerId, setActiveTimerId }: any) => {
  const { t } = useTranslation();
  const { toggleTask, updateDayActualHours, endDay } = useStore();
  const [isStudying, setIsStudying] = useState(false);
  const [studySeconds, setStudySeconds] = useState(() => Math.round((day.actualHours || 0) * 3600));

  const requiredSeconds = useMemo(() => Math.round((day.plannedHours || 0) * 3600), [day.plannedHours]);
  const canEnd = studySeconds >= requiredSeconds;

  const completionPct = tasks.length ? Math.round((tasks.filter((t: any) => t.completed).length / tasks.length) * 100) : 0;

  useEffect(() => {
    if (!isStudying) return;
    const interval = setInterval(() => setStudySeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isStudying]);

  // Persist hours periodically + keep local store in sync
  useEffect(() => {
    const hrs = studySeconds / 3600;
    updateDayActualHours(day.date, hrs);
  }, [studySeconds, updateDayActualHours, day.date]);

  const formattedStudy = formatTime(studySeconds);
  const formattedRequired = formatTime(requiredSeconds);
  const studyPct = requiredSeconds > 0 ? Math.min(100, Math.round((studySeconds / requiredSeconds) * 100)) : 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black">{t('dashboard.activeDay', { date: day.date })}</h1>
        </div>
        <button
          onClick={async () => {
            if (!canEnd) {
              alert(t('dashboard.needMoreTime', { need: formattedRequired, have: formattedStudy }));
              return;
            }
            setIsStudying(false);
            await endDay(day.date);
          }}
          disabled={!canEnd}
          className={cn(
            "px-6 py-3 rounded-xl font-bold transition-all",
            canEnd ? "bg-red-500 hover:bg-red-600 text-white" : "bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-not-allowed"
          )}
        >
          {t('dashboard.endDay')}
        </button>
      </div>

      {/* --- STUDY TIMER (required to end day) --- */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="bg-white dark:bg-[#1e293b] p-8 md:p-12 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-3xl rounded-full pointer-events-none" />
        
        <h2 className="text-xl font-bold mb-6 tracking-widest uppercase text-slate-400 z-10 flex items-center gap-2">
          <Timer size={18} /> {t('dashboard.studyTimer')}
        </h2>

        <div className="z-10 w-full max-w-xl">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="text-5xl md:text-6xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums tracking-tighter">
                {formattedStudy}
              </div>
              <div className="text-sm font-bold text-slate-400 mt-2">
                {t('dashboard.required')}: {formattedRequired}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsStudying((v) => !v)}
              className={cn(
                "px-6 py-4 rounded-2xl font-black text-white shadow-lg transition-colors flex items-center gap-2",
                isStudying ? "bg-amber-500 hover:bg-amber-600" : "bg-indigo-600 hover:bg-indigo-700"
              )}
            >
              {isStudying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
              {isStudying ? t('dashboard.pause') : t('dashboard.start')}
            </motion.button>
          </div>

          <div className="mt-6">
            <div className="flex justify-between font-bold mb-3">
              <span>{t('dashboard.timeProgress')}</span>
              <span className="text-indigo-500">{studyPct}%</span>
            </div>
            <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${studyPct}%` }} className="h-full bg-indigo-500 rounded-full" />
            </div>
            {!canEnd && (
              <div className="mt-3 text-sm font-bold text-slate-500">
                {t('dashboard.cannotEndYet')}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex justify-between font-bold mb-3">
          <span>{t('dashboard.progress')}</span>
          <span className="text-indigo-500">{completionPct}%</span>
        </div>
        <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${completionPct}%` }} className="h-full bg-indigo-500 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><Flame className="text-orange-500" /> {t('dashboard.tasks')}</h2>
          
          <div className="space-y-3">
            {tasks.map((task: any) => {
              const isPlaying = activeTimerId === task.id;
              return (
                <div key={task.id} className={cn("p-4 rounded-2xl border flex items-center gap-4", task.completed ? "bg-slate-50 dark:bg-slate-900/50 opacity-60" : "bg-white dark:bg-slate-800", isPlaying && "border-indigo-500 ring-2 ring-indigo-500/20")}>
                  <button onClick={() => toggleTask(task.id)} className={cn("flex-shrink-0", task.completed ? "text-indigo-500" : "text-slate-400")}>
                    {task.completed ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                  </button>
                  <div className="flex-1">
                    <p className={cn("font-bold text-lg", task.completed && "line-through")}>{task.title}</p>
                    <p className="text-sm font-mono text-slate-500 mt-1 flex items-center gap-1"><Clock size={14} /> {formatTime(task.timerSeconds)}</p>
                  </div>
                  {!task.completed && (
                    <button onClick={() => setActiveTimerId(isPlaying ? null : task.id)} className={cn("w-12 h-12 flex items-center justify-center rounded-xl text-white", isPlaying ? "bg-amber-500" : "bg-indigo-500")}>
                      {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-6">
          {/* We moved the hours block to the top */}
          <div className="bg-indigo-500/10 p-6 rounded-3xl border border-indigo-500/20 text-center animate-pulse">
            <h3 className="font-bold text-indigo-600 dark:text-indigo-400 mb-2">Keep Grinding!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Your daily hours are logged in the giant timer above directly to your weekly 30h goal.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DaySummary = ({ day, tasks }: any) => {
  const { t } = useTranslation();
  const setActiveDate = useStore((s) => s.setActiveDate);
  const completionPct = tasks.length ? Math.round((tasks.filter((t: any) => t.completed).length / tasks.length) * 100) : 0;
  
  let colorClass = "";
  let message = "";
  if (completionPct < 40) { colorClass = "bg-red-500"; message = t('dashboard.msgShit'); }
  else if (completionPct < 60) { colorClass = "bg-amber-400 text-slate-900"; message = t('dashboard.msgOkay'); }
  else if (completionPct < 80) { colorClass = "bg-blue-500"; message = t('dashboard.msgGood'); }
  else if (completionPct < 100) { colorClass = "bg-green-500"; message = t('dashboard.msgGreat'); }
  else { colorClass = "bg-pink-500 bg-gradient-to-br from-pink-500 to-purple-600 animate-pulse"; message = t('dashboard.msgLegend'); }

  return (
    <div className={cn("p-8 md:p-12 rounded-[2rem] text-white shadow-2xl flex flex-col items-center text-center", colorClass)}>
      <h1 className="text-4xl md:text-6xl font-black mb-4">{completionPct}%</h1>
      <p className="text-xl md:text-2xl font-bold opacity-90 mb-8">{message}</p>
      <div className="w-full max-w-sm bg-black/10 rounded-2xl p-6 text-left space-y-4 backdrop-blur-sm">
        <h3 className="font-bold opacity-80 uppercase tracking-widest text-xs">{t('dashboard.summary')}</h3>
        <div className="flex justify-between items-center text-lg"><span>{t('dashboard.actualHours')}:</span><span className="font-black">{day.actualHours || day.plannedHours}h</span></div>
        <div className="pt-4 border-t border-white/20 mt-4 space-y-2">
          {tasks.map((t: any) => (
            <div key={t.id} className="flex justify-between text-sm items-center">
              <span className={cn("truncate max-w-[180px]", !t.completed && "opacity-50 line-through")}>{t.title}</span>
              <span className="font-mono opacity-80">{formatTime(t.timerSeconds)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-sm mt-8 space-y-3">
        <button
          onClick={() => setActiveDate(format(addDays(new Date(day.date), 1), 'yyyy-MM-dd'))}
          className="w-full py-4 bg-white/15 hover:bg-white/25 text-white rounded-2xl font-black text-lg transition-colors"
        >
          {t('dashboard.startNextDay')}
        </button>
        <button
          onClick={() => setActiveDate(format(addDays(new Date(day.date), 1), 'yyyy-MM-dd'))}
          className="w-full py-4 bg-black/15 hover:bg-black/25 text-white rounded-2xl font-black text-lg transition-colors"
        >
          {t('dashboard.rest')}
        </button>
      </div>
    </div>
  );
};
