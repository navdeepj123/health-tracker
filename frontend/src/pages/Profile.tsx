import React, { useState } from 'react';
import axios from '../api/axios';
import PageLayout from '../components/PageLayout';
import { useAuth } from '../context/AuthContext';
import { toastBus } from '../utils/toastBus';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    dailyCalorieGoal: String(user?.dailyCalorieGoal || 2000),
    dailyWaterGoal: String(user?.dailyWaterGoal || 2000),
    weight: String(user?.weight || ''),
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put('/auth/profile', {
        name: form.name,
        dailyCalorieGoal: Number(form.dailyCalorieGoal),
        dailyWaterGoal: Number(form.dailyWaterGoal),
        weight: form.weight ? Number(form.weight) : undefined,
      });
      updateUser(res.data);
      toastBus.push('Profile updated ✅', 'success');
    } catch (err: any) {
      toastBus.push(err.response?.data?.message || 'Update failed', 'error');
    } finally { setLoading(false); }
  };

  const set = (k: string) => (ev: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: ev.target.value });

  return (
    <PageLayout title="👤 Profile & Settings">
      <div style={s.layout}>
        {/* Avatar card */}
        <div style={s.avatarCard}>
          <div style={s.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <p style={s.userName}>{user?.name}</p>
          <p style={s.userEmail}>{user?.email}</p>
          <div style={s.goalRow}>
            <div style={s.goalItem}><span style={s.goalVal}>{user?.dailyCalorieGoal || 2000}</span><span style={s.goalLabel}>Daily Cal Goal</span></div>
            <div style={s.goalDivider} />
            <div style={s.goalItem}><span style={s.goalVal}>{user?.dailyWaterGoal || 2000}</span><span style={s.goalLabel}>Water Goal (ml)</span></div>
          </div>
        </div>

        {/* Edit form */}
        <div style={s.formCard}>
          <h3 style={s.cardTitle}>Edit Your Profile</h3>
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.fGroup}>
              <label style={s.label}>Full Name</label>
              <input style={s.input} value={form.name} onChange={set('name')} placeholder="Your name" />
            </div>
            <div style={s.twoCol}>
              <div style={s.fGroup}>
                <label style={s.label}>Daily Calorie Goal (kcal)</label>
                <input style={s.input} type="number" value={form.dailyCalorieGoal} onChange={set('dailyCalorieGoal')} placeholder="2000" />
                <p style={s.hint}>Recommended: 2000 kcal for average adults</p>
              </div>
              <div style={s.fGroup}>
                <label style={s.label}>Daily Water Goal (ml)</label>
                <input style={s.input} type="number" value={form.dailyWaterGoal} onChange={set('dailyWaterGoal')} placeholder="2000" />
                <p style={s.hint}>Recommended: 2000–3000 ml per day</p>
              </div>
            </div>
            <div style={s.fGroup}>
              <label style={s.label}>Weight (kg) — optional</label>
              <input style={s.input} type="number" value={form.weight} onChange={set('weight')} placeholder="e.g. 70" />
            </div>
            <button style={{ ...s.submitBtn, ...(loading ? { opacity: 0.7 } : {}) }} type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

const s: Record<string, React.CSSProperties> = {
  layout: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'start' },
  avatarCard: { background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', textAlign: 'center' },
  avatar: { width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #16a34a, #14532d)', color: '#fff', fontSize: 32, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' },
  userName: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#64748b', marginBottom: 20 },
  goalRow: { display: 'flex', justifyContent: 'space-around', padding: '16px 0', borderTop: '1px solid #f1f5f9' },
  goalItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  goalVal: { fontSize: 20, fontWeight: 700, color: '#16a34a' },
  goalLabel: { fontSize: 11, color: '#94a3b8', fontWeight: 500, textAlign: 'center' },
  goalDivider: { width: 1, background: '#e2e8f0' },
  formCard: { background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  cardTitle: { fontSize: 17, fontWeight: 700, marginBottom: 22 },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  fGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  hint: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  input: { padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, background: '#f8fafc' },
  submitBtn: { padding: '12px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #16a34a, #14532d)', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4 },
};

export default Profile;
