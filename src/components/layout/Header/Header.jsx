import React from 'react';
import logo from '@/assets/images/logo.png';

export default function Header() {
  return (
    <div className="card__header">
      <div className="brand">
        <img src={logo} alt="Kaizen Hospital Logo" />
      </div>
    </div>
  );
}
