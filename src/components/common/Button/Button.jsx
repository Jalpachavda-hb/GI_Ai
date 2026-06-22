import React from 'react';

export default function Button({ children, className = '', type = 'button', ...props }) {
  return (
    <button type={type} className={`btn ${className}`} {...props}>
      {children}
    </button>
  );
}
