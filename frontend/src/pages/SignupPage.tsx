import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSignup } from '../api/auth';
import { ApiError } from '../api/client';

export function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const signup = useSignup();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await signup.mutateAsync({ email, password });
      setSuccess(true);
    } catch {
      // error is surfaced via signup.error below
    }
  }

  if (success) {
    return (
      <div className="auth-page">
        <h1>Account created</h1>
        <p>You can now log in.</p>
        <Link to="/login">Go to login</Link>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <h1>Sign up</h1>
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
            minLength={8}
            required
          />
        </label>
        {signup.isError && (
          <p className="form-error">
            {signup.error instanceof ApiError ? signup.error.message : 'Signup failed'}
          </p>
        )}
        <button type="submit" disabled={signup.isPending}>
          {signup.isPending ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
