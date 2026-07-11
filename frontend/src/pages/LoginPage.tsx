import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../api/auth';
import { ApiError } from '../api/client';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login.mutateAsync({ email, password });
      navigate('/');
    } catch {
      // error is surfaced via login.error below
    }
  }

  return (
    <div className="auth-page">
      <h1>Log in</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {login.isError && (
          <p className="form-error">
            {login.error instanceof ApiError ? login.error.message : 'Login failed'}
          </p>
        )}
        <button type="submit" disabled={login.isPending}>
          {login.isPending ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <p>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}
