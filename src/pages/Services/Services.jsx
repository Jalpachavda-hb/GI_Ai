import React from 'react';

export default function Services() {
  return (
    <main className="page" style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div className="card" style={{ padding: '40px', minHeight: 'unset' }}>
        <div className="card__top-accent" aria-hidden="true"></div>
        <h2 style={{ color: 'var(--text)' }}>Services</h2>
        <p style={{ color: 'var(--muted)', lineHeight: '1.6' }}>
          We provide a range of advanced clinical services including:
        </p>
        <ul style={{ color: 'var(--text)', lineHeight: '1.8' }}>
          <li>Outpatient Department (OPD) Reporting</li>
          <li>Voice Dictation and Transcription</li>
          <li>Pre-filled Diagnostic Suggestion Trees</li>
          <li>PDF Clinical Report Exporting</li>
        </ul>
      </div>
    </main>
  );
}
