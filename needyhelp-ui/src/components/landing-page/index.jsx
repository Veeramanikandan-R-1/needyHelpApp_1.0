import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  HiHeart, HiAcademicCap, HiUsers, HiSparkles, HiArrowRight,
  HiBookOpen, HiHandRaised, HiShieldCheck, HiCheckCircle,
} from 'react-icons/hi2';
import './index.scss';
import Navbar from './navbar';
import SideBar from './sidebar';
import { useAuth } from '../../context/AuthContext';
import { SITE } from '../../config/site';

const StatPill = ({ value, label }) => (
  <div className="stat-pill">
    <span className="value">{value}</span>
    <span className="label">{label}</span>
  </div>
);

const FeatureCard = ({ icon, title, desc, badge, to }) => {
  const inner = (
    <>
      {badge && <span className="badge">{badge}</span>}
      <div className="icon-box">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
      {to && <span className="feature-cta">Explore <HiArrowRight /></span>}
    </>
  );
  return to
    ? <Link to={to} className="feature-card linked">{inner}</Link>
    : <article className="feature-card">{inner}</article>;
};

const StepCard = ({ n, title, desc }) => (
  <div className="step-card">
    <span className="step-num">{n}</span>
    <h4>{title}</h4>
    <p>{desc}</p>
  </div>
);

const LandingPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const toggle = () => setIsOpen((v) => !v);

  return (
    <div className='landing-container'>
      <Navbar toggle={toggle} />
      {isOpen && <SideBar isOpen={isOpen} toggle={toggle} />}

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-content">
          <span className="eyebrow"><HiSparkles /> A trust-first donation platform</span>
          <h1 className='main-title'>
            Help reach <span className="grad">the right hands</span>.
          </h1>
          <p className="subtitle">
            Connect with people in need across Tamil Nadu — students, families,
            communities. Browse verified requests, donate directly, see real impact.
          </p>
          <div className="cta-row">
            <button className="btn-primary" onClick={() => navigate(user ? '/dashboard' : '/signup')}>
              {user ? 'Go to dashboard' : 'Get started'} <HiArrowRight />
            </button>
            <button className="btn-ghost" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>
              How it works
            </button>
          </div>
          <div className="trust-row">
            <span><HiShieldCheck /> Verified posters</span>
            <span><HiCheckCircle /> Direct UPI to receiver</span>
            <span><HiHeart /> No platform cut</span>
          </div>
        </div>
      </section>

      {/* IMPACT BAND */}
      <section className="impact-band">
        <StatPill value="0" label="Students helped" />
        <StatPill value="0" label="Donors active" />
        <StatPill value="38" label="TN districts" />
        <StatPill value="₹0" label="Directly contributed" />
      </section>

      {/* WHAT WE HELP WITH */}
      <section id="what" className="section">
        <div className="section-head">
          <span className="kicker">What we focus on</span>
          <h2>Built for people who need it most.</h2>
          <p>We start where the gap is widest — students from low-income families across Tamil Nadu — and grow from there.</p>
        </div>
        <div className="features-grid">
          <FeatureCard
            to="/sponsor"
            badge="Live"
            icon={<HiAcademicCap />}
            title="Sponsor a student"
            desc="Teachers post a child's specific need — books, uniform, exam fee. Donors fund directly. Track delivery + confirmation."
          />
          <FeatureCard
            to="/scholarships"
            badge="Live"
            icon={<HiBookOpen />}
            title="Scholarship tracker"
            desc="Govt scholarships (Pre/Post-Matric, BC/MBC, INSPIRE, AICTE) with deadlines and direct apply links."
          />
          <FeatureCard
            icon={<HiHandRaised />}
            title="Hostel & supplies drive"
            desc="Govt school & hostel essentials — sheets, plates, sanitary pads, slippers. Wardens post; donors fulfill in bulk."
          />
          <FeatureCard
            icon={<HiUsers />}
            title="Volunteer mentor"
            desc="College students near a govt school sign up to teach 1 hour/week. Match by pincode + subject."
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="section how">
        <div className="section-head">
          <span className="kicker">How it works</span>
          <h2>Three steps. No middlemen.</h2>
        </div>
        <div className="steps-grid">
          <StepCard n="1" title="Verified post" desc="A teacher, warden, or NGO posts a real need with school details and amount." />
          <StepCard n="2" title="Donor claims it" desc="Browse open requests by district, class, or category. Reserve the one you want to fund." />
          <StepCard n="3" title="Direct + confirmed" desc="Pay directly via UPI. The poster confirms delivery. You see exactly where your help went." />
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="cta-section">
        <div className="cta-card">
          <h2>Be the reason a child doesn't drop out this term.</h2>
          <p>Sponsor textbooks for ₹400. A uniform for ₹600. An entire term for ₹2,500.</p>
          <div className="cta-row">
            <button className="btn-primary" onClick={() => navigate(user ? '/dashboard' : '/signup')}>
              {user ? 'Go to dashboard' : 'Join as a donor'} <HiArrowRight />
            </button>
            <Link to="/about" className="btn-ghost">Learn more</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="brand">
            <HiHeart /> {SITE.name}
            <span className="tag">{SITE.tagline}</span>
          </div>
          <nav>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/login">Sign in</Link>
            <Link to="/signup">Sign up</Link>
          </nav>
          <small>© {new Date().getFullYear()} {SITE.name}. A community project.</small>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;