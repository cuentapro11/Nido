import React, { createContext, useContext, useState } from 'react';

// ─── TYPES ────────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'caregiver' | 'parent';

export interface DaycareUser {
  id: string;
  daycare_id: string;
  auth_id: string;
  name: string;
  phone?: string;
  email: string;
  role: UserRole;
}

export interface Daycare {
  id: string;
  name: string;
  phone?: string;
  email: string;
}

export interface ChildRecord {
  id: string;
  daycare_id: string;
  parent_id: string | null;
  name: string;
  age_months: number | null;
  allergies: string;
  medical_conditions: string;
  extra_info?: string;
  profile_complete: boolean;
}

export interface ActivityRecord {
  id: string;
  daycare_id: string;
  child_id: string;
  created_by: string;
  type: string;
  note: string;
  created_at: string;
}

// ─── MOCK DB ──────────────────────────────────────────────────────────────
const mockDB = {
  daycares: [
    { id: 'dc1', name: 'Cuido Rayito de Sol ☀️', phone: '829-555-0100', email: 'admin@rayito.com' },
  ] as Daycare[],
  users: [
    { id: 'u1', daycare_id: 'dc1', auth_id: 'auth-admin', name: 'María López',    email: 'admin@rayito.com',  role: 'admin'     as UserRole },
    { id: 'u2', daycare_id: 'dc1', auth_id: 'auth-cg1',   name: 'Elena Martínez', email: 'elena@rayito.com',  role: 'caregiver' as UserRole },
    { id: 'u3', daycare_id: 'dc1', auth_id: 'auth-cg2',   name: 'Carlos Romero',  email: 'carlos@rayito.com', role: 'caregiver' as UserRole },
    { id: 'u4', daycare_id: 'dc1', auth_id: 'auth-p1',    name: 'Juan Pérez',     email: 'juan@gmail.com',    role: 'parent'    as UserRole },
  ] as DaycareUser[],
  children: [
    { id: 'ch1', daycare_id: 'dc1', parent_id: 'u4', name: 'Sofía', age_months: 14, allergies: 'Maní',  medical_conditions: '',                     profile_complete: true  },
    { id: 'ch2', daycare_id: 'dc1', parent_id: null, name: 'Mateo', age_months: 24, allergies: '',       medical_conditions: '',                     profile_complete: true  },
    { id: 'ch3', daycare_id: 'dc1', parent_id: null, name: 'Diego', age_months: 18, allergies: '',       medical_conditions: 'Amoxicilina 5ml 10am', profile_complete: true  },
    { id: 'ch4', daycare_id: 'dc1', parent_id: null, name: 'Luna',  age_months: 8,  allergies: '',       medical_conditions: '',                     profile_complete: false },
  ] as ChildRecord[],
  activities: [
    { id: 'a1', daycare_id: 'dc1', child_id: 'ch1', created_by: 'u2', type: 'Comida',       note: 'Desayunó bien — leche y galleta.',   created_at: new Date().toISOString() },
    { id: 'a2', daycare_id: 'dc1', child_id: 'ch1', created_by: 'u2', type: 'Siesta',       note: 'Durmió 45 min tranquila.',            created_at: new Date().toISOString() },
    { id: 'a3', daycare_id: 'dc1', child_id: 'ch2', created_by: 'u3', type: 'Foto del día', note: 'Jugando con bloques de colores.',     created_at: new Date().toISOString() },
    { id: 'a4', daycare_id: 'dc1', child_id: 'ch3', created_by: 'u2', type: 'Medicamento',  note: 'Amoxicilina 5ml administrada.',       created_at: new Date().toISOString() },
  ] as ActivityRecord[],
  presence: { ch1: true, ch2: true, ch3: true, ch4: false } as Record<string, boolean>,
};

// ─── CONTEXT ──────────────────────────────────────────────────────────────
interface SupabaseContextType {
  profile: DaycareUser | null;
  daycare: Daycare | null;
  loading: boolean;
  // Auth
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  registerDaycare: (data: { daycareName: string; adminName: string; phone: string; email: string; password: string }) => Promise<{ error: string | null }>;
  registerParent: (data: { name: string; phone: string; email: string; password: string }) => Promise<{ error: string | null }>;
  createCaregiver: (data: { name: string; phone: string; email: string; password: string }) => Promise<{ error: string | null }>;
  logout: () => void;
  // Data helpers
  getChildren: () => ChildRecord[];
  getActivities: () => ActivityRecord[];
  getCaregivers: () => DaycareUser[];
  getUserById: (id: string) => DaycareUser | undefined;
  isPresent: (childId: string) => boolean;
  togglePresence: (childId: string) => void;
  addActivity: (act: Omit<ActivityRecord, 'id' | 'created_at'>) => void;
  addChild: (child: Omit<ChildRecord, 'id'>) => void;
}

const SupabaseCtx = createContext<SupabaseContextType | null>(null);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<DaycareUser | null>(null);
  const [daycare, setDaycare] = useState<Daycare | null>(null);
  const [loading, setLoading] = useState(false);
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(n => n + 1);

  const login = async (email: string, _password: string) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const user = mockDB.users.find(u => u.email === email);
    if (!user) { setLoading(false); return { error: 'No existe una cuenta con ese correo.' }; }
    const dc = mockDB.daycares.find(d => d.id === user.daycare_id) || null;
    setProfile(user);
    setDaycare(dc);
    setLoading(false);
    return { error: null };
  };

  const registerDaycare = async ({ daycareName, adminName, phone, email }: { daycareName: string; adminName: string; phone: string; email: string; password: string }) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const dcId = crypto.randomUUID();
    const dc: Daycare = { id: dcId, name: daycareName, phone, email };
    const user: DaycareUser = { id: crypto.randomUUID(), daycare_id: dcId, auth_id: crypto.randomUUID(), name: adminName, phone, email, role: 'admin' };
    mockDB.daycares.push(dc);
    mockDB.users.push(user);
    setProfile(user);
    setDaycare(dc);
    setLoading(false);
    return { error: null };
  };

  const registerParent = async ({ name, phone, email }: { name: string; phone: string; email: string; password: string }) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const dc = mockDB.daycares[0];
    const user: DaycareUser = { id: crypto.randomUUID(), daycare_id: dc?.id || '', auth_id: crypto.randomUUID(), name, phone, email, role: 'parent' };
    mockDB.users.push(user);
    setProfile(user);
    setDaycare(dc || null);
    setLoading(false);
    return { error: null };
  };

  const createCaregiver = async ({ name, phone, email }: { name: string; phone: string; email: string; password: string }) => {
    if (!daycare) return { error: 'Sin daycare activo.' };
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const user: DaycareUser = { id: crypto.randomUUID(), daycare_id: daycare.id, auth_id: crypto.randomUUID(), name, phone, email, role: 'caregiver' };
    mockDB.users.push(user);
    setLoading(false);
    refresh();
    return { error: null };
  };

  const logout = () => { setProfile(null); setDaycare(null); };

  const dcId = daycare?.id || 'dc1';
  const getChildren   = () => mockDB.children.filter(c => c.daycare_id === dcId);
  const getActivities = () => [...mockDB.activities.filter(a => a.daycare_id === dcId)];
  const getCaregivers = () => mockDB.users.filter(u => u.daycare_id === dcId && u.role === 'caregiver');
  const getUserById   = (id: string) => mockDB.users.find(u => u.id === id);
  const isPresent     = (childId: string) => !!mockDB.presence[childId];

  const togglePresence = (childId: string) => {
    mockDB.presence[childId] = !mockDB.presence[childId];
    refresh();
  };

  const addActivity = (act: Omit<ActivityRecord, 'id' | 'created_at'>) => {
    mockDB.activities.unshift({ ...act, id: crypto.randomUUID(), created_at: new Date().toISOString() });
    refresh();
  };

  const addChild = (child: Omit<ChildRecord, 'id'>) => {
    mockDB.children.push({ ...child, id: crypto.randomUUID() });
    refresh();
  };

  return (
    <SupabaseCtx.Provider value={{
      profile, daycare, loading,
      login, registerDaycare, registerParent, createCaregiver, logout,
      getChildren, getActivities, getCaregivers, getUserById,
      isPresent, togglePresence, addActivity, addChild,
    }}>
      {children}
    </SupabaseCtx.Provider>
  );
}

export function useSupabase() {
  const ctx = useContext(SupabaseCtx);
  if (!ctx) throw new Error('useSupabase must be used within SupabaseProvider');
  return ctx;
}
