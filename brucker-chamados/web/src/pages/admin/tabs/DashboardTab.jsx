import { AlertTriangle, UserCog, Wrench, Clock, CheckCircle } from 'lucide-react';

const cardStyle = {
  backgroundColor: '#141920', borderRadius: '12px', border: '1px solid #1E2533', padding: '24px'
};

export default function DashboardTab({ dashboard }) {
  const contadores = [
    { label: 'Abertos', valor: dashboard?.abertos || 0, icon: AlertTriangle, color: '#4D8EF5' },
    { label: 'Atribuídos', valor: dashboard?.atribuidos || 0, icon: UserCog, color: '#9B59B6' },
    { label: 'Em Atendimento', valor: dashboard?.em_atendimento || 0, icon: Wrench, color: '#C9A227' },
    { label: 'SLA Vencendo', valor: dashboard?.sla_vencendo || 0, icon: Clock, color: '#E84C1E' },
    { label: 'Concluídos Hoje', valor: dashboard?.concluidos_hoje || 0, icon: CheckCircle, color: '#3D9E6B' }
  ];

  return (
    <div>
      <h2 style={{ color: '#FFFFFF', fontSize: '24px', marginBottom: '24px', fontFamily: "'Barlow Condensed', sans-serif" }}>
        Dashboard
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {contadores.map(c => (
          <div key={c.label} style={cardStyle} className="card-interactive">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                backgroundColor: `${c.color}15`, display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}>
                <c.icon size={24} color={c.color} />
              </div>
              <div>
                <p style={{ color: '#8A94A6', fontSize: '13px', margin: 0 }}>{c.label}</p>
                <p style={{ color: '#FFFFFF', fontSize: '28px', fontWeight: 700, margin: 0 }}>{c.valor}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {dashboard?.sla_vencido > 0 && (
        <div style={{
          ...cardStyle, borderColor: '#E84C1E', marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <AlertTriangle size={24} color="#E84C1E" />
          <div>
            <p style={{ color: '#E84C1E', fontWeight: 600, margin: 0 }}>
              {dashboard.sla_vencido} chamado(s) com SLA vencido!
            </p>
            <p style={{ color: '#8A94A6', fontSize: '13px', margin: '4px 0 0' }}>
              Verifique os chamados pendentes imediatamente.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
