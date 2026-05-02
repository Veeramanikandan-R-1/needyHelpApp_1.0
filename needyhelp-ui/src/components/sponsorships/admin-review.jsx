import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowLeft, HiOutlineCheckBadge, HiOutlineNoSymbol } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../../api/client';
import './sponsorships.scss';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const ReviewCard = ({ p, onDecided }) => {
  const [busy, setBusy] = useState(null);
  const [notes, setNotes] = useState('');

  const decide = async (decision) => {
    if (decision === 'rejected' && !notes.trim()) {
      toast.error('Add a reason in the notes before rejecting.');
      return;
    }
    setBusy(decision);
    try {
      await api.post(`/v1/sponsorships/${p.id}/review`, { decision, notes });
      toast.success(decision === 'open' ? 'Approved & published' : 'Rejected');
      onDecided(p.id);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed');
    } finally { setBusy(null); }
  };

  return (
    <article className="review-card">
      <header>
        <div className="tag-row">
          <span className={`tag tag-${p.category}`}>{p.category.replace('_', ' ')}</span>
          <span className={`poster-pill poster-${p.postedByRole || 'teacher'}`}>
            {p.selfPosted ? 'Self request' : 'Teacher-posted'}
          </span>
        </div>
        <h3>{p.title}</h3>
        <p className="for">For <strong>{p.studentName}</strong>{p.studentClass ? ` • ${p.studentClass}` : ''}</p>
        <p className="meta">
          {p.district || 'No district'} • Target {inr(p.amountTarget)} • Posted {new Date(p.createdAt).toLocaleDateString()}
        </p>
        {(p.contactPhone || p.contactEmail || p.schoolOrInstitute) && (
          <p className="contact">
            {p.schoolOrInstitute && <><strong>Institute:</strong> {p.schoolOrInstitute} </>}
            {p.contactPhone && <><strong> ☎</strong> {p.contactPhone} </>}
            {p.contactEmail && <><strong> ✉</strong> {p.contactEmail}</>}
          </p>
        )}
      </header>
      {p.story && <p className="story">{p.story}</p>}

      <label className="notes">
        <span>Admin notes (required to reject)</span>
        <textarea
          rows="2"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Why are you approving / rejecting this post?"
        />
      </label>

      <div className="actions">
        <button className="btn-ghost" disabled={busy} onClick={() => decide('rejected')}>
          <HiOutlineNoSymbol /> {busy === 'rejected' ? 'Rejecting…' : 'Reject'}
        </button>
        <button className="btn-primary" disabled={busy} onClick={() => decide('open')}>
          <HiOutlineCheckBadge /> {busy === 'open' ? 'Publishing…' : 'Approve & publish'}
        </button>
      </div>
    </article>
  );
};

const AdminReview = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/v1/sponsorships/admin/review')
      .then(({ data }) => setItems(data.sponsorships || []))
      .catch((e) => toast.error(e.response?.data?.error || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-review-page">
      <div className="shell">
        <Link to="/dashboard" className="back"><HiArrowLeft /> Dashboard</Link>
        <header className="head">
          <h1>Sponsorship review queue</h1>
          <p>Approve verified teacher posts before they go public, or reject with a reason.</p>
        </header>

        {loading && <p className="state">Loading…</p>}
        {!loading && items.length === 0 && (
          <div className="empty">
            <h3>Inbox zero</h3>
            <p>No posts pending review.</p>
          </div>
        )}
        {!loading && items.length > 0 && (
          <div className="cards">
            {items.map((p) => (
              <ReviewCard key={p.id} p={p} onDecided={(id) => setItems((it) => it.filter((x) => x.id !== id))} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReview;
