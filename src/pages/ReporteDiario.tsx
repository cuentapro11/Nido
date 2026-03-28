import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import BackHeader from '@/components/BackHeader';
import { X, Search, Filter, ChevronDown, Check, Users, Tag } from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────
function formatDisplayDate(d: string) {
  const dt = new Date(d + 'T12:00:00');
  return dt.toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' });
}

const TODAY = new Date().toISOString().split('T')[0];
const GROUPS = ['Todos', 'Bebés', 'Caminadores', 'Pre-escolar'];

// ─── Group Chip ───────────────────────────────────────────────────
function GroupChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
        active
          ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-sm'
          : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A]'
      }`}
    >
      {label}
    </button>
  );
}

// ─── Child Dropdown ───────────────────────────────────────────────
function ChildDropdown({
  children,
  selected,
  onToggle,
}: {
  children: { id: number; name: string }[];
  selected: number[];
  onToggle: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const label =
    selected.length === 0
      ? 'Todos los niños'
      : selected.length === 1
      ? children.find(c => c.id === selected[0])?.name ?? 'Niño'
      : `${selected.length} niños`;

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
          selected.length > 0
            ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-sm'
            : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#1E3A8A]/40 hover:text-[#1E3A8A]'
        }`}
      >
        <Users size={11} />
        {label}
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] z-30 min-w-[160px] py-1.5 overflow-hidden"
          >
            {children.map(child => {
              const isSelected = selected.includes(child.id);
              return (
                <button
                  key={child.id}
                  onClick={() => onToggle(child.id)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#EFF6FF] transition-colors"
                >
                  <span className={`text-sm font-semibold ${isSelected ? 'text-[#1E3A8A]' : 'text-[#374151]'}`}>
                    {child.name}
                  </span>
                  {isSelected && <Check size={14} className="text-[#1E3A8A]" strokeWidth={2.5} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Activity Row ─────────────────────────────────────────────────
function ActivityRow({ item }: {
  item: { icon: string; title: string; desc: string; time: string; type: string };
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-[#F8FAFC] transition-colors">
      <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-base flex-shrink-0">
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-sm font-bold text-[#1E293B] flex-shrink-0">{item.title}</span>
          {item.desc ? (
            <span className="text-xs text-[#94A3B8] truncate">{item.desc}</span>
          ) : null}
        </div>
      </div>
      <span className="text-xs font-semibold text-[#64748B] flex-shrink-0">{item.time}</span>
    </div>
  );
}

// ─── Child Block ──────────────────────────────────────────────────
function ChildBlock({
  child,
  activities,
  index,
}: {
  child: { id: number; name: string; emoji: string; group: string };
  activities: { icon: string; title: string; desc: string; time: string; type: string }[];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E2E8F0]"
    >
      {/* Child header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <div className="w-8 h-8 rounded-full bg-[#EFF6FF] flex items-center justify-center text-lg flex-shrink-0">
          {child.emoji}
        </div>
        <span className="flex-1 text-sm font-extrabold text-[#1E3A8A] tracking-wide uppercase min-w-0">
          {child.name}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] font-bold text-[#64748B] bg-white border border-[#E2E8F0] rounded-full px-2 py-0.5">
            {child.group}
          </span>
          <span className="text-[10px] font-bold text-[#94A3B8] bg-white border border-[#E2E8F0] rounded-full px-2 py-0.5">
            {activities.length} {activities.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>
      </div>

      {/* Activity rows */}
      <div className="px-1 py-1">
        {activities.map((act, i) => (
          <ActivityRow key={i} item={act} />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function ReporteDiario() {
  const { children } = useApp();
  const navigate = useNavigate();

  const [filterDate, setFilterDate] = useState(TODAY);
  const [filterGroup, setFilterGroup] = useState('Todos');
  const [selectedChildren, setSelectedChildren] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const toggleChild = (id: number) =>
    setSelectedChildren(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const grouped = useMemo(() => {
    let list = [...children];
    if (filterGroup !== 'Todos') list = list.filter(c => c.group === filterGroup);
    if (selectedChildren.length > 0) list = list.filter(c => selectedChildren.includes(c.id));
    const q = search.trim().toLowerCase();
    return list
      .map(child => {
        let acts = child.tl;
        if (q) {
          acts = acts.filter(
            a =>
              a.title.toLowerCase().includes(q) ||
              child.name.toLowerCase().includes(q) ||
              (a.desc && a.desc.toLowerCase().includes(q))
          );
        }
        return { child, activities: acts };
      })
      .filter(entry => entry.activities.length > 0);
  }, [children, filterGroup, selectedChildren, search]);

  const totalRecords = grouped.reduce((sum, g) => sum + g.activities.length, 0);
  const hasActiveFilters = filterGroup !== 'Todos' || selectedChildren.length > 0;

  const clearAll = () => { setFilterGroup('Todos'); setSelectedChildren([]); setSearch(''); };

  const activeFilterCount = (filterGroup !== 'Todos' ? 1 : 0) + selectedChildren.length;

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-8">
      <BackHeader title="Reporte Diario" onBack={() => navigate('/configuracion')} />

      {/* ── Header card ─────────────────────────────── */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl px-4 py-3.5 shadow-sm">

          {/* Row 1: date + filter toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-sm flex-shrink-0">
                📅
              </div>
              <input
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="text-sm font-bold text-[#1E293B] bg-transparent outline-none cursor-pointer"
              />
            </div>
            <button
              onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                showFilters || hasActiveFilters
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                  : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:border-[#1E3A8A]/40'
              }`}
            >
              <Filter size={12} />
              Filtros
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 bg-white/25 rounded-full text-[9px] font-extrabold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Row 2: context summary */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-xs text-[#94A3B8] font-medium">{formatDisplayDate(filterDate)}</span>
            <span className="text-[#CBD5E1] text-xs">·</span>
            <span className="text-xs font-bold text-[#64748B]">
              {totalRecords} {totalRecords === 1 ? 'registro' : 'registros'}
            </span>
            <span className="text-[#CBD5E1] text-xs">·</span>
            <span className="text-xs font-bold text-[#64748B]">
              {grouped.length} {grouped.length === 1 ? 'niño' : 'niños'}
            </span>
          </div>

          {/* Expanded filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-3.5 mt-3.5 border-t border-[#F1F5F9] space-y-4">

                  {/* Group filter */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Tag size={11} className="text-[#94A3B8]" />
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Grupo</span>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {GROUPS.map(g => (
                        <GroupChip key={g} label={g} active={filterGroup === g} onClick={() => setFilterGroup(g)} />
                      ))}
                    </div>
                  </div>

                  {/* Child dropdown */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Users size={11} className="text-[#94A3B8]" />
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Niño</span>
                    </div>
                    <ChildDropdown
                      children={children.map(c => ({ id: c.id, name: c.name }))}
                      selected={selectedChildren}
                      onToggle={toggleChild}
                    />
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Active filter pills ─────────────────────── */}
      {hasActiveFilters && (
        <div className="px-4 pb-2 flex items-center gap-1.5 flex-wrap">
          {filterGroup !== 'Todos' && (
            <span className="inline-flex items-center gap-1 bg-[#EFF6FF] text-[#1E3A8A] text-xs font-bold px-2.5 py-1 rounded-full border border-[#BFDBFE]">
              {filterGroup}
              <button onClick={() => setFilterGroup('Todos')} className="hover:opacity-60 transition-opacity ml-0.5">
                <X size={11} />
              </button>
            </span>
          )}
          {selectedChildren.map(id => {
            const child = children.find(c => c.id === id);
            if (!child) return null;
            return (
              <span key={id} className="inline-flex items-center gap-1 bg-[#EFF6FF] text-[#1E3A8A] text-xs font-bold px-2.5 py-1 rounded-full border border-[#BFDBFE]">
                {child.name}
                <button onClick={() => toggleChild(id)} className="hover:opacity-60 transition-opacity ml-0.5">
                  <X size={11} />
                </button>
              </span>
            );
          })}
          <button onClick={clearAll} className="text-xs text-[#94A3B8] font-semibold hover:text-[#1E3A8A] transition-colors ml-0.5">
            Limpiar todo
          </button>
        </div>
      )}

      {/* ── Search ──────────────────────────────────── */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por niño o actividad…"
            className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-9 pr-9 py-2.5 text-sm text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition-colors">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Grouped activity list ───────────────────── */}
      <div className="px-4 space-y-3">
        {grouped.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-14">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-sm border border-[#E2E8F0]">
              📋
            </div>
            <p className="font-bold text-[#1E293B]">Sin actividades registradas</p>
            <p className="text-sm text-[#94A3B8] mt-1">
              {search || hasActiveFilters
                ? 'Prueba ajustando los filtros o la búsqueda.'
                : 'Las actividades aparecerán aquí cuando se registren.'}
            </p>
            {(search || hasActiveFilters) && (
              <button onClick={clearAll} className="mt-3 text-sm font-bold text-[#2563EB] hover:text-[#1E3A8A] transition-colors">
                Limpiar filtros
              </button>
            )}
          </motion.div>
        ) : (
          grouped.map(({ child, activities }, i) => (
            <ChildBlock key={child.id} child={child} activities={activities} index={i} />
          ))
        )}
      </div>
    </div>
  );
}
