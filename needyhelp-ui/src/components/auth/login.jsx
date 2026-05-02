import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import { HiHeart } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import './auth.scss';
import CustomButton from '../common/custom-button';
import PasswordField from '../common/password-field';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../api/client';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const [form, setForm] = useState({ emailId: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.emailId) e.emailId = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailId)) e.emailId = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setServerError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      await login(form.emailId, form.password);
      toast.success('Welcome back');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      setServerError(typeof msg === 'string' ? msg : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand"><HiHeart /> needyHelp</div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to continue helping or finding help.</p>

        <form className="form" onSubmit={onSubmit} noValidate>
          {serverError && <div className="form-error" role="alert">{serverError}</div>}

          <div className="field">
            <label htmlFor="emailId">Email</label>
            <input
              id="emailId"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.emailId}
              onChange={update('emailId')}
              onBlur={validate}
              aria-invalid={!!errors.emailId}
              aria-describedby={errors.emailId ? 'emailId-err' : undefined}
            />
            {errors.emailId && <span id="emailId-err" className="field-error">{errors.emailId}</span>}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <PasswordField
              id="password"
              value={form.password}
              onChange={update('password')}
              onBlur={validate}
              autoComplete="current-password"
              invalid={!!errors.password}
              describedBy={errors.password ? 'password-err' : undefined}
            />
            {errors.password && <span id="password-err" className="field-error">{errors.password}</span>}
          </div>

          <CustomButton type="submit" fullWidth disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </CustomButton>
        </form>

        <div className="auth-divider">or</div>

        <a className="oauth-btn" href={`${API_BASE}/v1/user/auth/google`}>
          <FaGoogle /> Continue with Google
        </a>

        <div className="auth-footer">
          New here?<Link to="/signup">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
