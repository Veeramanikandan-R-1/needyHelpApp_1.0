import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  HiArrowLeft, HiAcademicCap, HiOutlineCalendarDays, HiOutlineCurrencyRupee,
  HiArrowTopRightOnSquare, HiOutlineMapPin, HiOutlineTag,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../../api/client';
import Splash from '../common/splash';
import './scholarships.scss';

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  : 'Rolling intake';

const ScholarshipDetail = () => {
  const { id } = useParams();
  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/v1/scholarships/${id}`)
      .then(({ data }) => setS(data.scholarship))
      .catch((e) => toast.error(e.response?.data?.error || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Splash label="Loading scholarship…" />;
  if (!s) return (
    <div className="schol-detail-page">
      <div className="shell">
        <Link to="/scholarships" className="back"><HiArrowLeft /> All scholarships</Link>
        <h1>Not found</h1>
        <p>This scholarship may have been removed.</p>
      </div>
    </div>
  );

  return (
    <div className="schol-detail-page">
      <div className="shell">
        <Link to="/scholarships" className="back"><HiArrowLeft /> All scholarships</Link>

        <header className="head">
          <span className={`tag tag-${s.category}`}>{s.category.replace('_', ' ')}</span>
          <h1>{s.name}</h1>
          <p className="provider">{s.provider}</p>
        </header>

        <section className="quick-facts">
          {s.amount && (
            <div className="fact">
              <HiOutlineCurrencyRupee />
              <div><span>Amount</span><strong>{s.amount}</strong></div>
            </div>
          )}
          <div className="fact">
            <HiOutlineCalendarDays />
            <div><span>Deadline</span><strong>{formatDate(s.deadline)}</strong></div>
          </div>
          {s.level && s.level !== 'any' && (
            <div className="fact">
              <HiAcademicCap />
              <div><span>Level</span><strong>{s.level.replace('_', ' ')}</strong></div>
            </div>
          )}
          {s.state && (
            <div className="fact">
              <HiOutlineMapPin />
              <div><span>State</span><strong>{s.state}</strong></div>
            </div>
          )}
        </section>

        <section className="content">
          {s.summary && <p className="lead">{s.summary}</p>}
          {s.description && (
            <>
              <h2>About this scholarship</h2>
              <p>{s.description}</p>
            </>
          )}
          {s.eligibility && (
            <>
              <h2>Who can apply</h2>
              <p>{s.eligibility}</p>
            </>
          )}
          {s.districts?.length > 0 && (
            <>
              <h2>Districts</h2>
              <p>{s.districts.join(', ')}</p>
            </>
          )}
          {s.tags?.length > 0 && (
            <div className="tags-row">
              {s.tags.map((t) => <span key={t} className="chip"><HiOutlineTag /> {t}</span>)}
            </div>
          )}
        </section>

        <div className="apply-bar">
          <a className="btn-primary" href={s.applyUrl} target="_blank" rel="noopener noreferrer">
            Apply on official portal <HiArrowTopRightOnSquare />
          </a>
          <p>needyHelp links to the official source. We don&apos;t collect application data.</p>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipDetail;
