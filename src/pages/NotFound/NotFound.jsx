import React from 'react';
import { Link } from 'react-router-dom';
import notFoundImg from '@/assets/images/404.png';

export default function NotFound() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      position: 'fixed',
      inset: 0,
      backgroundColor: '#f2f7ff',
      padding: '24px',
      boxSizing: 'border-box',
      zIndex: 1000
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxHeight: '75vh',
        overflow: 'hidden'
      }}>
        <img
          src={notFoundImg}
          alt="Page Not Found"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}
        />
      </div>
      
      <div style={{ marginTop: '24px', marginBottom: '24px' }}>
        <Link to="/" className="btn btn--primary" style={{ padding: '14px 32px', fontSize: '14px' }}>
          Go Back Home
        </Link>
      </div>
    </main>
  );
}
