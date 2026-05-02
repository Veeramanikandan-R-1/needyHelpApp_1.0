import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiArrowLeft, HiMagnifyingGlass, HiOutlineCheckBadge, HiOutlineNoSymbol,
  HiHeart,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import './users.scss';

const ROLES = ['donor', 'student', 'teacher', 'admin'];

const useDebounced = (value, ms = 300) => {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
};

const UserRow = ({ row, isMe, onUpdate }) => {
  const [busy, setBusy] = useState(null);

  const setRole = async (role) => {
    if (role === row.role) return;
    setBusy('role');
    try {
      const { data } = await api.patch(`/v1/user/admin/users/${row.id}`, { role });
      onUpdate(data.user);
      toast.success(`Role updated → ${role}`);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to update role');
    } finally { setBusy(null); }
  };

  const toggleVerified = async () => {
    setBusy('verified');
    try {
      const { data } = await api.patch(`/v1/user/admin/users/${row.id}`, { verified: !row.verified });
      onUpdate(data.user);
      toast.success(data.user.verified ? 'Verified' : 'Unverified');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed');
    } finally { setBusy(null); }
  };

  return (
    <tr>
      <td className="user-cell">
        <div className="who">
          <div className="avatar">
            {row.avatarUrl
              ? <img src={row.avatarUrl} alt="" />
              : <span>{(row.username || '?').slice(0, 2).toUpperCase()}</span>}
          </div>
          <div className="meta">
            <div className="name">
              {row.username}
              {isMe && <span className="me-tag">you</span>}
              {row.verified && <HiOutlineCheckBadge title="Verified" className="verified" />}
            </div>
            <div className="email">{row.emailId}</div>
          </div>
        </div>
      </td>
      <td>
        <select
          value={row.role}
          onChange={(e) => setRole(e.target.value)}
          disabled={busy === 'role' || isMe}
          aria-label={`Role for ${row.username}`}
        >
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </td>
      <td className="muted">{row.district || '—'}</td>
      <td className="muted">{row.phone || '—'}</td>
      <td>
        <button
          type="button"
          className={`verify-btn ${row.verified ? 'on' : ''}`}
          onClick={toggleVerified}
          disabled={busy === 'verified'}
          aria-pressed={row.verified}
        >
          {row.verified ? <><HiOutlineCheckBadge /> Verified</> : <><HiOutlineNoSymbol /> Unverified</>}
        </button>
      </td>
      <td className="muted">
        {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
      </td>
    </tr>
  );
};

const AdminUsers = () => {
  const { user: me } = useAuth();
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ users: [], total: 0, page: 1, limit: 20 });
  const [loading, setLoading] = useState(true);

  const dq = useDebounced(q, 300);

  useEffect(() => { setPage(1); }, [dq, roleFilter, verifiedFilter]);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (dq) params.set('q', dq);
    if (roleFilter) params.set('role', roleFilter);
    if (verifiedFilter) params.set('verified', verifiedFilter);
    setLoading(true);
    api.get(`/v1/user/admin/users?${params.toString()}`)
      .then(({ data }) => { if (!cancelled) setData(data); })
      .catch((e) => toast.error(e.response?.data?.error || 'Failed to load users'))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [dq, roleFilter, verifiedFilter, page]);

  const onRowUpdate = (updated) => {
    setData((d) => ({ ...d, users: d.users.map((u) => (u.id === updated.id ? updated : u)) }));
  };

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(data.total / (data.limit || 20))),
    [data.total, data.limit]
  );

  return (
    <div className="admin-users-page">
      <header className="page-head">
        <div>
          <Link to="/dashboard" className="back"><HiArrowLeft /> Dashboard</Link>
          <h1><HiHeart /> Users</h1>
          <p>Manage roles and verify teachers/wardens before they can post on behalf of students.</p>
        </div>
        <div className="count">{data.total.toLocaleString()} {data.total === 1 ? 'user' : 'users'}</div>
      </header>

      <div className="filters">
        <label className="search">
          <HiMagnifyingGlass aria-hidden="true" />
          <input
            type="search"
            placeholder="Search name, email, phone, district…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search users"
          />
        </label>

        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} aria-label="Filter by role">
          <option value="">All roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>

        <select value={verifiedFilter} onChange={(e) => setVerifiedFilter(e.target.value)} aria-label="Filter by verification">
          <option value="">Any status</option>
          <option value="true">Verified only</option>
          <option value="false">Unverified only</option>
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>District</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="6" className="state">Loading…</td></tr>
            )}
            {!loading && data.users.length === 0 && (
              <tr><td colSpan="6" className="state">No users match your filters.</td></tr>
            )}
            {!loading && data.users.map((u) => (
              <UserRow key={u.id} row={u} isMe={me?.id === u.id} onUpdate={onRowUpdate} />
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className="pager" aria-label="Pagination">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</button>
        </nav>
      )}
    </div>
  );
};

export default AdminUsers;
