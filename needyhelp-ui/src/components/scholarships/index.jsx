import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiArrowLeft, HiMagnifyingGlass, HiAcademicCap, HiOutlineCalendarDays,
  HiOutlineMapPin, HiArrowRight, HiOutlineCurrencyRupee,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../../api/client';
import { TN_DISTRICTS } from '../../utils/tn-districts';
import './scholarships.scss';

const CATEGORIES = [
  { value: '', label: 'All categories' },
  { value: 'merit', label: 'Merit' },
  { value: 'need', label: 'Need-based' },
  { value: 'caste', label: 'SC / ST / OBC' },
  { value: 'minority', label: 'Minority' },
  { value: 'sports', label: 'Sports' },
  { value: 'arts', label: 'Arts' },
  { value: 'research', label: 'Research' },
  { value: 'other', label: 'Other' },
];

const LEVELS = [
  { value: '', label: 'All levels' },
  { value: 'school', label: 'School (1–10)' },
  { value: 'higher_secondary', label: 'Higher secondary (11–12)' },
  { value: 'undergrad', label: 'Undergraduate' },
  { value: 'postgrad', label: 'Postgraduate' },
  { value: 'phd', label: 'PhD / research' },
  { value: 'any', label: 'Any level' },
];

const useDebounced = (value, ms = 300) => {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
};

const formatDeadline = (d) => {
  if (!d) return 'Rolling';
  const date = new Date(d);
  const now = new Date();
  const days = Math.ceil((date - now) / 86400000);
  const formatted = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  if (days < 0) return `Closed (${formatted})`;
  if (days <= 14) return `${formatted} • ${days}d left`;
  return formatted;
};

const ScholarshipCard = ({ s }) => (
  <Link to={`/scholarships/${s.id}`} className="schol-card">
    <span className={`tag tag-${s.category}`}>{s.category.replace('_', ' ')}</span>
    <h3>{s.name}</h3>
    <p className="provider">{s.provider}</p>
    <p className="summary">{s.summary || s.description?.slice(0, 140)}</p>
    <div className="meta">
      {s.amount && <span><HiOutlineCurrencyRupee /> {s.amount}</span>}
      <span><HiOutlineCalendarDays /> {formatDeadline(s.deadline)}</span>
    </div>
    <span className="cta">View details <HiArrowRight /></span>
  </Link>
);

const Scholarships = () => {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [district, setDistrict] = useState('');
  const [upcomingOnly, setUpcomingOnly] = useState(true);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ scholarships: [], total: 0, limit: 12 });
  const [loading, setLoading] = useState(true);

  const dq = useDebounced(q, 300);

  useEffect(() => { setPage(1); }, [dq, category, level, district, upcomingOnly]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '12' });
    if (dq) params.set('q', dq);
    if (category) params.set('category', category);
    if (level) params.set('level', level);
    if (district) params.set('district', district);
    if (upcomingOnly) params.set('upcoming', 'true');
    api.get(`/v1/scholarships?${params.toString()}`)
      .then(({ data }) => { if (!cancelled) setData(data); })
      .catch((e) => toast.error(e.response?.data?.error || 'Failed to load'))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [dq, category, level, district, upcomingOnly, page]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(data.total / (data.limit || 12))),
    [data.total, data.limit]
  );

  return (
    <div className="scholarships-page">
      <div className="shell">
        <Link to="/" className="back"><HiArrowLeft /> Home</Link>
        <header className="head">
          <span className="eyebrow"><HiAcademicCap /> Scholarship tracker</span>
          <h1>Find a scholarship that fits</h1>
          <p>Curated list of govt &amp; private scholarships for students in Tamil Nadu and across India. Apply directly on the official portal — needyHelp doesn&apos;t handle applications or take a cut.</p>
        </header>

        <div className="filters">
          <label className="search">
            <HiMagnifyingGlass aria-hidden="true" />
            <input
              type="search"
              placeholder="Search scholarships, providers, tags…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search scholarships"
            />
          </label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Filter by education level">
            {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
          <select value={district} onChange={(e) => setDistrict(e.target.value)} aria-label="Filter by district">
            <option value="">Any district</option>
            {TN_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <label className="check">
            <input type="checkbox" checked={upcomingOnly} onChange={(e) => setUpcomingOnly(e.target.checked)} />
            Upcoming only
          </label>
        </div>

        <div className="result-count">
          {loading ? 'Loading…' : `${data.total.toLocaleString()} ${data.total === 1 ? 'scholarship' : 'scholarships'}`}
        </div>

        <section className="grid">
          {loading && Array.from({ length: 6 }).map((_, i) => <div key={i} className="skel" />)}
          {!loading && data.scholarships.length === 0 && (
            <div className="empty">
              <HiAcademicCap />
              <h3>No scholarships match your filters</h3>
              <p>Try clearing a filter or searching for a different keyword.</p>
            </div>
          )}
          {!loading && data.scholarships.map((s) => <ScholarshipCard key={s.id} s={s} />)}
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

export default Scholarships;
