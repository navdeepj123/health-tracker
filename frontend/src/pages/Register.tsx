import React, { useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { validateEmail, validatePassword, validateName } from '../utils/validation';
import { toastBus } from '../utils/toastBus';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirm: !form.confirm
        ? 'Please confirm your password'
        : form.password !== form.confirm
        ? 'Passwords do not match'
        : '',
    };
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  // Generic change handler — updates the right field and clears its error
  const set = (k: keyof typeof form) => (ev: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [k]: ev.target.value }));
    setErrors((prev) => ({ ...prev, [k]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await axios.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      login(res.data, res.data.token);
      toastBus.push(`Account created! Welcome, ${res.data.name} 🎉`, 'success');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed';
      toastBus.push(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fields are inlined directly — NOT in a sub-component defined inside this function.
  // Defining a component inside another component causes React to unmount/remount it
  // on every render (every keystroke), which resets focus after each character typed.
  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.hero}>
          <div style={s.heroIcon}>💚</div>
          <h1 style={s.heroTitle}>Start your health journey</h1>
          <p style={s.heroSub}>Track workouts, meals and hydration — all in one place.</p>
        </div>
      </div>

      <div style={s.right}>
        <div style={s.card}>
          <h2 style={s.title}>Create your account</h2>
          <p style={s.subtitle}>Free to use — no credit card needed</p>

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.group}>
              <label style={s.label}>Full name</label>
              <input
                style={{ ...s.input, ...(errors.name ? s.inputErr : {}) }}
                type="text"
                placeholder="Ramandeep Singh"
                value={form.name}
                onChange={set('name')}
                autoComplete="name"
              />
              {errors.name && <p style={s.err}>{errors.name}</p>}
            </div>

            <div style={s.group}>
              <label style={s.label}>Email address</label>
              <input
                style={{ ...s.input, ...(errors.email ? s.inputErr : {}) }}
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
              />
              {errors.email && <p style={s.err}>{errors.email}</p>}
            </div>

            <div style={s.group}>
              <label style={s.label}>Password</label>
              <input
                style={{ ...s.input, ...(errors.password ? s.inputErr : {}) }}
                type="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={set('password')}
                autoComplete="new-password"
              />
              {errors.password && <p style={s.err}>{errors.password}</p>}
            </div>

            <div style={s.group}>
              <label style={s.label}>Confirm password</label>
              <input
                style={{ ...s.input, ...(errors.confirm ? s.inputErr : {}) }}
                type="password"
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={set('confirm')}
                autoComplete="new-password"
              />
              {errors.confirm && <p style={s.err}>{errors.confirm}</p>}
            </div>

            <button
              style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={s.switchText}>
            Already have an account?{' '}
            <Link to="/login" style={s.link}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  page: { display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
  left: { flex: 1, background: 'linear-gradient(135deg, #14532d 0%, #16a34a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 },
  hero: { color: '#fff', maxWidth: 400 },
  heroIcon: { fontSize: 56, marginBottom: 16 },
  heroTitle: { fontSize: 36, fontWeight: 800, marginBottom: 16, lineHeight: 1.2 },
  heroSub: { fontSize: 17, opacity: 0.85, lineHeight: 1.6 },
  right: { width: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, backgroundColor: '#f8fafc', overflowY: 'auto' },
  card: { background: '#fff', borderRadius: 20, padding: 40, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  title: { fontSize: 26, fontWeight: 700, marginBottom: 6 },
  subtitle: { color: '#64748b', marginBottom: 28, fontSize: 15 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  group: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  input: { padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 15, background: '#f8fafc' },
  inputErr: { borderColor: '#ef4444', background: '#fef2f2' },
  err: { fontSize: 12, color: '#ef4444', marginTop: 2 },
  btn: { padding: '13px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #16a34a, #14532d)', color: '#fff', fontSize: 15, fontWeight: 600, marginTop: 4, cursor: 'pointer' },
  btnDisabled: { opacity: 0.7 },
  switchText: { textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748b' },
  link: { color: '#16a34a', fontWeight: 600 },
};

export default Register;
