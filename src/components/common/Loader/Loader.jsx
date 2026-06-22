import React from 'react';

export default function Loader({ size = '24px', color = 'var(--text)' }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ animation: 'spin 1s linear infinite' }}
      >
        <circle cx="12" cy="12" r="10" strokeDasharray="32" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" />
      </svg>
      <style>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
