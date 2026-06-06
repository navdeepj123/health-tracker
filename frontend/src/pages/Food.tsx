import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import PageLayout from '../components/PageLayout';
import { toastBus } from '../utils/toastBus';
import { validateNumber } from '../utils/validation';
import { FOOD_PRESETS } from '../utils/presets';
import { useAuth } from '../context/AuthContext';

const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_ICONS: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };

const Food = () => {
  const { user } = useAuth();
  const [foods, setFoods] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '', mealType: 'breakfast' });
  const [errors, setErrors] = useState({ name: '', calories: '' });
  const [showForm, setShowForm] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalCaloriesConsumed: 0, protein: 0, carbs: 0, fat: 0 });

  const calorieGoal = user?.dailyCalorieGoal || 2000;

  const fetchFoods = async () => {
    try {
      const [list, st] = await Promise.all([axios.get('/food'), axios.get('/food/stats')]);
      setFoods(list.data);
      setStats({ totalCaloriesConsumed: st.data.totalCaloriesConsumed, protein: st.data.protein || 0, carbs: st.data.carbs || 0, fat: st.data.fat || 0 });
    } catch { toastBus.push('Failed to load food data', 'error'); }
  };

  useEffect(() => { fetchFoods(); }, []);

  const validate = () => {
    const e = { name: !form.name ? 'Food name is required' : '', calories: validateNumber(form.calories, 'Calories') };
    setErrors(e);
    return !e.name && !e.calories;
  };

  const resetForm = () => { setForm({ name: '', calories: '', protein: '', carbs: '', fat: '', mealType: 'breakfast' }); setEditingId(null); setShowForm(false); };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const payload = { name: form.name, calories: Number(form.calories), protein: Number(form.protein) || 0, carbs: Number(form.carbs) || 0, fat: Number(form.fat) || 0, mealType: form.mealType };
    try {
      if (editingId) { await axios.put(`/food/${editingId}`, payload); toastBus.push('Meal updated ✅', 'success'); }
      else { await axios.post('/food', payload); toastBus.push('Meal logged 🍽️', 'success'); }
      resetForm(); fetchFoods();
    } catch (err: any) { toastBus.push(err.response?.data?.message || 'Error saving meal', 'error'); }
    finally { setLoading(false); }
  };

  const handlePreset = (preset: typeof FOOD_PRESETS[0]) => {
    setForm({ name: preset.name, calories: String(preset.calories), protein: String(preset.protein), carbs: String(preset.carbs), fat: String(preset.fat), mealType: form.mealType });
    setShowPresets(false); setShowForm(true);
    toastBus.push(`${preset.emoji} ${preset.name} loaded — adjust if needed`, 'info');
  };

  const handleEdit = (f: any) => {
    setForm({ name: f.name, calories: String(f.calories), protein: String(f.protein || ''), carbs: String(f.carbs || ''), fat: String(f.fat || ''), mealType: f.mealType });
    setEditingId(f._id); setShowForm(true); setShowPresets(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this meal?')) return;
    try { await axios.delete(`/food/${id}`); toastBus.push('Meal deleted', 'info'); fetchFoods(); }
    catch { toastBus.push('Failed to delete', 'error'); }
  };

  const calPct = Math.min((stats.totalCaloriesConsumed / calorieGoal) * 100, 100);

  return (
    <PageLayout title="🍽️ Food Tracker">
      {/* Stats bar */}
      <div style={s.statsRow}>
        <div style={s.statCard}>
          <p style={s.statLabel}>Calories Today</p>
          <p style={s.statVal}>{stats.totalCaloriesConsumed} / {calorieGoal}</p>
          <div style={s.progWrap}><div style={{ ...s.progBar, width: `${calPct}%`, background: calPct > 90 ? '#ef4444' : '#16a34a' }} /></div>
        </div>
        {[{ label: 'Protein', val: stats.protein, color: '#8b5cf6', unit: 'g' }, { label: 'Carbs', val: stats.carbs, color: '#f97316', unit: 'g' }, { label: 'Fat', val: stats.fat, color: '#0ea5e9', unit: 'g' }].map((m) => (
          <div key={m.label} style={{ ...s.statCard, borderTop: `3px solid ${m.color}` }}>
            <p style={s.statLabel}>{m.label}</p>
            <p style={{ ...s.statVal, color: m.color }}>{m.val}{m.unit}</p>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <button style={s.addBtn} onClick={() => { setShowForm(!showForm); setShowPresets(false); if (showForm) resetForm(); }}>
          {showForm && !editingId ? '✕ Cancel' : '+ Add Meal'}
        </button>
        <button style={s.presetBtn} onClick={() => { setShowPresets(!showPresets); setShowForm(false); }}>
          {showPresets ? '✕ Close' : '⚡ Quick Add'}
        </button>
      </div>

      {/* Quick add presets */}
      {showPresets && (
        <div style={s.presetsCard}>
          <h3 style={s.presetsTitle}>⚡ Quick Add — Common Foods</h3>
          <div style={s.presetsGrid}>
            {FOOD_PRESETS.map((p) => (
              <button key={p.name} style={s.presetItem} onClick={() => handlePreset(p)}>
                <span style={{ fontSize: 24 }}>{p.emoji}</span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={s.presetName}>{p.name}</p>
                  <p style={s.presetCal}>{p.calories} kcal • P:{p.protein}g C:{p.carbs}g F:{p.fat}g</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add/edit form */}
      {showForm && (
        <div style={s.formCard}>
          <h3 style={s.formTitle}>{editingId ? '✏️ Edit Meal' : '➕ Log a Meal'}</h3>
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.formRow}>
              <div style={s.fGroup}>
                <label style={s.label}>Food Name *</label>
                <input style={{ ...s.input, ...(errors.name ? s.inputErr : {}) }} placeholder="e.g. Chicken Rice Bowl" value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: '' }); }} />
                {errors.name && <p style={s.err}>{errors.name}</p>}
              </div>
              <div style={s.fGroup}>
                <label style={s.label}>Meal Type</label>
                <select style={s.input} value={form.mealType} onChange={(e) => setForm({ ...form, mealType: e.target.value })}>
                  {MEALS.map((m) => <option key={m} value={m}>{MEAL_ICONS[m]} {m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div style={s.formRow4}>
              {[{ k: 'calories', label: 'Calories *', err: true }, { k: 'protein', label: 'Protein (g)' }, { k: 'carbs', label: 'Carbs (g)' }, { k: 'fat', label: 'Fat (g)' }].map(({ k, label, err }) => (
                <div key={k} style={s.fGroup}>
                  <label style={s.label}>{label}</label>
                  <input style={{ ...s.input, ...(err && (errors as any)[k] ? s.inputErr : {}) }} type="number" placeholder="0" value={(form as any)[k]}
                    onChange={(e) => { setForm({ ...form, [k]: e.target.value }); if (err) setErrors({ ...errors, [k]: '' }); }} />
                  {err && (errors as any)[k] && <p style={s.err}>{(errors as any)[k]}</p>}
                </div>
              ))}
            </div>
            <button style={s.submitBtn} type="submit" disabled={loading}>{loading ? 'Saving...' : editingId ? 'Update Meal' : 'Save Meal'}</button>
          </form>
        </div>
      )}

      {/* Meals by type */}
      {MEALS.map((type) => {
        const items = foods.filter((f) => f.mealType === type);
        if (!items.length) return null;
        const mealCals = items.reduce((s, f) => s + f.calories, 0);
        return (
          <div key={type} style={s.mealSection}>
            <div style={s.mealHeader}>
              <h3 style={s.mealTitle}>{MEAL_ICONS[type]} {type.charAt(0).toUpperCase() + type.slice(1)}</h3>
              <span style={s.mealCals}>{mealCals} kcal</span>
            </div>
            {items.map((f) => (
              <div key={f._id} style={s.foodRow}>
                <div style={{ flex: 1 }}>
                  <p style={s.foodName}>{f.name}</p>
                  <p style={s.foodMacros}>P: {f.protein}g • C: {f.carbs}g • F: {f.fat}g</p>
                </div>
                <span style={s.calBadge}>{f.calories} cal</span>
                <button style={s.iconBtn} onClick={() => handleEdit(f)}>✏️</button>
                <button style={s.iconBtn} onClick={() => handleDelete(f._id)}>🗑️</button>
              </div>
            ))}
          </div>
        );
      })}

      {foods.length === 0 && <div style={s.empty}><p style={{ fontSize: 48 }}>🍽️</p><p>No meals logged today. Use Quick Add or the form above!</p></div>}
    </PageLayout>
  );
};

const s: Record<string, React.CSSProperties> = {
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 20 },
  statCard: { background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  statLabel: { fontSize: 12, color: '#64748b', fontWeight: 500, marginBottom: 6 },
  statVal: { fontSize: 20, fontWeight: 700, marginBottom: 8 },
  progWrap: { background: '#f1f5f9', borderRadius: 6, height: 8, overflow: 'hidden' },
  progBar: { height: 8, borderRadius: 6, transition: 'width 0.5s ease' },
  addBtn: { padding: '10px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #16a34a, #14532d)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  presetBtn: { padding: '10px 20px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer' },
  presetsCard: { background: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  presetsTitle: { fontSize: 15, fontWeight: 700, marginBottom: 14 },
  presetsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 },
  presetItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', textAlign: 'left' },
  presetName: { fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 2 },
  presetCal: { fontSize: 11, color: '#94a3b8' },
  formCard: { background: '#fff', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  formTitle: { fontSize: 16, fontWeight: 700, marginBottom: 18 },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  formRow4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
  fGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  input: { padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, background: '#f8fafc' },
  inputErr: { borderColor: '#ef4444', background: '#fef2f2' },
  err: { fontSize: 12, color: '#ef4444' },
  submitBtn: { padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #16a34a, #14532d)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  mealSection: { background: '#fff', borderRadius: 16, padding: '16px 20px', marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  mealHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  mealTitle: { fontSize: 15, fontWeight: 700, textTransform: 'capitalize' },
  mealCals: { fontSize: 14, fontWeight: 600, color: '#f97316', background: '#fff7ed', padding: '3px 10px', borderRadius: 20 },
  foodRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #f8fafc' },
  foodName: { fontSize: 14, fontWeight: 600, marginBottom: 2 },
  foodMacros: { fontSize: 12, color: '#94a3b8' },
  calBadge: { background: '#fff7ed', color: '#f97316', padding: '3px 10px', borderRadius: 20, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' },
  iconBtn: { background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', padding: 4, flexShrink: 0 },
  empty: { textAlign: 'center', padding: '48px 0', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
};

export default Food;
