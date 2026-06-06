import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import PageLayout from '../components/PageLayout';
import { toastBus } from '../utils/toastBus';

type Tab = 'workout' | 'food' | 'water';

const History = () => {
  const [data, setData] = useState<Record<Tab, any[]>>({ workout: [], food: [], water: [] });
  const [tab, setTab] = useState<Tab>('workout');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [w, f, wa] = await Promise.all([axios.get('/workouts/history'), axios.get('/food/history'), axios.get('/water/history')]);
        setData({ workout: w.data, food: f.data, water: wa.data });
      } catch { toastBus.push('Failed to load history', 'error'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const fmt = (id: any) => `${id.year}-${String(id.month).padStart(2, '0')}-${String(id.day).padStart(2, '0')}`;

  const tabs: { key: Tab; label: string; color: string }[] = [
    { key: 'workout', label: '🏋️ Workouts', color: '#ef4444' },
    { key: 'food', label: '🍽️ Food', color: '#f97316' },
    { key: 'water', label: '💧 Water', color: '#0ea5e9' },
  ];

  return (
    <PageLayout title="📊 History">
      <div style={s.tabs}>
        {tabs.map((t) => (
          <button key={t.key} style={{ ...s.tab, ...(tab === t.key ? { ...s.tabActive, borderColor: t.color, color: t.color, background: `${t.color}10` } : {}) }}
            onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {loading ? <div style={s.loading}>Loading history...</div> :
        data[tab].length === 0 ? <div style={s.empty}><p style={{ fontSize: 48 }}>📊</p><p>No history yet for this category</p></div> :
        data[tab].map((h, i) => (
          <div key={i} style={s.card}>
            <div style={s.dateRow}>
              <span style={s.date}>{fmt(h._id)}</span>
              {tab === 'workout' && <span style={{ ...s.chip, background: h.totalCalories >= 300 ? '#f0fdf4' : '#fff7ed', color: h.totalCalories >= 300 ? '#16a34a' : '#f97316' }}>{h.totalCalories >= 300 ? '✅ Goal Met' : '⚠️ Below Goal'}</span>}
              {tab === 'water' && <span style={{ ...s.chip, background: h.total >= 2000 ? '#f0fdf4' : '#fff7ed', color: h.total >= 2000 ? '#16a34a' : '#f97316' }}>{h.total >= 2000 ? '✅ Hydrated' : `⚠️ ${2000 - h.total}ml short`}</span>}
            </div>
            <div style={s.stats}>
              {tab === 'workout' && <>
                <Stat label="Calories" val={`${h.totalCalories} kcal`} color="#ef4444" />
                <Stat label="Duration" val={`${h.totalDuration} mins`} color="#f97316" />
                <Stat label="Sessions" val={h.count} color="#8b5cf6" />
              </>}
              {tab === 'food' && <>
                <Stat label="Calories" val={`${h.totalCalories} kcal`} color="#f97316" />
                <Stat label="Protein" val={`${h.totalProtein}g`} color="#8b5cf6" />
                <Stat label="Carbs" val={`${h.totalCarbs}g`} color="#0ea5e9" />
                <Stat label="Fat" val={`${h.totalFat}g`} color="#16a34a" />
                <Stat label="Meals" val={h.count} color="#64748b" />
              </>}
              {tab === 'water' && <>
                <Stat label="Total" val={`${h.total} ml`} color="#0ea5e9" />
                <Stat label="Glasses" val={Math.floor(h.total / 250)} color="#0ea5e9" />
                <Stat label="Entries" val={h.count} color="#64748b" />
              </>}
            </div>
          </div>
        ))
      }
    </PageLayout>
  );
};

const Stat = ({ label, val, color }: { label: string; val: any; color: string }) => (
  <div style={{ textAlign: 'center', minWidth: 80 }}>
    <p style={{ fontSize: 20, fontWeight: 700, color, marginBottom: 4 }}>{val}</p>
    <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{label}</p>
  </div>
);

const s: Record<string, React.CSSProperties> = {
  tabs: { display: 'flex', gap: 10, marginBottom: 24 },
  tab: { padding: '10px 20px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 14, fontWeight: 600, color: '#64748b', cursor: 'pointer' },
  tabActive: { fontWeight: 700 },
  loading: { textAlign: 'center', padding: 48, color: '#94a3b8' },
  empty: { textAlign: 'center', padding: '48px 0', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  card: { background: '#fff', borderRadius: 14, padding: '18px 22px', marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  dateRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  date: { fontSize: 15, fontWeight: 700, color: '#1e293b' },
  chip: { padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 },
  stats: { display: 'flex', gap: 20, flexWrap: 'wrap' },
};

export default History;
