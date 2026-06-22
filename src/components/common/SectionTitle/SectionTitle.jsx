import React from 'react';

export default function SectionTitle({ icon, text }) {
  return (
    <div className="section-title">
      {icon && (
        <span className="section-title__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <div className="section-title__text">{text}</div>
    </div>
  );
}
