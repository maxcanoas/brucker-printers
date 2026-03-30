import { X, Loader2 } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, width = '600px', loading = false }) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
          backgroundColor: '#141920',
          borderRadius: '12px',
          border: '1px solid #1E2533',
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
            backgroundColor: 'rgba(13, 17, 23, 0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '12px', zIndex: 10
          }}>
            <Loader2 size={32} color="#E84C1E" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        )}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid #1E2533'
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#FFFFFF' }}>{title}</h2>
          <button
            className="btn-close"
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: '#8A94A6',
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
