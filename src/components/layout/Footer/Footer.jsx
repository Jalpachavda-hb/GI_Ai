import React from 'react';

export default function Footer() {
  return (
    <footer style={{ marginTop: '24px', textAlign: 'center', fontSize: '11px', color: 'var(--muted)' }}>
      &copy; {new Date().getFullYear()} Kaizen Hospital. All rights reserved.
    </footer>
  );
}
