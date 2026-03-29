import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/components/Toast';
import BackHeader from '@/components/BackHeader';

export default function ParentDocs() {
  const navigate = useNavigate();
  const { show } = useToast();

  return (
    <div className="min-h-screen bg-background">
      <BackHeader title="Documentos" onBack={() => navigate(-1)} />

      <div className="px-3.5 pt-3 space-y-2.5">
        {[
          ['📋', '#EDF4FF', 'Contrato de servicio', 'Vigente 2026'],
          ['💉', '#EFF6FF', 'Registro de vacunas', 'Actualizado'],
          ['📄', '#EFF6FF', 'Autorizaciones', '2 documentos'],
        ].map(doc => (
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
              <div className="text-[11px] text-muted-foreground">{doc[3]}</div>
            </div>
            <span className="text-xs text-success font-semibold">Ver ›</span>
          </button>
        ))}
      </div>
    </div>
  );
}
