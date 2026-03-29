import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/components/Toast';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';

export default function Documents() {
  const { children, pendingPayments, remindPayment } = useApp();
  const { show } = useToast();

  const cobrado = (children.length - pendingPayments.length) * 350;

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Documentos y Pagos" subtitle="Gestión financiera" />

      <div className="px-3.5 space-y-3">
        {/* Summary card */}
        <div className="bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] rounded-2xl p-4 text-white">
          <div className="text-sm font-semibold mb-3">Resumen Marzo 2026</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { num: children.length - pendingPayments.length, label: 'Pagados', bg: 'bg-primary-foreground/10' },
              { num: pendingPayments.length, label: 'Pendientes', bg: 'bg-warning/25' },
              { num: '$' + cobrado, label: 'Cobrado', bg: 'bg-success/25' },
            ].map(m => (
              <div key={m.label} className={`${m.bg} rounded-lg p-2.5 text-center`}>
                <div className="text-lg font-bold">{m.num}</div>
                <div className="text-[10px] opacity-70 mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending payments */}
        {pendingPayments.length > 0 && (
          <>
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide px-1">Pagos pendientes</div>
            <div className="bg-card rounded-2xl shadow-card overflow-hidden">
              {pendingPayments.map((p, i) => (
                <div key={i} className={`p-3.5 flex items-center justify-between ${i > 0 ? 'border-t border-border' : ''}`}>
                  <div>
                    <div className="text-sm font-bold text-foreground">{p.name}</div>
                    <div className="text-[11px] text-muted-foreground">{p.sub}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-warning">{p.amount}</span>
                    <button
                      onClick={() => {
                        if (p.reminded) { show('Ya enviado'); return; }
                        remindPayment(i);
                        show('📩 Recordatorio enviado a ' + p.name);
                      }}
                      className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                        p.reminded ? 'bg-success-light text-success' : 'bg-warning-light text-warning-foreground'
                      }`}
                    >
                      {p.reminded ? '✓ Enviado' : 'Recordar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Documents */}
        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide px-1">Documentos</div>
        {[['📋', '#EFF6FF', 'Contratos 2026'], ['💉', '#EFF6FF', 'Vacunas'], ['📄', '#EFF6FF', 'Autorizaciones']].map(doc => (
          <button
            key={doc[2]}
            onClick={() => show('📄 Abriendo ' + doc[2])}
            className="w-full bg-card rounded-xl p-3.5 flex items-center gap-3 shadow-card active:scale-[0.98] transition-transform text-left"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ background: doc[1] as string }}>
              {doc[0]}
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-foreground">{doc[2]}</div>
            </div>
            <span className="text-xs text-success font-semibold">Ver ›</span>
          </button>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
