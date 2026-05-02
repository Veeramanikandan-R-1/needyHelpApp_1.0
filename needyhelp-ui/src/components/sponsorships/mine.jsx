import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowLeft, HiOutlineHeart, HiArrowRight } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import './sponsorships.scss';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const MyActivity = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState(user?.role === 'teacher' ? 'posts' : 'donations');
  const [posts, setPosts] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const calls = [
      api.get('/v1/sponsorships/donations/mine').then(({ data }) => !cancelled && setDonations(data.donations || [])),
    ];
    if (user?.role === 'teacher') {
      calls.push(api.get('/v1/sponsorships/mine').then(({ data }) => !cancelled && setPosts(data.sponsorships || [])));
    }
    Promise.all(calls)
      .catch((e) => toast.error(e.response?.data?.error || 'Failed to load'))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [user?.role]);

  return (
    <div className="my-activity-page">
      <div className="shell">
        <Link to="/sponsor" className="back"><HiArrowLeft /> All requests</Link>
        <header className="head">
          <h1>My activity</h1>
          <p>Track requests you posted and donations you made.</p>
        </header>

        <div role="tablist" className="tabs">
          {user?.role === 'teacher' && (
            <button role="tab" aria-selected={tab === 'posts'} className={tab === 'posts' ? 'on' : ''} onClick={() => setTab('posts')}>
              My posts ({posts.length})
            </button>
          )}
          <button role="tab" aria-selected={tab === 'donations'} className={tab === 'donations' ? 'on' : ''} onClick={() => setTab('donations')}>
            My donations ({donations.length})
          </button>
        </div>

        {loading && <p className="state">Loading…</p>}

        {!loading && tab === 'posts' && (
          posts.length === 0 ? (
            <div className="empty">
              <HiOutlineHeart />
              <h3>No posts yet</h3>
              <p>Once your teacher account is verified, you can post a sponsorship request.</p>
              <Link to="/sponsor/new" className="btn-primary">Post a request</Link>
            </div>
          ) : (
            <ul className="list">
              {posts.map((p) => (
                <li key={p.id}>
                  <Link to={`/sponsor/${p.id}`}>
                    <div>
                      <span className={`status status-${p.status}`}>{p.status.replace('_', ' ')}</span>
                      <strong>{p.title}</strong>
                      <span className="sub">For {p.studentName} • {inr(p.amountRaised)} of {inr(p.amountTarget)}</span>
                    </div>
                    <HiArrowRight />
                  </Link>
                </li>
              ))}
            </ul>
          )
        )}

        {!loading && tab === 'donations' && (
          donations.length === 0 ? (
            <div className="empty">
              <HiOutlineHeart />
              <h3>No donations yet</h3>
              <p>Browse open requests and contribute any amount — every rupee helps.</p>
              <Link to="/sponsor" className="btn-primary">Browse requests</Link>
            </div>
          ) : (
            <ul className="list">
              {donations.map((d) => (
                <li key={d.donationId}>
                  <Link to={`/sponsor/${d.postId}`}>
                    <div>
                      <span className="status status-paid">{inr(d.amount)}</span>
                      <strong>{d.postTitle}</strong>
                      <span className="sub">For {d.studentName} • {new Date(d.createdAt).toLocaleDateString()}</span>
                    </div>
                    <HiArrowRight />
                  </Link>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </div>
  );
};

export default MyActivity;
