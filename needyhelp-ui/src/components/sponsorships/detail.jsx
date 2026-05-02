import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  HiArrowLeft, HiOutlineMapPin, HiOutlineUsers, HiOutlineCurrencyRupee,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Splash from '../common/splash';
import CustomButton from '../common/custom-button';
import './sponsorships.scss';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const PRESET_AMOUNTS = [100, 500, 1000, 2500];

const DonateBox = ({ post, onDonated }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState(500);
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const remaining = Math.max(0, post.amountTarget - post.amountRaised);
  const closed = !['open', 'partially_funded'].includes(post.status);

  const onDonate = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in to donate.'); navigate('/login'); return; }
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt < 1) { toast.error('Enter a valid amount.'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post(`/v1/sponsorships/${post.id}/donate`, {
        amount: amt, message, anonymous,
      });
      toast.success(`Thank you! ${inr(amt)} contributed.`);
      onDonated(data.sponsorship);
      setMessage('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Donation failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (closed) {
    return (
      <aside className="donate-box closed">
        <strong>This request is no longer accepting donations.</strong>
        <p>Status: <span className={`status status-${post.status}`}>{post.status.replace('_', ' ')}</span></p>
      </aside>
    );
  }

  return (
    <aside className="donate-box">
      <h3>Support {post.studentName.split(' ')[0]}</h3>
      <p className="remaining">{inr(remaining)} still needed</p>

      <form onSubmit={onDonate}>
        <div className="presets" role="group" aria-label="Quick amounts">
          {PRESET_AMOUNTS.map((a) => (
            <button key={a} type="button" className={amount === a ? 'on' : ''} onClick={() => setAmount(a)}>
              {inr(a)}
            </button>
          ))}
        </div>

        <label>
          <span>Custom amount (INR)</span>
          <div className="amt-input">
            <HiOutlineCurrencyRupee aria-hidden="true" />
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-label="Donation amount"
            />
          </div>
        </label>

        <label>
          <span>Message (optional)</span>
          <textarea
            value={message}
            maxLength={280}
            placeholder="A few kind words…"
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>

        <label className="check">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
          />
          Donate anonymously
        </label>

        <CustomButton type="submit" fullWidth disabled={submitting}>
          {submitting ? 'Processing…' : `Donate ${inr(amount)}`}
        </CustomButton>
        <small className="dev-note">Mock payment for now — no money is actually transferred.</small>
      </form>
    </aside>
  );
};

const SponsorshipDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/v1/sponsorships/${id}`)
      .then(({ data }) => setPost(data.sponsorship))
      .catch((e) => toast.error(e.response?.data?.error || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Splash label="Loading…" />;
  if (!post) return (
    <div className="sponsor-detail-page">
      <div className="shell">
        <Link to="/sponsor" className="back"><HiArrowLeft /> All requests</Link>
        <h1>Not found</h1>
        <p>This post may have been removed or isn&apos;t accepting public traffic yet.</p>
      </div>
    </div>
  );

  const pct = Math.min(100, Math.round((post.amountRaised / post.amountTarget) * 100));

  return (
    <div className="sponsor-detail-page">
      <div className="shell two-col">
        <main>
          <Link to="/sponsor" className="back"><HiArrowLeft /> All requests</Link>

          <header className="head">
            <div className="tag-row">
              <span className={`tag tag-${post.category}`}>{post.category.replace('_', ' ')}</span>
              <span className={`poster-pill poster-${post.postedByRole || 'teacher'}`}>
                {post.selfPosted ? 'Self request by student' : post.postedByRole === 'teacher' ? 'Posted by a verified teacher' : 'Posted'}
              </span>
            </div>
            <h1>{post.title}</h1>
            <p className="for">For <strong>{post.studentName}</strong>{post.studentClass ? ` • ${post.studentClass}` : ''}</p>
            <div className="bits">
              {post.district && <span><HiOutlineMapPin /> {post.district}</span>}
              <span><HiOutlineUsers /> {post.donationCount} {post.donationCount === 1 ? 'donor' : 'donors'}</span>
              <span className={`status status-${post.status}`}>{post.status.replace('_', ' ')}</span>
            </div>
          </header>

          <section className="big-progress" aria-label={`${pct}% funded`}>
            <div className="bar"><span style={{ width: `${pct}%` }} /></div>
            <div className="row">
              <strong>{inr(post.amountRaised)} <span>raised of {inr(post.amountTarget)}</span></strong>
              <span>{pct}%</span>
            </div>
          </section>

          {post.story && (
            <section className="content">
              <h2>The story</h2>
              <p>{post.story}</p>
            </section>
          )}

          {post.recentSupporters?.length > 0 && (
            <section className="supporters">
              <h2>Recent supporters</h2>
              <ul>
                {post.recentSupporters.map((s, i) => (
                  <li key={i}>
                    <div>
                      <strong>{s.donorName}</strong>
                      {s.amount && <span className="amount">{inr(s.amount)}</span>}
                    </div>
                    {s.message && <p>“{s.message}”</p>}
                    <time>{new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</time>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>

        <DonateBox post={post} onDonated={setPost} />
      </div>
    </div>
  );
};

export default SponsorshipDetail;
