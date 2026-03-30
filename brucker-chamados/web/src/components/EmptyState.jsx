import { Inbox, FileText, Users, Printer } from 'lucide-react';

const iconMap = {
  inbox: Inbox,
  'file-text': FileText,
  users: Users,
  printer: Printer,
};

export function EmptyState({ icon = 'inbox', title = 'Nenhum item encontrado', subtitle, actionLabel, onAction }) {
  const Icon = iconMap[icon] || Inbox;

  return (
    <div style={{
      padding: '64px 32px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#141920',
        border: '1px solid #1E2533',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
      }}>
        <Icon size={36} color="#1E2533" />
      </div>
      <p style={{
        color: '#8A94A6',
        fontSize: '16px',
        fontWeight: 600,
        margin: '0 0 6px',
      }}>
        {title}
      </p>
      {subtitle && (
        <p style={{
          color: '#8A94A6',
          fontSize: '13px',
          margin: '0 0 20px',
          opacity: 0.7,
        }}>
          {subtitle}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          className="btn-primary"
          onClick={onAction}
          style={{
            padding: '12px 24px',
            backgroundColor: '#E84C1E',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: "'Barlow', sans-serif",
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
