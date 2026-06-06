import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/workout',   label: 'Workouts',  icon: '🏋️' },
  { path: '/food',      label: 'Food',      icon: '🍽️' },
  { path: '/water',     label: 'Water',     icon: '💧' },
  { path: '/history',   label: 'History',   icon: '📊' },
  { path: '/profile',   label: 'Profile',   icon: '👤' },
];

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {/* Top bar */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <button style={s.menuBtn} onClick={() => setMenuOpen(!menuOpen)}>☰</button>
          <span style={s.brand} onClick={() => navigate('/dashboard')}>💚 HealthTracker</span>
        </div>
        <div style={s.headerRight}>
          <span style={s.userName}>👋 {user?.name}</span>
          <button style={s.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Desktop side nav */}
      <nav style={s.sidenav}>
        <div style={s.logoArea}>
          <div style={s.logoIcon}>💚</div>
          <div style={s.logoText}>HealthTracker</div>
        </div>
        <div style={s.navItems}>
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button key={item.path} style={{ ...s.navItem, ...(active ? s.navItemActive : {}) }}
                onClick={() => navigate(item.path)}>
                <span style={s.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
        <div style={s.sideFooter}>
          <div style={s.userChip}>
            <div style={s.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div style={s.chipName}>{user?.name}</div>
              <div style={s.chipEmail}>{user?.email}</div>
            </div>
          </div>
          <button style={s.sideLogout} onClick={handleLogout}>Sign out</button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div style={s.drawer}>
          <div style={s.drawerOverlay} onClick={() => setMenuOpen(false)} />
          <div style={s.drawerContent}>
            <div style={s.drawerHeader}>
              <span style={s.brand}>💚 HealthTracker</span>
              <button style={s.closeBtn} onClick={() => setMenuOpen(false)}>✕</button>
            </div>
            {NAV_ITEMS.map((item) => (
              <button key={item.path} style={s.drawerItem}
                onClick={() => { navigate(item.path); setMenuOpen(false); }}>
                <span>{item.icon}</span> {item.label}
              </button>
            ))}
            <button style={s.drawerLogout} onClick={handleLogout}>Sign Out</button>
          </div>
        </div>
      )}
    </>
  );
};

const s: Record<string, React.CSSProperties> = {
  header: { position: 'fixed', top: 0, left: 0, right: 0, height: 60, backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', zIndex: 200, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  menuBtn: { background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', display: 'none', padding: 4 },
  brand: { fontSize: 18, fontWeight: 700, cursor: 'pointer', color: '#16a34a' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
  userName: { fontSize: 14, color: '#64748b', fontWeight: 500 },
  logoutBtn: { backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500 },
  sidenav: { position: 'fixed', left: 0, top: 60, bottom: 0, width: 220, backgroundColor: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '16px 12px', zIndex: 100, overflowY: 'auto' },
  logoArea: { display: 'none' },
  navItems: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 },
  navItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: 'none', background: 'none', fontSize: 14, fontWeight: 500, color: '#475569', width: '100%', textAlign: 'left', cursor: 'pointer' },
  navItemActive: { backgroundColor: '#f0fdf4', color: '#16a34a', fontWeight: 600 },
  navIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  sideFooter: { borderTop: '1px solid #e2e8f0', paddingTop: 12, marginTop: 12 },
  userChip: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', marginBottom: 8 },
  avatar: { width: 34, height: 34, borderRadius: '50%', backgroundColor: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 },
  chipName: { fontSize: 13, fontWeight: 600, color: '#1e293b' },
  chipEmail: { fontSize: 11, color: '#94a3b8' },
  sideLogout: { width: '100%', padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'none', color: '#64748b', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  drawer: { position: 'fixed', inset: 0, zIndex: 500 },
  drawerOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  drawerContent: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 260, backgroundColor: '#fff', padding: 20, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' },
  drawerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  closeBtn: { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' },
  drawerItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, border: 'none', background: 'none', fontSize: 15, fontWeight: 500, color: '#1e293b', width: '100%', textAlign: 'left', cursor: 'pointer' },
  drawerLogout: { marginTop: 'auto', padding: '12px', borderRadius: 10, border: '1px solid #e2e8f0', background: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer' },
};

export default Navbar;
