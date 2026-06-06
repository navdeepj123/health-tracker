import React from 'react';
import Navbar from './Navbar';

interface Props { children: React.ReactNode; title?: string; }

const PageLayout: React.FC<Props> = ({ children, title }) => (
  <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
    <Navbar />
    <div style={{ marginLeft: 220, paddingTop: 60 }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 24px' }}>
        {title && <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: 'var(--text)' }}>{title}</h1>}
        {children}
      </div>
    </div>
    <style>{`
      @media (max-width: 768px) {
        .page-main { margin-left: 0 !important; }
        nav[style] { display: none !important; }
        header button[style*="none"] { display: flex !important; }
      }
    `}</style>
  </div>
);

export default PageLayout;
