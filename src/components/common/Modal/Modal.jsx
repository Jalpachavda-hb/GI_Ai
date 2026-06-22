import React from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1100,
      display: 'grid',
      placeItems: 'center',
      backgroundColor: 'rgba(15, 38, 70, 0.45)',
      backdropFilter: 'blur(4px)',
      pointerEvents: 'auto'
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
      }} onClick={onClose} />
      <div style={{
        position: 'relative',
        background: '#ffffff',
        borderRadius: '24px',
        padding: '24px',
        boxShadow: '0 20px 50px rgba(15, 38, 70, 0.15)',
        maxWidth: '480px',
        width: '90%',
        zIndex: 1101
      }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            border: 0,
            background: 'none',
            cursor: 'pointer',
            color: '#7c8ea3',
            display: 'grid',
            placeItems: 'center'
          }}
          aria-label="Close modal"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        {title && <h3 style={{ margin: '0 0 16px', color: '#19468d' }}>{title}</h3>}
        {children}
      </div>
    </div>
  );
}
