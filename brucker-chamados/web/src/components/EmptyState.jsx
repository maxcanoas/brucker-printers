import { Inbox, FileText, Users, Printer } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const iconMap = {
  inbox: Inbox,
  'file-text': FileText,
  users: Users,
  printer: Printer,
};

export function EmptyState({ icon = 'inbox', title = 'Nenhum item encontrado', subtitle, actionLabel, onAction }) {
  const { theme } = useTheme();
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
        backgroundColor: theme.card,
        border: `1px solid ${theme.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
      }}>
        <Icon size={36} color={theme.border} />
      </div>
      <p style={{
        color: theme.textSecondary,
        fontSize: '16px',
        fontWeight: 600,
        margin: '0 0 6px',
      }}>
        {title}
      </p>
      {subtitle && (
        <p style={{
          color: theme.textSecondary,
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
            backgroundColor: theme.accent,
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
