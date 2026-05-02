import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  HiHeart, HiAcademicCap, HiUsers, HiSparkles, HiArrowRight,
  HiBookOpen, HiHandRaised, HiShieldCheck, HiCheckCircle,
  HiOutlineChatBubbleLeftRight,
} from 'react-icons/hi2';
import './index.scss';
import Navbar from './navbar';
import SideBar from './sidebar';
import BackToTop from '../common/back-to-top';
import useReveal from '../../hooks/useReveal';
import useCountUp from '../../hooks/useCountUp';
import { useAuth } from '../../context/AuthContext';
import { SITE } from '../../config/site';

const RevealSection = ({ as: Tag = 'section', className = '', children, ...rest }) => {
  const [ref, revealed] = useReveal();
  return (
    <Tag ref={ref} className={`${className} reveal${revealed ? ' reveal--in' : ''}`} {...rest}>
      {children}
    </Tag>
  );
};

const StatPill = ({ target, prefix = '', suffix = '', label }) => {
  const [ref, value] = useCountUp(target);
  return (
    <div className="stat-pill" ref={ref}>
      <span className="value">{prefix}{value.toLocaleString('en-IN')}{suffix}</span>
      <span className="label">{label}</span>
    </div>
  );
};

const MagneticButton = ({ children, className = '', onClick, ...props }) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia?.('(pointer: fine)').matches;
    if (reduce || !fine) return undefined;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${Math.max(-6, Math.min(6, x * 0.12))}px, ${Math.max(-4, Math.min(4, y * 0.18))}px)`;
    };
    const onLeave = () => { el.style.transform = ''; };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);
  return (
    <button ref={ref} type="button" className={`magnetic ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

const FeatureCard = ({ icon, title, desc, badge, to, delay = 0 }) => {
  const [ref, revealed] = useReveal();
  const inner = (
    <>
      {badge && <span className="badge">{badge}</span>}
      <div className="icon-box">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
      {to && <span className="feature-cta">Explore <HiArrowRight /></span>}
    </>
  );
  const className = `feature-card reveal reveal--delay-${Math.min(4, delay)}${revealed ? ' reveal--in' : ''}${to ? ' linked' : ''}`;
  return to
    ? <Link ref={ref} to={to} className={className}>{inner}</Link>
    : <article ref={ref} className={className}>{inner}</article>;
};

const StepCard = ({ n, title, desc, delay = 0 }) => {
  const [ref, revealed] = useReveal();
  return (
    <div ref={ref} className={`step-card reveal reveal--delay-${Math.min(4, delay)}${revealed ? ' reveal--in' : ''}`}>
      <span className="step-num">{n}</span>
      <h4>{title}</h4>
      <p>{desc}</p>
    </div>
  );
};

const SectionDivider = ({ flip = false }) => (
  <div className={`section-divider${flip ? ' is-flipped' : ''}`} aria-hidden="true">
    <svg viewBox="0 0 1440 60" preserveAspectRatio="none" focusable="false">
      <path d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z" fill="currentColor" />
    </svg>
  </div>
);

const QUOTES = [
  { who: 'Saranya M., teacher · Madurai', text: 'Two students got their term fees in a week. We never had a way to ask before.' },
  { who: 'Ravi K., donor · Bengaluru',     text: 'I knew exactly which child my ₹2,500 reached. That is what I always wanted.' },
  { who: 'NGO partner · Salem',            text: 'The verification step is what separates this from random fundraising links.' },
];

const QuoteTicker = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;
    const id = setInterval(() => setI((n) => (n + 1) % QUOTES.length), 5500);
    return () => clearInterval(id);
  }, []);
  const q = QUOTES[i];
  return (
    <div className="quote-ticker" aria-live="polite" aria-atomic="true">
      <HiOutlineChatBubbleLeftRight aria-hidden="true" />
      <div className="quote-body">
        <p key={i} className="quote-text">“{q.text}”</p>
        <span className="quote-who">— {q.who}</span>
      </div>
      <div className="quote-dots" role="tablist" aria-label="Testimonials">
        {QUOTES.map((_, idx) => (
          <button
            key={idx}
            type="button"
            role="tab"
            aria-selected={idx === i}
            aria-label={`Show testimonial ${idx + 1}`}
            className={idx === i ? 'on' : ''}
            onClick={() => setI(idx)}
          />
        ))}
      </div>
    </div>
  );
};

const LandingPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const toggle = () => setIsOpen((v) => !v);

  // Hero stagger: reveal classes are baked in; flip on next paint
  const [heroIn, setHeroIn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setHeroIn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className='landing-container'>
      <Navbar toggle={toggle} />
      {isOpen && <SideBar isOpen={isOpen} toggle={toggle} />}

      <main>
        {/* HERO */}
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-aurora" aria-hidden="true"><span /><span /><span /></div>
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-noise" aria-hidden="true" />

          <div className="hero-content">
            <span className={`eyebrow reveal reveal--delay-1${heroIn ? ' reveal--in' : ''}`}>
              <HiSparkles /> A trust-first donation platform
            </span>
            <h1 id="hero-title" className={`main-title reveal reveal--delay-2${heroIn ? ' reveal--in' : ''}`}>
              Help reach <span className="grad">the right hands</span>.
            </h1>
            <p className={`subtitle reveal reveal--delay-3${heroIn ? ' reveal--in' : ''}`}>
              Connect with people in need across Tamil Nadu — students, families,
              communities. Browse verified requests, donate directly, see real impact.
            </p>
            <div className={`cta-row reveal reveal--delay-4${heroIn ? ' reveal--in' : ''}`}>
              <MagneticButton
                className="btn-primary"
                onClick={() => navigate(user ? '/dashboard' : '/signup')}
              >
                {user ? 'Go to dashboard' : 'Get started'} <HiArrowRight />
              </MagneticButton>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}
              >
                How it works
              </button>
            </div>
            <div className={`trust-row reveal reveal--delay-4${heroIn ? ' reveal--in' : ''}`}>
              <span><HiShieldCheck /> Verified posters</span>
              <span><HiCheckCircle /> Direct UPI to receiver</span>
              <span><HiHeart /> No platform cut</span>
            </div>
          </div>
        </section>

        {/* IMPACT BAND — replace target values when real metrics ship */}
        <RevealSection id="impact" className="impact-band">
          <StatPill target={0}  label="Students helped" />
          <StatPill target={0}  label="Donors active" />
          <StatPill target={38} label="TN districts" />
          <StatPill target={0}  prefix="₹" label="Directly contributed" />
        </RevealSection>

        {/* QUOTE TICKER */}
        <RevealSection className="quote-section">
          <QuoteTicker />
        </RevealSection>

        {/* WHAT */}
        <RevealSection id="what" className="section">
          <div className="section-head">
            <span className="kicker">What we focus on</span>
            <h2>Built for people who need it most.</h2>
            <p>We start where the gap is widest — students from low-income families across Tamil Nadu — and grow from there.</p>
          </div>
          <div className="features-grid">
            <FeatureCard delay={1} to="/sponsor"      badge="Live" icon={<HiAcademicCap />} title="Sponsor a student"      desc="Teachers post a child's specific need — books, uniform, exam fee. Donors fund directly. Track delivery + confirmation." />
            <FeatureCard delay={2} to="/scholarships" badge="Live" icon={<HiBookOpen />}    title="Scholarship tracker"    desc="Govt scholarships (Pre/Post-Matric, BC/MBC, INSPIRE, AICTE) with deadlines and direct apply links." />
            <FeatureCard delay={3} icon={<HiHandRaised />} title="Hostel & supplies drive" desc="Govt school & hostel essentials — sheets, plates, sanitary pads, slippers. Wardens post; donors fulfill in bulk." />
            <FeatureCard delay={4} icon={<HiUsers />}      title="Volunteer mentor"        desc="College students near a govt school sign up to teach 1 hour/week. Match by pincode + subject." />
          </div>
        </RevealSection>

        <SectionDivider />

        {/* HOW */}
        <RevealSection id="how" className="section how">
          <div className="section-head">
            <span className="kicker">How it works</span>
            <h2>Three steps. No middlemen.</h2>
          </div>
          <div className="steps-grid">
            <StepCard delay={1} n="1" title="Verified post"      desc="A teacher, warden, or NGO posts a real need with school details and amount." />
            <StepCard delay={2} n="2" title="Donor claims it"    desc="Browse open requests by district, class, or category. Reserve the one you want to fund." />
            <StepCard delay={3} n="3" title="Direct + confirmed" desc="Pay directly via UPI. The poster confirms delivery. You see exactly where your help went." />
          </div>
        </RevealSection>

        <SectionDivider flip />

        {/* CTA */}
        <RevealSection id="cta" className="cta-section">
          <div className="cta-card">
            <div className="cta-glow" aria-hidden="true" />
            <h2>Be the reason a child doesn&apos;t drop out this term.</h2>
            <p>Sponsor textbooks for ₹400. A uniform for ₹600. An entire term for ₹2,500.</p>
            <div className="cta-row">
              <MagneticButton
                className="btn-primary"
                onClick={() => navigate(user ? '/dashboard' : '/signup')}
              >
                {user ? 'Go to dashboard' : 'Join as a donor'} <HiArrowRight />
              </MagneticButton>
              <Link to="/about" className="btn-ghost">Learn more</Link>
            </div>
          </div>
        </RevealSection>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="brand">
            <HiHeart /> {SITE.name}
            <span className="tag">{SITE.tagline}</span>
          </div>
          <nav aria-label="Footer">
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/login">Sign in</Link>
            <Link to="/signup">Sign up</Link>
          </nav>
          <small>© {new Date().getFullYear()} {SITE.name}. A community project.</small>
        </div>
      </footer>

      <BackToTop />
    </div>
  );
};

export default LandingPage;