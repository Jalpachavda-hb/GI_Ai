import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'OPD Report' },
    { path: '/about', label: 'About' },
    { path: '/services', label: 'Services' },
  ];

  return (
    <nav style={{
      display: 'flex',
      gap: '20px',
      margin: '0 0 20px',
      padding: '12px 24px',
      background: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 8px 20px rgba(15, 38, 70, 0.05)',
      border: '1px solid rgba(206, 222, 238, .5)',
      alignItems: 'center'
    }}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            style={{
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 700,
              color: isActive ? 'var(--btn-dark)' : 'var(--muted)',
              borderBottom: isActive ? '2px solid var(--btn-dark)' : '2px solid transparent',
              paddingBottom: '4px',
              transition: 'color 0.2s, border-color 0.2s'
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
