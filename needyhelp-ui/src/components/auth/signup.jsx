import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import { HiHeart } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import './auth.scss';
import CustomButton from '../common/custom-button';
import PasswordField from '../common/password-field';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../api/client';

const PASSWORD_RULE = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', emailId: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.username || form.username.trim().length < 2) e.username = 'Enter your name';
    if (!form.emailId) e.emailId = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailId)) e.emailId = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (!PASSWORD_RULE.test(form.password)) {
      e.password = 'Min 8 chars with upper, lower, number & symbol';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setServerError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      await signup(form.username.trim(), form.emailId, form.password);
      toast.success('Account created. Welcome!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error || 'Signup failed. Please try again.';
      setServerError(typeof msg === 'string' ? msg : 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand"><HiHeart /> needyHelp</div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Join a community helping people in need.</p>

        <form className="form" onSubmit={onSubmit} noValidate>
          {serverError && <div className="form-error" role="alert">{serverError}</div>}

          <div className="field">
            <label htmlFor="username">Name</label>
            <input
              id="username"
              type="text"
              autoComplete="name"
              placeholder="Jane Doe"
              value={form.username}
              onChange={update('username')}
              onBlur={validate}
              aria-invalid={!!errors.username}
            />
            {errors.username && <span className="field-error">{errors.username}</span>}
          </div>

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
            />
            {errors.emailId && <span className="field-error">{errors.emailId}</span>}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <PasswordField
              id="password"
              value={form.password}
              onChange={update('password')}
              onBlur={validate}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              invalid={!!errors.password}
            />
            {errors.password
              ? <span className="field-error">{errors.password}</span>
              : <span className="field-hint">Use upper & lower case, a number, and a symbol.</span>}
          </div>

          <CustomButton type="submit" fullWidth disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </CustomButton>
        </form>

        <div className="auth-divider">or</div>

        <a className="oauth-btn" href={`${API_BASE}/v1/user/auth/google`}>
          <FaGoogle /> Continue with Google
        </a>

        <div className="auth-footer">
          Already have an account?<Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
