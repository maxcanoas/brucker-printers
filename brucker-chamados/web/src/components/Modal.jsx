import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, width = '600px' }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#141920',
        borderRadius: '12px',
        border: '1px solid #1E2533',
        width: '100%',
        maxWidth: width,
        maxHeight: '90vh',
        overflow: 'auto'
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid #1E2533'
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#FFFFFF' }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#8A94A6',
            cursor: 'pointer', padding: '4px'
          }}>
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
