import { useState } from 'react';
import { MdLockOutline, MdPersonOutline } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onSuccess }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username.trim(), password);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Sign In</h1>
        <p>Log in to access admin features</p>
      </div>

      <div style={{ maxWidth: 400, margin: '0 auto' }}>
        <form onSubmit={handleSubmit} className="login-card">
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <MdPersonOutline className="form-icon" />
              <input
                className="form-input"
                style={{ paddingLeft: 34 }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <MdLockOutline className="form-icon" />
              <input
                className="form-input"
                style={{ paddingLeft: 34 }}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 14 }}>
            Demo accounts — admin / admin123 (admin), viewer / viewer123 (viewer)
          </p>
        </form>
      </div>
    </div>
  );
}
