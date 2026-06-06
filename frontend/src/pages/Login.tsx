import React, { useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { validateEmail, validatePassword } from '../utils/validation';
import { toastBus } from '../utils/toastBus';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = { email: validateEmail(form.email), password: validatePassword(form.password) };
    setErrors(e);
    return !e.email && !e.password;
  };

  const set = (k: string) => (ev: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [k]: ev.target.value });
    setErrors({ ...errors, [k]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await axios.post('/auth/login', form);
      login(res.data, res.data.token);
      toastBus.push(`Welcome back, ${res.data.name}! 👋`, 'success');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      toastBus.push(msg, 'error');
      setErrors({ ...errors, password: msg });
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.hero}>
          <div style={s.heroIcon}>💚</div>
          <h1 style={s.heroTitle}>HealthTracker</h1>
          <p style={s.heroSub}>Track workouts, meals, and hydration — all in one place.</p>
          <div style={s.features}>
            {['🏋️ Log workouts & calories', '🍽️ Track macros & meals', '💧 Stay hydrated daily', '📊 View progress history'].map((f) => (
              <div key={f} style={s.feature}>{f}</div>
            ))}
          </div>
        </div>
      </div>
      <div style={s.right}>
        <div style={s.card}>
          <h2 style={s.title}>Welcome back</h2>
          <p style={s.subtitle}>Sign in to your account</p>
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.group}>
              <label style={s.label}>Email address</label>
              <input style={{ ...s.input, ...(errors.email ? s.inputErr : {}) }} type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
              {errors.email && <p style={s.err}>{errors.email}</p>}
            </div>
            <div style={s.group}>
              <label style={s.label}>Password</label>
              <input style={{ ...s.input, ...(errors.password ? s.inputErr : {}) }} type="password" placeholder="Your password" value={form.password} onChange={set('password')} />
              {errors.password && <p style={s.err}>{errors.password}</p>}
            </div>
            <button style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }} type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p style={s.switchText}>Don't have an account? <Link to="/register" style={s.link}>Create one free</Link></p>
        </div>
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  page: { display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
  left: { flex: 1, background: 'linear-gradient(135deg, #14532d 0%, #16a34a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 },
  hero: { color: '#fff', maxWidth: 420 },
  heroIcon: { fontSize: 56, marginBottom: 16 },
  heroTitle: { fontSize: 40, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.5px' },
  heroSub: { fontSize: 18, opacity: 0.85, marginBottom: 36, lineHeight: 1.6 },
  features: { display: 'flex', flexDirection: 'column', gap: 12 },
  feature: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, opacity: 0.9, background: 'rgba(255,255,255,0.12)', padding: '10px 16px', borderRadius: 10 },
  right: { width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, backgroundColor: '#f8fafc' },
  card: { background: '#fff', borderRadius: 20, padding: 40, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  title: { fontSize: 26, fontWeight: 700, marginBottom: 6 },
  subtitle: { color: '#64748b', marginBottom: 28, fontSize: 15 },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  group: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  input: { padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 15, background: '#f8fafc' },
  inputErr: { borderColor: '#ef4444', background: '#fef2f2' },
  err: { fontSize: 12, color: '#ef4444', marginTop: 2 },
  btn: { padding: '13px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #16a34a, #14532d)', color: '#fff', fontSize: 15, fontWeight: 600, marginTop: 4 },
  btnDisabled: { opacity: 0.7 },
  switchText: { textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748b' },
  link: { color: '#16a34a', fontWeight: 600 },
};

export default Login;
