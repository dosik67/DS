/**
 * =============================================================
 * DISCIPLINE TRACKER — STORE WITH SUPABASE INTEGRATION
 * =============================================================
 * Все данные читаются из и пишутся в Supabase (PostgreSQL).
 *
 * Supabase URL и ключ берутся из .env:
 *   VITE_SUPABASE_URL=...
 *   VITE_SUPABASE_ANON_KEY=...
 *
 * UUID пользователей должны совпадать с теми что в таблице users.
 * Дефолтные seed-пользователи из SQL:
 *   u1 = '00000000-0000-0000-0000-000000000001' (Alikhan)
 *   u2 = '00000000-0000-0000-0000-000000000002' (Maria)
 *   a1 = '00000000-0000-0000-0000-000000000003' (Admin)
 * =============================================================
 */

import { create } from 'zustand';
import { supabase } from './lib/supabase';

export type Role = 'client' | 'admin';

const toYmd = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export interface User {
  id: string;
  name: string;
  role: Role;
  passesUsed: number;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  date: string;
  timerSeconds: number;
}

export interface DayRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  plannedHours: number;
  actualHours: number;
  isCompleted: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  date: string;
  read: boolean;
}

interface AppState {
  currentUser: User | null;
  adminOriginalUser: User | null;
  users: User[];
  tasks: Task[];
  days: DayRecord[];
  notifications: Notification[];
  loading: boolean;
  activeDate: string;

  // Auth
  login: (name: string, password: string) => Promise<boolean>;
  register: (name: string, password: string, role: Role) => Promise<boolean>;
  logout: () => void;
  setActiveDate: (date: string) => void;
  impersonateUser: (userId: string) => void;
  stopImpersonation: () => void;

  // Bootstrap: load all data from Supabase
  loadInitialData: () => Promise<void>;

  // Days API
  startDay: (date: string, plannedHours: number, tasks: { title: string }[]) => Promise<void>;
  endDay: (date: string) => Promise<void>;
  updateDayActualHours: (date: string, hours: number) => Promise<void>;
  deleteDay: (date: string) => Promise<void>;
  moveDay: (fromDate: string, toDate: string) => Promise<void>;

  // Tasks API
  toggleTask: (taskId: string) => Promise<void>;
  incrementTaskTime: (taskId: string, seconds: number) => Promise<void>;

  // Admin & Common
  sendWarning: (userId: string) => Promise<void>;
  sendAdminMessage: (userId: string, message: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
}

// ─── Helpers: map DB rows → TypeScript interfaces ─────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapUser = (row: any): User => ({
  id: row.id,
  name: row.name,
  role: row.role as Role,
  passesUsed: row.passes_used,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDay = (row: any): DayRecord => ({
  id: row.id,
  userId: row.user_id,
  date: row.date,
  plannedHours: Number(row.planned_hours),
  actualHours: Number(row.actual_hours),
  isCompleted: row.is_completed,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapTask = (row: any): Task => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  completed: row.completed,
  date: row.date,
  timerSeconds: row.timer_seconds,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapNotification = (row: any): Notification => ({
  id: row.id,
  userId: row.user_id,
  message: row.message,
  date: row.created_at,
  read: row.read,
});

// ─── Store ────────────────────────────────────────────────────────────────────

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  adminOriginalUser: null,
  users: [],
  tasks: [],
  days: [],
  notifications: [],
  loading: false,
  activeDate: toYmd(new Date()),

  // ── AUTH ──────────────────────────────────────────────────────────────────

  login: async (name, password) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('name', name)
      .eq('password', password)
      .single();

    if (error || !data) {
      console.error('login error:', error?.message);
      return false;
    }

    const user = mapUser(data);
    set({ currentUser: user, activeDate: toYmd(new Date()) });
    get().loadInitialData();
    return true;
  },

  register: async (name, password, role) => {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        name,
        password,
        role,
        passes_used: 0
      }])
      .select()
      .single();

    if (error || !data) {
      console.error('register error:', error?.message);
      return false;
    }

    const user = mapUser(data);
    set((state) => ({ currentUser: user, users: [...state.users, user], activeDate: toYmd(new Date()) }));
    get().loadInitialData();
    return true;
  },

  logout: () => set({ currentUser: null, adminOriginalUser: null, tasks: [], days: [], notifications: [], activeDate: toYmd(new Date()) }),
  setActiveDate: (date) => set({ activeDate: date }),
  impersonateUser: (userId) => {
    const state = get();
    const admin = state.currentUser;
    if (!admin || admin.role !== 'admin') return;
    const target = state.users.find((u) => u.id === userId);
    if (!target) return;
    set({ adminOriginalUser: admin, currentUser: target, activeDate: toYmd(new Date()) });
  },
  stopImpersonation: () => {
    const state = get();
    if (!state.adminOriginalUser) return;
    set({ currentUser: state.adminOriginalUser, adminOriginalUser: null, activeDate: toYmd(new Date()) });
  },

  // ── BOOTSTRAP ─────────────────────────────────────────────────────────────

  loadInitialData: async () => {
    set({ loading: true });

    // 1. Load all users (needed for admin view and login screen)
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('name');

    if (usersError) console.error('loadInitialData users:', usersError.message);

    const users = (usersData ?? []).map(mapUser);

    // 2. Load days
    const { data: daysData, error: daysError } = await supabase
      .from('days')
      .select('*')
      .order('date', { ascending: false });

    if (daysError) console.error('loadInitialData days:', daysError.message);

    // 3. Load tasks
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true });

    if (tasksError) console.error('loadInitialData tasks:', tasksError.message);

    // 4. Load notifications
    const { data: notifsData, error: notifsError } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (notifsError) console.error('loadInitialData notifications:', notifsError.message);

    set({
      users,
      days: (daysData ?? []).map(mapDay),
      tasks: (tasksData ?? []).map(mapTask),
      notifications: (notifsData ?? []).map(mapNotification),
      loading: false,
    });
  },

  // ── DAYS ──────────────────────────────────────────────────────────────────

  startDay: async (date, plannedHours, newTasks) => {
    const { currentUser } = get();
    if (!currentUser) return;

    // Insert day record
    const { data: dayData, error: dayError } = await supabase
      .from('days')
      .insert({
        user_id: currentUser.id,
        date,
        planned_hours: plannedHours,
        actual_hours: 0,
        is_completed: false,
      })
      .select()
      .single();

    if (dayError) {
      console.error('startDay:', dayError.message);
      return;
    }

    // Insert tasks
    const taskRows = newTasks.map((t) => ({
      user_id: currentUser.id,
      date,
      title: t.title,
      completed: false,
      timer_seconds: 0,
    }));

    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .insert(taskRows)
      .select();

    if (tasksError) {
      console.error('startDay tasks:', tasksError.message);
    }

    set((state) => ({
      days: [mapDay(dayData), ...state.days],
      tasks: [...state.tasks, ...(tasksData ?? []).map(mapTask)],
    }));
  },

  endDay: async (date) => {
    const { currentUser } = get();
    if (!currentUser) return;

    const existingDay = get().days.find((d) => d.userId === currentUser.id && d.date === date);
    const nextActualHours = existingDay?.actualHours ?? 0;

    const { error } = await supabase
      .from('days')
      .update({ is_completed: true, actual_hours: nextActualHours })
      .eq('user_id', currentUser.id)
      .eq('date', date);

    if (error) {
      console.error('endDay:', error.message);
      return;
    }

    set((state) => ({
      days: state.days.map((d) =>
        d.date === date && d.userId === currentUser.id ? { ...d, isCompleted: true, actualHours: nextActualHours } : d
      ),
    }));
  },

  updateDayActualHours: async (date, hours) => {
    const { currentUser } = get();
    if (!currentUser) return;

    const { error } = await supabase
      .from('days')
      .update({ actual_hours: hours })
      .eq('user_id', currentUser.id)
      .eq('date', date);

    if (error) {
      console.error('updateDayActualHours:', error.message);
      return;
    }

    set((state) => ({
      days: state.days.map((d) =>
        d.date === date && d.userId === currentUser.id ? { ...d, actualHours: hours } : d
      ),
    }));
  },

  deleteDay: async (date) => {
    const { currentUser } = get();
    if (!currentUser) return;

    const { error: tasksError } = await supabase
      .from('tasks')
      .delete()
      .eq('user_id', currentUser.id)
      .eq('date', date);

    if (tasksError) {
      console.error('deleteDay tasks:', tasksError.message);
      return;
    }

    const { error: dayError } = await supabase
      .from('days')
      .delete()
      .eq('user_id', currentUser.id)
      .eq('date', date);

    if (dayError) {
      console.error('deleteDay day:', dayError.message);
      return;
    }

    set((state) => ({
      days: state.days.filter((d) => !(d.userId === currentUser.id && d.date === date)),
      tasks: state.tasks.filter((t) => !(t.userId === currentUser.id && t.date === date)),
    }));
  },

  moveDay: async (fromDate, toDate) => {
    const { currentUser } = get();
    if (!currentUser) return;
    if (fromDate === toDate) return;

    // Move day record date
    const { error: dayError } = await supabase
      .from('days')
      .update({ date: toDate })
      .eq('user_id', currentUser.id)
      .eq('date', fromDate);

    if (dayError) {
      console.error('moveDay day:', dayError.message);
      return;
    }

    // Move tasks date
    const { error: tasksError } = await supabase
      .from('tasks')
      .update({ date: toDate })
      .eq('user_id', currentUser.id)
      .eq('date', fromDate);

    if (tasksError) {
      console.error('moveDay tasks:', tasksError.message);
      return;
    }

    set((state) => ({
      days: state.days.map((d) =>
        d.userId === currentUser.id && d.date === fromDate ? { ...d, date: toDate } : d
      ),
      tasks: state.tasks.map((t) =>
        t.userId === currentUser.id && t.date === fromDate ? { ...t, date: toDate } : t
      ),
    }));

    // Keep UI in sync if user is currently on that day
    if (get().activeDate === fromDate) {
      set({ activeDate: toDate });
    }
  },

  // ── TASKS ─────────────────────────────────────────────────────────────────

  toggleTask: async (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newCompleted = !task.completed;

    const { error } = await supabase
      .from('tasks')
      .update({ completed: newCompleted })
      .eq('id', taskId);

    if (error) {
      console.error('toggleTask:', error.message);
      return;
    }

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: newCompleted } : t
      ),
    }));
  },

  incrementTaskTime: async (taskId, seconds) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newSeconds = task.timerSeconds + seconds;

    const { error } = await supabase
      .from('tasks')
      .update({ timer_seconds: newSeconds })
      .eq('id', taskId);

    if (error) {
      console.error('incrementTaskTime:', error.message);
      return;
    }

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, timerSeconds: newSeconds } : t
      ),
    }));
  },

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────────

  sendWarning: async (userId) => {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        message: 'Warning: You are falling behind your 30h/week schedule. Please update your logs.',
        read: false,
      })
      .select()
      .single();

    if (error) {
      console.error('sendWarning:', error.message);
      return;
    }

    set((state) => ({
      notifications: [mapNotification(data), ...state.notifications],
    }));
  },

  sendAdminMessage: async (userId, message) => {
    const clean = message.trim();
    if (!clean) return;
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        message: clean,
        read: false,
      })
      .select()
      .single();

    if (error) {
      console.error('sendAdminMessage:', error.message);
      return;
    }

    set((state) => ({
      notifications: [mapNotification(data), ...state.notifications],
    }));
  },

  markNotificationRead: async (id) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) {
      console.error('markNotificationRead:', error.message);
      return;
    }

    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },
}));
