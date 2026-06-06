import React, { useEffect, useState, useRef } from 'react';
import axios from '../api/axios';
import PageLayout from '../components/PageLayout';
import { toastBus } from '../utils/toastBus';
import { validateNumber } from '../utils/validation';
import { estimateCalories } from '../utils/presets';

const TYPES = ['cardio', 'strength', 'hiit', 'yoga', 'flexibility', 'sports', 'other'];
const TYPE_ICONS: Record<string, string> = { cardio: '🏃', strength: '💪', hiit: '⚡', yoga: '🧘', flexibility: '🤸', sports: '⚽', other: '🏅' };

const Workout = () => {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', type: 'cardio', duration: '', calories: '', notes: '' });
  const [errors, setErrors] = useState({ title: '', duration: '', calories: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalCal, setTotalCal] = useState(0);
  const [filter, setFilter] = useState('all');
  const [timerOn, setTimerOn] = useState(false);
  const [timerSec, setTimerSec] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch = async () => {
    try {
      const [list, stats] = await Promise.all([axios.get('/workouts/all'), axios.get('/workouts/stats')]);
      setWorkouts(list.data);
      setTotalCal(stats.data.totalCaloriesBurned);
    } catch { toastBus.push('Failed to load workouts', 'error'); }
  };

  useEffect(() => { fetch(); }, []);

  // Workout timer
  useEffect(() => {
    if (timerOn) {
      timerRef.current = setInterval(() => setTimerSec((s) => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerOn]);

  const stopTimer = () => {
    setTimerOn(false);
    const mins = Math.floor(timerSec / 60);
    if (mins > 0) {
      setForm((f) => ({ ...f, duration: String(mins), calories: String(estimateCalories(f.type, mins)) }));
      toastBus.push(`Timer stopped: ${mins} minutes logged`, 'info');
    }
    setTimerSec(0);
  };

  const formatTimer = () => `${String(Math.floor(timerSec / 60)).padStart(2, '0')}:${String(timerSec % 60).padStart(2, '0')}`;

  const autoEstimate = (type: string, dur: string) => {
    if (dur && Number(dur) > 0) setForm((f) => ({ ...f, calories: String(estimateCalories(type, Number(dur))) }));
  };

  const validate = () => {
    const e = {
      title: !form.title ? 'Title is required' : '',
      duration: validateNumber(form.duration, 'Duration'),
      calories: validateNumber(form.calories, 'Calories'),
    };
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const payload = { title: form.title, type: form.type, duration: Number(form.duration), calories: Number(form.calories), notes: form.notes };
    try {
      if (editingId) {
        await axios.put(`/workouts/${editingId}`, payload);
        toastBus.push('Workout updated ✅', 'success');
      } else {
        await axios.post('/workouts', payload);
        toastBus.push('Workout added 🏋️', 'success');
      }
      setForm({ title: '', type: 'cardio', duration: '', calories: '', notes: '' });
      setEditingId(null); setShowForm(false);
      fetch();
    } catch (err: any) {
      toastBus.push(err.response?.data?.message || 'Error saving workout', 'error');
    } finally { setLoading(false); }
  };

  const handleEdit = (w: any) => {
    setForm({ title: w.title, type: w.type, duration: String(w.duration), calories: String(w.calories), notes: w.notes || '' });
    setEditingId(w._id); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this workout?')) return;
    try { await axios.delete(`/workouts/${id}`); toastBus.push('Workout deleted', 'info'); fetch(); }
    catch { toastBus.push('Failed to delete', 'error'); }
  };

  const filtered = filter === 'all' ? workouts : workouts.filter((w) => w.type === filter);
  const todayStr = new Date().toDateString();
  const todayWorkouts = workouts.filter((w) => new Date(w.date).toDateString() === todayStr);

  return (
    <PageLayout title="🏋️ Workouts">
      {/* Summary row */}
      <div style={s.summaryRow}>
        <div style={s.summaryCard}>
          <p style={s.sumLabel}>Today's Calories Burned</p>
          <p style={s.sumValue}>{totalCal} <span style={s.sumUnit}>kcal</span></p>
        </div>
        <div style={s.summaryCard}>
          <p style={s.sumLabel}>Today's Sessions</p>
          <p style={s.sumValue}>{todayWorkouts.length}</p>
        </div>
        <div style={s.summaryCard}>
          <p style={s.sumLabel}>Total Duration Today</p>
          <p style={s.sumValue}>{todayWorkouts.reduce((s, w) => s + w.duration, 0)} <span style={s.sumUnit}>mins</span></p>
        </div>
        {/* Workout timer */}
        <div style={{ ...s.summaryCard, background: timerOn ? '#fef2f2' : '#f0fdf4' }}>
          <p style={s.sumLabel}>⏱ Workout Timer</p>
          <p style={{ ...s.sumValue, color: timerOn ? '#ef4444' : '#16a34a', fontFamily: 'monospace' }}>{formatTimer()}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button style={{ ...s.timerBtn, background: timerOn ? '#ef4444' : '#16a34a' }} onClick={() => timerOn ? stopTimer() : setTimerOn(true)}>
              {timerOn ? '⏹ Stop' : '▶ Start'}
            </button>
            {!timerOn && timerSec > 0 && <button style={{ ...s.timerBtn, background: '#94a3b8' }} onClick={() => setTimerSec(0)}>Reset</button>}
          </div>
        </div>
      </div>

      <button style={s.addBtn} onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ title: '', type: 'cardio', duration: '', calories: '', notes: '' }); }}>
        {showForm && !editingId ? '✕ Cancel' : '+ Add Workout'}
      </button>

      {/* Form */}
      {showForm && (
        <div style={s.formCard}>
          <h3 style={s.formTitle}>{editingId ? '✏️ Edit Workout' : '➕ New Workout'}</h3>
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.formRow}>
              <div style={s.fGroup}>
                <label style={s.label}>Workout Title *</label>
                <input style={{ ...s.input, ...(errors.title ? s.inputErr : {}) }} placeholder="e.g. Morning Run" value={form.title} onChange={(e) => { setForm({ ...form, title: e.target.value }); setErrors({ ...errors, title: '' }); }} />
                {errors.title && <p style={s.err}>{errors.title}</p>}
              </div>
              <div style={s.fGroup}>
                <label style={s.label}>Type *</label>
                <select style={s.input} value={form.type} onChange={(e) => { const t = e.target.value; setForm({ ...form, type: t }); autoEstimate(t, form.duration); }}>
                  {TYPES.map((t) => <option key={t} value={t}>{TYPE_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div style={s.formRow}>
              <div style={s.fGroup}>
                <label style={s.label}>Duration (mins) *</label>
                <input style={{ ...s.input, ...(errors.duration ? s.inputErr : {}) }} type="number" placeholder="30" value={form.duration}
                  onChange={(e) => { setForm({ ...form, duration: e.target.value }); setErrors({ ...errors, duration: '' }); autoEstimate(form.type, e.target.value); }} />
                {errors.duration && <p style={s.err}>{errors.duration}</p>}
              </div>
              <div style={s.fGroup}>
                <label style={s.label}>Calories Burned * <span style={s.autoNote}>(auto-estimated)</span></label>
                <input style={{ ...s.input, ...(errors.calories ? s.inputErr : {}) }} type="number" placeholder="250" value={form.calories}
                  onChange={(e) => { setForm({ ...form, calories: e.target.value }); setErrors({ ...errors, calories: '' }); }} />
                {errors.calories && <p style={s.err}>{errors.calories}</p>}
              </div>
            </div>
            <div style={s.fGroup}>
              <label style={s.label}>Notes (optional)</label>
              <input style={s.input} placeholder="Any notes about this session..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <button style={s.submitBtn} type="submit" disabled={loading}>{loading ? 'Saving...' : editingId ? 'Update Workout' : 'Save Workout'}</button>
          </form>
        </div>
      )}

      {/* Filter */}
      <div style={s.filters}>
        {['all', ...TYPES].map((t) => (
          <button key={t} style={{ ...s.filterBtn, ...(filter === t ? s.filterActive : {}) }} onClick={() => setFilter(t)}>
            {t === 'all' ? '📋 All' : `${TYPE_ICONS[t]} ${t.charAt(0).toUpperCase() + t.slice(1)}`}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={s.empty}><p style={{ fontSize: 48 }}>🏋️</p><p>No workouts found. Add your first one!</p></div>
      ) : filtered.map((w) => (
        <div key={w._id} style={s.card}>
          <div style={{ ...s.typeIcon, background: '#fef2f2' }}>{TYPE_ICONS[w.type] || '🏅'}</div>
          <div style={{ flex: 1 }}>
            <p style={s.cardTitle}>{w.title}</p>
            <p style={s.cardSub}>{w.type} • {w.duration} mins • {new Date(w.date).toLocaleDateString()}</p>
            {w.notes && <p style={s.notes}>{w.notes}</p>}
          </div>
          <div style={s.cardRight}>
            <span style={s.calBadge}>{w.calories} cal</span>
            <button style={s.iconBtn} onClick={() => handleEdit(w)} title="Edit">✏️</button>
            <button style={s.iconBtn} onClick={() => handleDelete(w._id)} title="Delete">🗑️</button>
          </div>
        </div>
      ))}
    </PageLayout>
  );
};

const s: Record<string, React.CSSProperties> = {
  summaryRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 },
  summaryCard: { background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  sumLabel: { fontSize: 12, color: '#64748b', fontWeight: 500, marginBottom: 6 },
  sumValue: { fontSize: 26, fontWeight: 700, color: '#1e293b', lineHeight: 1 },
  sumUnit: { fontSize: 14, fontWeight: 400, color: '#64748b' },
  timerBtn: { padding: '5px 12px', borderRadius: 7, border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  addBtn: { padding: '11px 22px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #16a34a, #14532d)', color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 16, cursor: 'pointer' },
  formCard: { background: '#fff', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  formTitle: { fontSize: 16, fontWeight: 700, marginBottom: 18 },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  fGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  autoNote: { fontSize: 11, color: '#94a3b8', fontWeight: 400 },
  input: { padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, background: '#f8fafc' },
  inputErr: { borderColor: '#ef4444', background: '#fef2f2' },
  err: { fontSize: 12, color: '#ef4444' },
  submitBtn: { padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #16a34a, #14532d)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  filters: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  filterBtn: { padding: '7px 14px', borderRadius: 20, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 500, color: '#64748b', cursor: 'pointer' },
  filterActive: { background: '#f0fdf4', borderColor: '#16a34a', color: '#16a34a', fontWeight: 600 },
  card: { background: '#fff', borderRadius: 14, padding: '16px 20px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  typeIcon: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 },
  cardTitle: { fontSize: 15, fontWeight: 600, marginBottom: 3 },
  cardSub: { fontSize: 13, color: '#94a3b8', textTransform: 'capitalize' },
  notes: { fontSize: 12, color: '#64748b', marginTop: 4, fontStyle: 'italic' },
  cardRight: { display: 'flex', alignItems: 'center', gap: 8 },
  calBadge: { background: '#fef2f2', color: '#ef4444', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' },
  iconBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: 4 },
  empty: { textAlign: 'center', padding: '48px 0', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
};

export default Workout;
