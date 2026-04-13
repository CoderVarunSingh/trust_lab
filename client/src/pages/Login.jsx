import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeartbeat } from 'react-icons/fa';
import { login as loginApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginApi(form);
      loginUser(res.data);
      const dashMap = { patient: '/dashboard', lab: '/lab-dashboard', doctor: '/doctor-dashboard', hospital: '/hospital-dashboard' };
      navigate(dashMap[res.data.role] || '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  const fillDemo = (email) => setForm({ email, password: 'password123' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-primary-50/30 to-surface-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <Link to="/" className="inline-flex flex-col items-center gap-2 mb-6 group">
            <img src="/logo.png" alt="TrustLab Logo" className="h-16 w-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md" />
          </Link>
          <h1 className="font-display text-3xl font-bold text-surface-900">Welcome back</h1>
          <p className="text-surface-500 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-surface-200 p-8 animate-slide-up">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-surface-700 block mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" className="input-field" required />
            </div>
            <div>
              <label className="text-sm font-semibold text-surface-700 block mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" className="input-field" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-surface-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
