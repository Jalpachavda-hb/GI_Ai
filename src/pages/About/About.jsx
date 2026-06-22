import React from 'react';

export default function About() {
  return (
    <main className="page" style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div className="card" style={{ padding: '40px', minHeight: 'unset' }}>
        <div className="card__top-accent" aria-hidden="true"></div>
        <h2 style={{ color: 'var(--text)' }}>About Kaizen Hospital</h2>
        <p style={{ color: 'var(--muted)', lineHeight: '1.6' }}>
          Kaizen Hospital is a state-of-the-art facility specializing in comprehensive clinical reporting, healthcare diagnostics, and advanced medical tools to support and optimize patient consultations.
        </p>
      </div>
    </main>
  );
}
