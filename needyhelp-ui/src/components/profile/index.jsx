import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  HiArrowLeft, HiOutlineUser, HiOutlineLockClosed, HiOutlineCheckBadge,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { TN_DISTRICTS } from '../../utils/tn-districts';
import PasswordField from '../common/password-field';
import Splash from '../common/splash';
import './index.scss';

const ROLES = [
  { value: 'donor',   label: 'Donor — I want to help' },
  { value: 'student', label: 'Student / Family — I need help' },
  { value: 'teacher', label: 'Teacher / NGO — I post on behalf of others' },
];

const PASSWORD_RX = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

const Profile = () => {
  const { user, updateProfile, changePassword, loading } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const tab = params.get('tab') === 'security' ? 'security' : 'profile';

  if (loading) return <Splash label="Loading your profile…" />;
  if (!user)  return <div className="profile-page"><div className="loading">Not signed in.</div></div>;

  return (
    <div className="profile-page">
      <header className="p-header">
        <Link to="/dashboard" className="back-btn"><HiArrowLeft /> Back</Link>
        <h1>Your account</h1>
      </header>

      <div className="p-shell">
        <aside className="p-tabs">
          <button
            className={tab === 'profile' ? 'active' : ''}
            onClick={() => navigate('/profile')}
          >
            <HiOutlineUser /> Profile
          </button>
          <button
            className={tab === 'security' ? 'active' : ''}
            onClick={() => navigate('/profile?tab=security')}
          >
            <HiOutlineLockClosed /> Security
          </button>
        </aside>

        <section className="p-content">
          {tab === 'profile'
            ? <ProfileForm user={user} updateProfile={updateProfile} />
            : <SecurityForm changePassword={changePassword} />}
        </section>
      </div>
    </div>
  );
};

const ProfileForm = ({ user, updateProfile }) => {
  const [form, setForm] = useState({
    username: user.username || '',
    role: user.role || 'donor',
    phone: user.phone || '',
    district: user.district || '',
    pincode: user.pincode || '',
    language: user.language || 'en',
    bio: user.bio || '',
    avatarUrl: user.avatarUrl || '',
  });
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setForm({
      username: user.username || '',
      role: user.role || 'donor',
      phone: user.phone || '',
      district: user.district || '',
      pincode: user.pincode || '',
      language: user.language || 'en',
      bio: user.bio || '',
      avatarUrl: user.avatarUrl || '',
    });
  }, [user]);

  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Required';
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) e.pincode = '6-digit pincode';
    if (form.phone && !/^[+]?[\d\s-]{8,15}$/.test(form.phone)) e.phone = 'Invalid phone';
    if (form.bio.length > 500) e.bio = 'Max 500 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setPending(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Update failed');
    } finally {
      setPending(false);
    }
  };

  return (
    <form className="p-form" onSubmit={onSubmit} noValidate>
      <div className="card-head">
        <h2>Profile</h2>
        <p>How others see you and how we match you with relevant requests.</p>
      </div>

      <div className="row">
        <label>
          <span>Email</span>
          <input value={user.emailId} disabled />
          <small>Email can't be changed.</small>
        </label>
        <label>
          <span>Verified</span>
          <input
            value={user.verified ? 'Yes' : 'Pending review'}
            disabled
          />
          {user.role === 'teacher' && !user.verified && (
            <small className="warn">Teachers need admin verification before posting.</small>
          )}
        </label>
      </div>

      <label>
        <span>Display name</span>
        <input
          value={form.username}
          onChange={onChange('username')}
          aria-invalid={!!errors.username}
        />
        {errors.username && <small className="err">{errors.username}</small>}
      </label>

      <label>
        <span>I am a…</span>
        <select value={form.role} onChange={onChange('role')} disabled={user.role === 'admin'}>
          {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          {user.role === 'admin' && <option value="admin">Admin</option>}
        </select>
        {form.role === 'teacher' && form.role !== user.role && (
          <small className="warn">Switching to teacher will require admin re-verification.</small>
        )}
      </label>

      <div className="row">
        <label>
          <span>Phone</span>
          <input
            value={form.phone}
            onChange={onChange('phone')}
            placeholder="+91 9XXXXXXXXX"
            aria-invalid={!!errors.phone}
          />
          {errors.phone && <small className="err">{errors.phone}</small>}
        </label>
        <label>
          <span>Language</span>
          <select value={form.language} onChange={onChange('language')}>
            <option value="en">English</option>
            <option value="ta">தமிழ்</option>
          </select>
        </label>
      </div>

      <div className="row">
        <label>
          <span>District</span>
          <select value={form.district} onChange={onChange('district')}>
            <option value="">Select your district</option>
            {TN_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <label>
          <span>Pincode</span>
          <input
            value={form.pincode}
            onChange={onChange('pincode')}
            inputMode="numeric"
            maxLength={6}
            placeholder="6-digit"
            aria-invalid={!!errors.pincode}
          />
          {errors.pincode && <small className="err">{errors.pincode}</small>}
        </label>
      </div>

      <label>
        <span>Avatar URL</span>
        <input
          value={form.avatarUrl}
          onChange={onChange('avatarUrl')}
          placeholder="https://…"
        />
      </label>

      <label>
        <span>About you <em>({form.bio.length}/500)</em></span>
        <textarea
          rows={4}
          value={form.bio}
          onChange={onChange('bio')}
          aria-invalid={!!errors.bio}
        />
        {errors.bio && <small className="err">{errors.bio}</small>}
      </label>

      <div className="actions">
        <button className="btn-primary" disabled={pending} type="submit">
          {pending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
};

const SecurityForm = ({ changePassword }) => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();

  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = 'Required';
    if (!PASSWORD_RX.test(form.newPassword)) {
      e.newPassword = 'Min 8 chars with upper, lower, number & symbol';
    }
    if (form.newPassword !== form.confirm) e.confirm = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setPending(true);
    try {
      await changePassword(form.currentPassword, form.newPassword);
      toast.success('Password updated. Please sign in again.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Could not change password');
    } finally {
      setPending(false);
    }
  };

  return (
    <form className="p-form" onSubmit={onSubmit} noValidate>
      <div className="card-head">
        <h2>Security</h2>
        <p>Change your password. You'll be signed out everywhere.</p>
      </div>

      <label>
        <span>Current password</span>
        <PasswordField
          id="current-password"
          value={form.currentPassword}
          onChange={onChange('currentPassword')}
          autoComplete="current-password"
          invalid={!!errors.currentPassword}
        />
        {errors.currentPassword && <small className="err">{errors.currentPassword}</small>}
      </label>

      <label>
        <span>New password</span>
        <PasswordField
          id="new-password"
          value={form.newPassword}
          onChange={onChange('newPassword')}
          autoComplete="new-password"
          invalid={!!errors.newPassword}
        />
        {errors.newPassword && <small className="err">{errors.newPassword}</small>}
      </label>

      <label>
        <span>Confirm new password</span>
        <PasswordField
          id="confirm-password"
          value={form.confirm}
          onChange={onChange('confirm')}
          autoComplete="new-password"
          invalid={!!errors.confirm}
        />
        {errors.confirm && <small className="err">{errors.confirm}</small>}
      </label>

      <div className="actions">
        <button className="btn-primary" disabled={pending} type="submit">
          {pending ? 'Updating…' : 'Change password'}
        </button>
      </div>
    </form>
  );
};

export default Profile;
