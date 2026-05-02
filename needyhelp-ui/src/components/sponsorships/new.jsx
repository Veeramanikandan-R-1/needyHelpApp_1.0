import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiOutlineHeart } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { TN_DISTRICTS } from '../../utils/tn-districts';
import CustomButton from '../common/custom-button';
import './sponsorships.scss';

const CATEGORIES = [
  { value: 'tuition_fee', label: 'Tuition fee' },
  { value: 'books', label: 'Books' },
  { value: 'uniform', label: 'Uniform' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'exam_fee', label: 'Exam fee' },
  { value: 'other', label: 'Other' },
];

const NewSponsorship = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    studentName: user?.role === 'student' ? user?.username || '' : '',
    studentClass: '',
    category: 'tuition_fee',
    story: '',
    amountTarget: 1000,
    district: user?.district || '',
    pincode: user?.pincode || '',
    deadline: '',
    contactPhone: user?.phone || '',
    contactEmail: user?.email || '',
    schoolOrInstitute: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher' && user?.verified;
  const canPost = isStudent || isTeacher;

  const validate = () => {
    const e = {};
    if (!form.title.trim() || form.title.length > 100) e.title = 'Title is required (≤100 chars)';
    if (!form.studentName.trim()) e.studentName = 'Student name is required';
    const t = Number(form.amountTarget);
    if (!Number.isFinite(t) || t < 100) e.amountTarget = 'Target must be ₹100 or more';
    if (form.story.length > 1500) e.story = 'Story must be ≤1500 chars';
    if (isStudent && !form.contactPhone.trim() && !form.contactEmail.trim()) {
      e.contactPhone = 'Add a phone or email so admin can verify';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        amountTarget: Number(form.amountTarget),
        deadline: form.deadline || undefined,
      };
      const { data } = await api.post('/v1/sponsorships', payload);
      toast.success('Submitted for review.');
      navigate(`/sponsor/${data.sponsorship.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (!canPost) {
    return (
      <div className="sponsor-new-page">
        <div className="shell">
          <Link to="/sponsor" className="back"><HiArrowLeft /> All requests</Link>
          <div className="gate">
            <HiOutlineHeart />
            <h1>Sign in as a student or verified teacher to post</h1>
            <p>
              <strong>Students</strong> can post a request for their own education needs (no verification required to submit — admin will review before publishing).<br/>
              <strong>Teachers / NGOs</strong> can post on behalf of a student once an admin verifies their account.
            </p>
            <p>Open your profile and choose <em>Student</em> or <em>Teacher / NGO</em> as your role.</p>
            <Link to="/profile" className="btn-primary">Update my profile</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sponsor-new-page">
      <div className="shell">
        <Link to="/sponsor" className="back"><HiArrowLeft /> All requests</Link>
        <header className="head">
          <h1>{isStudent ? 'Request a sponsor' : 'Post a sponsorship request'}</h1>
          <p>
            {isStudent
              ? 'Tell donors what you need help with — books, fees, uniform. An admin will review your request before it goes public. Be specific and honest.'
              : 'Once submitted, an admin will review and publish it. Donors see only the title, story, target, and progress — never PII or documents.'}
          </p>
          <p className="poster-tag">
            Posting as <strong>{isStudent ? 'Student (self request)' : 'Verified teacher / NGO'}</strong>
          </p>
        </header>

        <form onSubmit={onSubmit} className="post-form" noValidate>
          <label>
            <span>Title</span>
            <input
              value={form.title}
              onChange={set('title')}
              placeholder={isStudent ? 'e.g. Help me pay my Class 11 books' : 'e.g. Class 9 books for Suresh'}
              maxLength="100"
              aria-invalid={!!errors.title}
            />
            {errors.title && <small className="err">{errors.title}</small>}
          </label>

          <div className="row">
            <label>
              <span>{isStudent ? 'Your name' : 'Student name'}</span>
              <input value={form.studentName} onChange={set('studentName')} aria-invalid={!!errors.studentName} />
              {errors.studentName && <small className="err">{errors.studentName}</small>}
            </label>
            <label>
              <span>{isStudent ? 'Class / course' : 'Class / school (optional)'}</span>
              <input value={form.studentClass} onChange={set('studentClass')} placeholder="e.g. Class 11, Govt HSS" />
            </label>
          </div>

          <label>
            <span>School / college / institute (optional)</span>
            <input value={form.schoolOrInstitute} onChange={set('schoolOrInstitute')} placeholder="Govt Higher Sec School, Oddanchatram" />
          </label>

          <div className="row">
            <label>
              <span>Category</span>
              <select value={form.category} onChange={set('category')}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </label>
            <label>
              <span>Target (₹)</span>
              <input type="number" min="100" value={form.amountTarget} onChange={set('amountTarget')} aria-invalid={!!errors.amountTarget} />
              {errors.amountTarget && <small className="err">{errors.amountTarget}</small>}
            </label>
          </div>

          <div className="row">
            <label>
              <span>District</span>
              <select value={form.district} onChange={set('district')}>
                <option value="">Select…</option>
                {TN_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
            <label>
              <span>Pincode</span>
              <input value={form.pincode} onChange={set('pincode')} maxLength="6" />
            </label>
          </div>

          <div className="row">
            <label>
              <span>Phone {isStudent && <em className="hint">(needed for admin verification)</em>}</span>
              <input value={form.contactPhone} onChange={set('contactPhone')} maxLength="20" placeholder="+91…" aria-invalid={!!errors.contactPhone} />
              {errors.contactPhone && <small className="err">{errors.contactPhone}</small>}
            </label>
            <label>
              <span>Email</span>
              <input type="email" value={form.contactEmail} onChange={set('contactEmail')} maxLength="120" />
            </label>
          </div>
          <small className="privacy">
            Phone &amp; email are <strong>private</strong> — only an admin sees them, never donors.
          </small>

          <label>
            <span>Deadline (optional)</span>
            <input type="date" value={form.deadline} onChange={set('deadline')} />
          </label>

          <label>
            <span>{isStudent ? `Your story (${form.story.length}/1500)` : `Story / context (${form.story.length}/1500)`}</span>
            <textarea
              value={form.story}
              onChange={set('story')}
              rows="6"
              maxLength="1500"
              placeholder={isStudent
                ? 'Tell donors about you — what you study, what you need, why you need help. Be specific about how the funds will be used.'
                : 'What does the student need? Why? What will the funds cover?'}
            />
            {errors.story && <small className="err">{errors.story}</small>}
          </label>

          <div className="actions">
            <Link to="/sponsor" className="btn-ghost">Cancel</Link>
            <CustomButton type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit for review'}
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewSponsorship;
