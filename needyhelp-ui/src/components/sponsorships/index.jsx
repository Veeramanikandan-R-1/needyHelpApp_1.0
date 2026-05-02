import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiArrowLeft, HiMagnifyingGlass, HiOutlineHeart, HiOutlineMapPin,
  HiOutlineUsers, HiArrowRight, HiOutlineCurrencyRupee,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { TN_DISTRICTS } from '../../utils/tn-districts';
import './sponsorships.scss';

const CATEGORIES = [
  { value: '', label: 'All needs' },
  { value: 'tuition_fee', label: 'Tuition fee' },
  { value: 'books', label: 'Books' },
  { value: 'uniform', label: 'Uniform' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'exam_fee', label: 'Exam fee' },
  { value: 'other', label: 'Other' },
];

const useDebounced = (value, ms = 300) => {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
};

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const SponsorCard = ({ p }) => {
  const pct = Math.min(100, Math.round((p.amountRaised / p.amountTarget) * 100));
  return (
    <Link to={`/sponsor/${p.id}`} className="sponsor-card">
      <div className="tag-row">
        <span className={`tag tag-${p.category}`}>{p.category.replace('_', ' ')}</span>
        <span className={`poster-pill poster-${p.postedByRole || 'teacher'}`}>
          {p.selfPosted ? 'Self request' : p.postedByRole === 'teacher' ? 'Teacher-posted' : 'Posted'}
        </span>
      </div>
      <h3>{p.title}</h3>
      <p className="for">For <strong>{p.studentName}</strong>{p.studentClass ? ` • ${p.studentClass}` : ''}</p>
      <p className="story">{p.story?.slice(0, 140)}{p.story?.length > 140 ? '…' : ''}</p>
      <div className="progress" aria-label={`${pct}% funded`}>
        <div className="bar"><span style={{ width: `${pct}%` }} /></div>
        <div className="row">
          <strong>{inr(p.amountRaised)} <span>raised</span></strong>
          <span>of {inr(p.amountTarget)}</span>
        </div>
      </div>
      <div className="meta">
        {p.district && <span><HiOutlineMapPin /> {p.district}</span>}
        <span><HiOutlineUsers /> {p.donationCount} {p.donationCount === 1 ? 'donor' : 'donors'}</span>
      </div>
      <span className="cta">View &amp; donate <HiArrowRight /></span>
    </Link>
  );
};

const Sponsorships = () => {
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [district, setDistrict] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ sponsorships: [], total: 0, limit: 12 });
  const [loading, setLoading] = useState(true);

  const dq = useDebounced(q, 300);
  useEffect(() => { setPage(1); }, [dq, category, district]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '12' });
    if (dq) params.set('q', dq);
    if (category) params.set('category', category);
    if (district) params.set('district', district);
    api.get(`/v1/sponsorships?${params.toString()}`)
      .then(({ data }) => { if (!cancelled) setData(data); })
      .catch((e) => toast.error(e.response?.data?.error || 'Failed to load'))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [dq, category, district, page]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(data.total / (data.limit || 12))),
    [data.total, data.limit]
  );

  const canPost = user && ((user.role === 'teacher' && user.verified) || user.role === 'student');

  return (
    <div className="sponsorships-page">
      <div className="shell">
        <Link to="/" className="back"><HiArrowLeft /> Home</Link>

        <header className="head">
          <span className="eyebrow"><HiOutlineHeart /> Sponsor a student</span>
          <h1>Help a student keep learning</h1>
          <p>Verified teachers post real student needs — books, fees, uniforms. Donate any amount, see exactly where it goes.</p>
          <div className="head-actions">
            {canPost && (
              <Link to="/sponsor/new" className="btn-primary">
                {user.role === 'student' ? 'Request a sponsor' : 'Post a request'}
              </Link>
            )}
            {user && (
              <Link to="/sponsor/mine" className="btn-ghost">My posts &amp; donations</Link>
            )}
            {!user && (
              <Link to="/login" className="btn-ghost">Sign in to donate</Link>
            )}
          </div>
        </header>

        <div className="filters">
          <label className="search">
            <HiMagnifyingGlass aria-hidden="true" />
            <input
              type="search"
              placeholder="Search posts…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search sponsorship posts"
            />
          </label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select value={district} onChange={(e) => setDistrict(e.target.value)} aria-label="Filter by district">
            <option value="">Any district</option>
            {TN_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="result-count">
          {loading ? 'Loading…' : `${data.total.toLocaleString()} ${data.total === 1 ? 'post' : 'posts'}`}
        </div>

        <section className="grid">
          {loading && Array.from({ length: 6 }).map((_, i) => <div key={i} className="skel" />)}
          {!loading && data.sponsorships.length === 0 && (
            <div className="empty">
              <HiOutlineHeart />
              <h3>No open requests right now</h3>
              <p>Check back soon — verified teachers post new requests every week.</p>
            </div>
          )}
          {!loading && data.sponsorships.map((p) => <SponsorCard key={p.id} p={p} />)}
        </section>

        {totalPages > 1 && (
          <nav className="pager" aria-label="Pagination">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</button>
          </nav>
        )}
      </div>
    </div>
  );
};

export default Sponsorships;
