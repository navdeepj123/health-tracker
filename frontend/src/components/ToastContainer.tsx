import React, { useEffect, useState } from 'react';
import { toastBus, Toast } from '../utils/toastBus';

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(() => { const unsub = toastBus.subscribe(setToasts); return unsub; }, []);

  const colors: Record<Toast['type'], { bg: string; border: string }> = {
    success: { bg: '#f0fdf4', border: '#16a34a' },
    error:   { bg: '#fef2f2', border: '#ef4444' },
    info:    { bg: '#f0f9ff', border: '#0ea5e9' },
    warning: { bg: '#fffbeb', border: '#f59e0b' },
  };
  const icons: Record<Toast['type'], string> = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 340 }}>
      {toasts.map((t) => (
        <div key={t.id} onClick={() => toastBus.dismiss(t.id)}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: colors[t.type].bg, border: `1.5px solid ${colors[t.type].border}`, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#1e293b', animation: 'slideIn 0.2s ease' }}>
          <span style={{ fontSize: 18 }}>{icons[t.type]}</span>
          <span style={{ flex: 1 }}>{t.message}</span>
          <span style={{ color: '#94a3b8', fontSize: 18 }}>×</span>
        </div>
      ))}
      <style>{`@keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }`}</style>
    </div>
  );
};
export default ToastContainer;
