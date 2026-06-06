import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import PageLayout from '../components/PageLayout';
import { toastBus } from '../utils/toastBus';
import { validateNumber } from '../utils/validation';
import { useAuth } from '../context/AuthContext';

// Common amounts shown as quick-add buttons
const QUICK = [150, 250, 330, 500, 750];

const Water = () => {
  const { user } = useAuth();
  const [waters, setWaters] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [amtErr, setAmtErr] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const goal = user?.dailyWaterGoal || 2000;

  const fetchWater = async () => {
    try {
      const [list, stats] = await Promise.all([
        axios.get('/water'),
        axios.get('/water/stats'),
      ]);
      setWaters(list.data);
      setTotal(stats.data.totalWater);
    } catch {
      toastBus.push('Failed to load water data', 'error');
    }
  };

  useEffect(() => { fetchWater(); }, []);

  const addWater = async (ml: number) => {
    try {
      await axios.post('/water', { amount: ml });
      toastBus.push('+' + ml + 'ml added 💧', 'success');
      fetchWater();
    } catch (err: any) {
      toastBus.push(err.response?.data?.message || 'Error logging water', 'error');
    }
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const err = validateNumber(amount, 'Amount');
    if (err) { setAmtErr(err); return; }
    setLoading(true);
    try {
      await addWater(Number(amount));
      setAmount('');
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await axios.delete('/water/' + id);
      toastBus.push('Entry deleted', 'info');
      fetchWater();
    } catch {
      toastBus.push('Failed to delete', 'error');
    }
  };

  const pct = Math.min((total / goal) * 100, 100);
  const glasses = Math.floor(total / 250);
  const remaining = Math.max(goal - total, 0);

  return (
    <PageLayout title="💧 Water Tracker">
      <div style={s.summaryRow}>
        <div style={s.summaryCard}>
          <p style={s.sumLabel}>Today's Intake</p>
          <p style={{ ...s.sumVal, color: '#0ea5e9' }}>{total} <span style={s.sumUnit}>ml</span></p>
        </div>
        <div style={s.summaryCard}>
          <p style={s.sumLabel}>Daily Goal</p>
          <p style={s.sumVal}>{goal} <span style={s.sumUnit}>ml</span></p>
        </div>
        <div style={s.summaryCard}>
          <p style={s.sumLabel}>Glasses (250ml)</p>
          <p style={{ ...s.sumVal, color: '#0ea5e9' }}>{glasses}</p>
        </div>
        <div style={s.summaryCard}>
          <p style={s.sumLabel}>Remaining</p>
          <p style={{ ...s.sumVal, color: remaining === 0 ? '#16a34a' : '#f97316' }}>
            {remaining} <span style={s.sumUnit}>ml</span>
          </p>
        </div>
      </div>

      <div style={s.progressCard}>
        <div style={s.progressHeader}>
          <span style={s.progressLabel}>Progress toward {goal}ml goal</span>
          <span style={{ ...s.progressPct, color: pct >= 100 ? '#16a34a' : '#0ea5e9' }}>
            {pct.toFixed(0)}%
          </span>
        </div>
        <div style={s.progressTrack}>
          <div style={{ ...s.progressFill, width: pct + '%', background: pct >= 100 ? '#16a34a' : '#0ea5e9' }} />
        </div>
        {pct >= 100 && <p style={s.goalMet}>🎉 You have reached your daily water goal!</p>}
      </div>

      <div style={s.quickCard}>
        <h3 style={s.sectionTitle}>⚡ Quick Add</h3>
        <div style={s.quickRow}>
          {QUICK.map((ml) => (
            <button key={ml} style={s.quickBtn} onClick={() => addWater(ml)}>
              💧 {ml}ml
            </button>
          ))}
        </div>
        <button style={s.customBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Custom Amount'}
        </button>
        {showForm && (
          <form onSubmit={handleSubmit} style={s.customForm}>
            <input
              style={{ ...s.input, ...(amtErr ? s.inputErr : {}) }}
              type="number"
              placeholder="Enter amount in ml"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setAmtErr(''); }}
              autoFocus
            />
            {amtErr && <p style={s.err}>{amtErr}</p>}
            <button style={s.submitBtn} type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Water'}
            </button>
          </form>
        )}
      </div>

      <div style={s.logCard}>
        <h3 style={s.sectionTitle}>📋 Today's Log</h3>
        {waters.length === 0 ? (
          <div style={s.empty}>
            <p style={{ fontSize: 40 }}>💧</p>
            <p>No water logged yet. Use Quick Add to get started!</p>
          </div>
        ) : (
          <>
            {waters.map((w) => (
              <div key={w._id} style={s.logRow}>
                <div style={s.logIcon}>💧</div>
                <div style={{ flex: 1 }}>
                  <p style={s.logAmt}>{w.amount} ml</p>
                  <p style={s.logTime}>
                    {new Date(w.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button style={s.delBtn} onClick={() => handleDelete(w._id)}>🗑️</button>
              </div>
            ))}
            <div style={s.totalRow}>
              <span style={s.totalLabel}>Total today</span>
              <span style={s.totalVal}>{total} ml</span>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
};

const s: Record<string, React.CSSProperties> = {
  summaryRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 20 },
  summaryCard: { background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  sumLabel: { fontSize: 12, color: '#64748b', fontWeight: 500, marginBottom: 6 },
  sumVal: { fontSize: 26, fontWeight: 700, color: '#1e293b', lineHeight: 1 },
  sumUnit: { fontSize: 14, fontWeight: 400, color: '#94a3b8' },
  progressCard: { background: '#fff', borderRadius: 14, padding: '20px 22px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressLabel: { fontSize: 14, fontWeight: 500, color: '#374151' },
  progressPct: { fontSize: 18, fontWeight: 700 },
  progressTrack: { background: '#e0f2fe', borderRadius: 10, height: 16, overflow: 'hidden' },
  progressFill: { height: 16, borderRadius: 10, transition: 'width 0.6s ease' },
  goalMet: { marginTop: 10, fontSize: 14, fontWeight: 600, color: '#16a34a', textAlign: 'center' },
  quickCard: { background: '#fff', borderRadius: 14, padding: '20px 22px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  sectionTitle: { fontSize: 15, fontWeight: 700, marginBottom: 14 },
  quickRow: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 },
  quickBtn: { padding: '10px 18px', borderRadius: 10, border: '1.5px solid #bae6fd', background: '#f0f9ff', color: '#0369a1', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  customBtn: { padding: '9px 18px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 14, fontWeight: 500, color: '#374151', cursor: 'pointer' },
  customForm: { marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 },
  input: { padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 15, background: '#f8fafc' },
  inputErr: { borderColor: '#ef4444' },
  err: { fontSize: 12, color: '#ef4444' },
  submitBtn: { padding: '11px', borderRadius: 10, border: 'none', background: '#0ea5e9', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  logCard: { background: '#fff', borderRadius: 14, padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  logRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f8fafc' },
  logIcon: { width: 38, height: 38, borderRadius: 10, background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 },
  logAmt: { fontSize: 15, fontWeight: 600, color: '#0ea5e9' },
  logTime: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  delBtn: { background: 'none', border: 'none', fontSize: 17, cursor: 'pointer', padding: 4 },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0 0', marginTop: 4, borderTop: '2px solid #e2e8f0' },
  totalLabel: { fontSize: 14, fontWeight: 600, color: '#374151' },
  totalVal: { fontSize: 18, fontWeight: 700, color: '#0ea5e9' },
  empty: { textAlign: 'center', padding: '28px 0', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
};

export default Water;
