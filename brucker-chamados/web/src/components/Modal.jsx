import { X, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function Modal({ isOpen, onClose, title, children, width = '600px', loading = false }) {
  const { theme } = useTheme();
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: theme.overlayBg,
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '20px'
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-content"
        style={{
          backgroundColor: theme.card,
          borderRadius: '12px',
          border: `1px solid ${theme.border}`,
          width: '100%',
          maxWidth: width,
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        {loading && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: theme.overlayBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '12px', zIndex: 10
          }}>
            <Loader2 size={32} color={theme.accent} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        )}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px',
          borderBottom: `1px solid ${theme.border}`
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: theme.text }}>{title}</h2>
          <button
            className="btn-close"
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: theme.textSecondary,
              cursor: 'pointer', padding: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: '24px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
