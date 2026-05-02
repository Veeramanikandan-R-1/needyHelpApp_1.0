import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  HiHeart, HiOutlineSparkles, HiOutlineHandRaised,
  HiArrowRightOnRectangle, HiOutlineUser, HiOutlineCog6Tooth,
  HiOutlineCheckBadge, HiOutlineUsers, HiOutlineAcademicCap,
  HiOutlineHeart, HiOutlineClipboardDocumentList, HiOutlinePlusCircle,
  HiArrowRight,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import './index.scss';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ icon, label, value, hint }) => (
  <div className="stat-card">
    <div className="stat-icon">{icon}</div>
    <div className="stat-meta">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {hint && <span className="stat-hint">{hint}</span>}
    </div>
  </div>
);

const initialsOf = (name = '') =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('') || '?';

const AvatarMenu = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className="avatar-menu" ref={ref}>
      <button
        className="avatar-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        {user?.avatarUrl
          ? <img src={user.avatarUrl} alt="" />
          : <span className="initials">{initialsOf(user?.username)}</span>}
        <span className="who">
          <span className="name">{user?.username || 'You'}</span>
          <span className="role">
            {user?.role}
            {user?.verified && <HiOutlineCheckBadge title="Verified" />}
          </span>
        </span>
      </button>
      {open && (
        <div className="dropdown" role="menu">
          <button role="menuitem" onClick={() => { setOpen(false); navigate('/profile'); }}>
            <HiOutlineUser /> Profile
          </button>
          <button role="menuitem" onClick={() => { setOpen(false); navigate('/profile?tab=security'); }}>
            <HiOutlineCog6Tooth /> Security
          </button>
          {(user?.role === 'student' || (user?.role === 'teacher' && user?.verified)) && (
            <button role="menuitem" onClick={() => { setOpen(false); navigate('/sponsor/new'); }}>
              <HiOutlinePlusCircle /> {user?.role === 'student' ? 'Request a sponsor' : 'Post a request'}
            </button>
          )}
          <button role="menuitem" onClick={() => { setOpen(false); navigate('/sponsor/mine'); }}>
            <HiOutlineClipboardDocumentList /> My posts &amp; donations
          </button>
          {user?.role === 'admin' && (
            <>
              <button role="menuitem" onClick={() => { setOpen(false); navigate('/admin/users'); }}>
                <HiOutlineUsers /> Manage users
              </button>
              <button role="menuitem" onClick={() => { setOpen(false); navigate('/admin/sponsorships'); }}>
                <HiOutlineCheckBadge /> Sponsorship review
              </button>
            </>
          )}
          <hr />
          <button role="menuitem" className="danger" onClick={onLogout}>
            <HiArrowRightOnRectangle /> Sign out
          </button>
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/');
  };

  const incomplete = user && (!user.district || !user.phone);

  return (
    <div className="dashboard-page">
      <header className="dash-header">
        <Link to="/" className="brand"><HiHeart /> needyHelp</Link>
        <AvatarMenu user={user} onLogout={onLogout} />
      </header>

      <main className="dash-main">
        <div className="hello">
          <h1>Welcome back, {user?.username?.split(' ')[0] || 'friend'}<span className="dot">.</span></h1>
          <p>Here's what's happening in your community today.</p>
        </div>

        {incomplete && (
          <div className="banner">
            <div>
              <strong>Complete your profile</strong>
              <p>Add your district and phone so we can match you with nearby requests.</p>
            </div>
            <button className="banner-cta" onClick={() => navigate('/profile')}>
              Update profile
            </button>
          </div>
        )}

        <section className="stats">
          <StatCard icon={<HiOutlineHandRaised />} label="Open requests near you" value="—" hint="Coming soon" />
          <StatCard icon={<HiOutlineSparkles />} label="Donations made" value="0" />
          <StatCard icon={<HiHeart />} label="Lives touched" value="0" hint="Once you fulfill requests" />
        </section>

        <section className="quick-links">
          <h2>Browse</h2>
          <div className="qlinks-grid">
            <Link to="/sponsor" className="qlink">
              <div className="icon"><HiOutlineHeart /></div>
              <div>
                <strong>Sponsor a student</strong>
                <span>Find a verified request to fund</span>
              </div>
              <HiArrowRight aria-hidden="true" />
            </Link>
            <Link to="/scholarships" className="qlink">
              <div className="icon"><HiOutlineAcademicCap /></div>
              <div>
                <strong>Scholarship tracker</strong>
                <span>Govt &amp; private scholarships in TN</span>
              </div>
              <HiArrowRight aria-hidden="true" />
            </Link>
            <Link to="/sponsor/mine" className="qlink">
              <div className="icon"><HiOutlineClipboardDocumentList /></div>
              <div>
                <strong>My activity</strong>
                <span>Posts you've made &amp; donations</span>
              </div>
              <HiArrowRight aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;