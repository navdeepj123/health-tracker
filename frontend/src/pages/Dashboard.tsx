import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PageLayout from '../components/PageLayout';
import { toastBus } from '../utils/toastBus';
import { subscribeToPush, isPushEnabled, disablePush } from '../utils/pushNotifications';

interface Stats {
  totalCaloriesBurned: number;
  totalCaloriesConsumed: number;
  totalWater: number;
  protein: number;
  carbs: number;
  fat: number;
  weekly: { day: string; calories: number }[];
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalCaloriesBurned: 0, totalCaloriesConsumed: 0, totalWater: 0,
    protein: 0, carbs: 0, fat: 0, weekly: [],
  });
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const [recentFoods, setRecentFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // isPushEnabled reads localStorage so it stays correct after navigation
  const [pushOn, setPushOn] = useState(isPushEnabled);

  const calorieGoal = user?.dailyCalorieGoal || 2000;
  const waterGoal = user?.dailyWaterGoal || 2000;

  useEffect(() => {
    const load = async () => {
      try {
        const [wStats, fStats, waStats, workouts, foods] = await Promise.all([
          axios.get('/workouts/stats'),
          axios.get('/food/stats'),
          axios.get('/water/stats'),
          axios.get('/workouts'),
          axios.get('/food'),
        ]);
        setStats({
          totalCaloriesBurned: wStats.data.totalCaloriesBurned,
          totalCaloriesConsumed: fStats.data.totalCaloriesConsumed,
          totalWater: waStats.data.totalWater,
          protein: fStats.data.protein || 0,
          carbs: fStats.data.carbs || 0,
          fat: fStats.data.fat || 0,
          weekly: wStats.data.weekly || [],
        });
        setRecentWorkouts(workouts.data.slice(0, 3));
        setRecentFoods(foods.data.slice(0, 3));
      } catch (err: any) {
        if (err.response?.status !== 401) toastBus.push('Could not load some data', 'warning');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleNotificationToggle = async () => {
    // If already enabled, turn off
    if (pushOn) {
      disablePush();
      setPushOn(false);
      toastBus.push('Notifications disabled', 'info');
      return;
    }

    // Ask browser for permission
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      toastBus.push('Please allow notifications in your browser settings', 'warning');
      return;
    }

    const ok = await subscribeToPush();
    if (ok) {
      setPushOn(true);
      toastBus.push('Notifications enabled! You will be notified when you log activities and reach daily goals 🔔', 'success');
    } else {
      toastBus.push('Could not enable notifications. Please try again.', 'error');
    }
  };

  const waterPct = Math.min((stats.totalWater / waterGoal) * 100, 100);
  const calPct = Math.min((stats.totalCaloriesConsumed / calorieGoal) * 100, 100);
  const netCal = stats.totalCaloriesConsumed - stats.totalCaloriesBurned;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const maxWeekly = Math.max(...stats.weekly.map((d) => d.calories), 1);

  if (loading) return (
    <PageLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💚</div>
          <p style={{ color: '#64748b', fontSize: 16 }}>Loading your health data...</p>
        </div>
      </div>
    </PageLayout>
  );

  return (
    <PageLayout>
      {/* Greeting + notification toggle */}
      <div style={s.greetRow}>
        <div>
          <h2 style={s.greeting}>{greeting}, {user?.name}! 👋</h2>
          <p style={s.greetSub}>Here is your health snapshot for today</p>
        </div>
        <button style={pushOn ? s.pushBtnOn : s.pushBtn} onClick={handleNotificationToggle}>
          {pushOn ? '🔔 Notifications On' : '🔕 Enable Notifications'}
        </button>
      </div>

      {/* Four stat cards */}
      <div style={s.statsGrid}>
        {[
          { label: 'Calories Burned', value: stats.totalCaloriesBurned, unit: 'kcal', icon: '🔥', color: '#ef4444', bg: '#fef2f2' },
          { label: 'Calories Consumed', value: stats.totalCaloriesConsumed, unit: 'kcal', icon: '🍽️', color: '#f97316', bg: '#fff7ed' },
          { label: 'Water Intake', value: stats.totalWater, unit: 'ml', icon: '💧', color: '#0ea5e9', bg: '#f0f9ff' },
          { label: 'Net Calories', value: netCal, unit: 'kcal', icon: '⚖️', color: netCal > 500 ? '#ef4444' : '#16a34a', bg: netCal > 500 ? '#fef2f2' : '#f0fdf4' },
        ].map((c) => (
          <div key={c.label} style={{ ...s.statCard, background: c.bg, borderLeft: `4px solid ${c.color}` }}>
            <div style={s.statIcon}>{c.icon}</div>
            <div>
              <p style={s.statLabel}>{c.label}</p>
              <p style={{ ...s.statValue, color: c.color }}>
                {c.value.toLocaleString()} <span style={s.statUnit}>{c.unit}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Goal progress bars */}
      <div style={s.twoCol}>
        <div style={s.card}>
          <h3 style={s.cardTitle}>🍽️ Calorie Goal</h3>
          <div style={s.progressWrap}>
            <div style={{ ...s.progressBar, width: `${calPct}%`, background: calPct > 90 ? '#ef4444' : '#16a34a' }} />
          </div>
          <div style={s.progressLabels}>
            <span>{stats.totalCaloriesConsumed} kcal eaten</span>
            <span style={{ color: calPct > 90 ? '#ef4444' : '#64748b' }}>{calPct.toFixed(0)}% of {calorieGoal}</span>
          </div>
        </div>
        <div style={s.card}>
          <h3 style={s.cardTitle}>💧 Water Goal</h3>
          <div style={s.progressWrap}>
            <div style={{ ...s.progressBar, width: `${waterPct}%`, background: '#0ea5e9' }} />
          </div>
          <div style={s.progressLabels}>
            <span>{stats.totalWater} ml drunk</span>
            <span>{waterPct.toFixed(0)}% of {waterGoal} ml</span>
          </div>
        </div>
      </div>

      {/* Macros + weekly chart */}
      <div style={s.twoCol}>
        <div style={s.card}>
          <h3 style={s.cardTitle}>🧬 Today's Macros</h3>
          {[
            { label: 'Protein', val: stats.protein, color: '#8b5cf6', max: 150 },
            { label: 'Carbs', val: stats.carbs, color: '#f97316', max: 300 },
            { label: 'Fat', val: stats.fat, color: '#0ea5e9', max: 80 },
          ].map((m) => (
            <div key={m.label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
                <span>{m.label}</span>
                <span style={{ color: m.color }}>{m.val}g</span>
              </div>
              <div style={{ background: '#f1f5f9', borderRadius: 6, height: 8 }}>
                <div style={{ width: `${Math.min((m.val / m.max) * 100, 100)}%`, height: 8, borderRadius: 6, background: m.color, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          ))}
          {stats.protein === 0 && stats.carbs === 0 && (
            <p style={s.empty}>Log food to see your macros</p>
          )}
        </div>

        <div style={s.card}>
          <h3 style={s.cardTitle}>📈 Weekly Calories Burned</h3>
          <div style={s.barChart}>
            {stats.weekly.length > 0 ? stats.weekly.map((d, i) => (
              <div key={i} style={s.barGroup}>
                <div style={s.barWrap}>
                  <div style={{
                    ...s.bar,
                    height: `${(d.calories / maxWeekly) * 100}%`,
                    background: d.calories > 0 ? 'linear-gradient(to top, #16a34a, #4ade80)' : '#e2e8f0',
                  }} />
                </div>
                <span style={s.barLabel}>{d.day}</span>
                {d.calories > 0 && <span style={s.barVal}>{d.calories}</span>}
              </div>
            )) : <p style={s.empty}>Log workouts to see the chart</p>}
          </div>
        </div>
      </div>

      {/* Recent workouts + meals */}
      <div style={s.twoCol}>
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h3 style={s.cardTitle}>🏋️ Recent Workouts</h3>
            <button style={s.seeAll} onClick={() => navigate('/workout')}>See all →</button>
          </div>
          {recentWorkouts.length === 0 ? (
            <div style={s.emptyState}>
              <p style={{ fontSize: 32 }}>🏋️</p>
              <p>No workouts logged today</p>
              <button style={s.addBtn} onClick={() => navigate('/workout')}>Add Workout</button>
            </div>
          ) : recentWorkouts.map((w) => (
            <div key={w._id} style={s.listRow}>
              <div style={{ ...s.listDot, background: '#fef2f2' }}>🔥</div>
              <div style={{ flex: 1 }}>
                <p style={s.listTitle}>{w.title}</p>
                <p style={s.listSub}>{w.type} • {w.duration} mins</p>
              </div>
              <span style={{ ...s.badge, background: '#fef2f2', color: '#ef4444' }}>{w.calories} cal</span>
            </div>
          ))}
          {recentWorkouts.length > 0 && (
            <button style={s.addBtn} onClick={() => navigate('/workout')}>+ Add Workout</button>
          )}
        </div>

        <div style={s.card}>
          <div style={s.cardHeader}>
            <h3 style={s.cardTitle}>🍽️ Today's Meals</h3>
            <button style={s.seeAll} onClick={() => navigate('/food')}>See all →</button>
          </div>
          {recentFoods.length === 0 ? (
            <div style={s.emptyState}>
              <p style={{ fontSize: 32 }}>🍽️</p>
              <p>No meals logged today</p>
              <button style={{ ...s.addBtn, background: '#f97316' }} onClick={() => navigate('/food')}>Add Meal</button>
            </div>
          ) : recentFoods.map((f) => (
            <div key={f._id} style={s.listRow}>
              <div style={{ ...s.listDot, background: '#fff7ed' }}>🍽️</div>
              <div style={{ flex: 1 }}>
                <p style={s.listTitle}>{f.name}</p>
                <p style={s.listSub}>{f.mealType}</p>
              </div>
              <span style={{ ...s.badge, background: '#fff7ed', color: '#f97316' }}>{f.calories} cal</span>
            </div>
          ))}
          {recentFoods.length > 0 && (
            <button style={{ ...s.addBtn, background: '#f97316' }} onClick={() => navigate('/food')}>+ Add Meal</button>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

const s: Record<string, React.CSSProperties> = {
  greetRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 },
  greeting: { fontSize: 26, fontWeight: 700, marginBottom: 4 },
  greetSub: { color: '#64748b', fontSize: 15 },
  pushBtn: { padding: '9px 18px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer' },
  pushBtnOn: { padding: '9px 18px', borderRadius: 10, border: 'none', background: '#f0fdf4', fontSize: 13, fontWeight: 600, color: '#16a34a', cursor: 'pointer' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 },
  statCard: { borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  statIcon: { fontSize: 32 },
  statLabel: { fontSize: 12, color: '#64748b', fontWeight: 500, marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: 700, lineHeight: 1 },
  statUnit: { fontSize: 13, fontWeight: 400 },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 },
  card: { background: '#fff', borderRadius: 16, padding: 22, boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)' },
  cardTitle: { fontSize: 15, fontWeight: 700, marginBottom: 16 },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  seeAll: { background: 'none', border: 'none', color: '#16a34a', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  progressWrap: { background: '#f1f5f9', borderRadius: 8, height: 12, marginBottom: 8, overflow: 'hidden' },
  progressBar: { height: 12, borderRadius: 8, transition: 'width 0.6s ease' },
  progressLabels: { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b' },
  barChart: { display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 },
  barGroup: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  barWrap: { flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' },
  bar: { width: '100%', borderRadius: '4px 4px 0 0', minHeight: 4, transition: 'height 0.5s ease' },
  barLabel: { fontSize: 11, color: '#94a3b8', fontWeight: 500 },
  barVal: { fontSize: 10, color: '#16a34a', fontWeight: 600 },
  listRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f8fafc' },
  listDot: { width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 },
  listTitle: { fontSize: 14, fontWeight: 600, marginBottom: 2 },
  listSub: { fontSize: 12, color: '#94a3b8', textTransform: 'capitalize' },
  badge: { padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' },
  emptyState: { textAlign: 'center', padding: '16px 0', color: '#94a3b8', fontSize: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  addBtn: { marginTop: 12, padding: '8px 16px', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  empty: { color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '12px 0' },
};

export default Dashboard;
