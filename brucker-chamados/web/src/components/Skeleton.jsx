export function Skeleton({ width = '100%', height = '20px', borderRadius = '8px', style = {} }) {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

export function SkeletonCard({ style = {} }) {
  return (
    <div style={{
      backgroundColor: '#141920',
      borderRadius: '12px',
      border: '1px solid #1E2533',
      padding: '24px',
      ...style,
    }}>
      <Skeleton width="40%" height="14px" style={{ marginBottom: '12px' }} />
      <Skeleton width="60px" height="32px" borderRadius="6px" />
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {[1, 2, 3, 4, 5].map(i => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <Skeleton width="200px" height="16px" style={{ marginBottom: '16px' }} />
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          backgroundColor: '#141920',
          borderRadius: '12px',
          border: '1px solid #1E2533',
          padding: '16px 20px',
          marginBottom: '8px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <Skeleton width="80px" height="16px" />
            <Skeleton width="100px" height="22px" borderRadius="20px" />
          </div>
          <Skeleton width="90%" height="14px" style={{ marginBottom: '8px' }} />
          <Skeleton width="50%" height="12px" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ count = 4 }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          backgroundColor: '#141920',
          borderRadius: '12px',
          border: '1px solid #1E2533',
          padding: '16px 20px',
          marginBottom: '8px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <Skeleton width="120px" height="16px" />
            <Skeleton width="80px" height="22px" borderRadius="20px" />
          </div>
          <Skeleton width="70%" height="14px" />
        </div>
      ))}
    </div>
  );
}
