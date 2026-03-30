import { Loader2 } from 'lucide-react';

export function LoadingButton({ loading, loadingText, children, style, className = '', ...props }) {
  return (
    <button
      className={`btn-primary ${className}`}
      disabled={loading}
      style={{
        ...style,
        opacity: loading ? 0.85 : 1,
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}
      {...props}
    >
      {loading && (
        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
      )}
      {loading ? (loadingText || children) : children}
    </button>
  );
}
