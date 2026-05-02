import React from 'react';
import { Link } from 'react-router-dom';
import {
  HiArrowLeft, HiHeart, HiAcademicCap, HiShieldCheck, HiUsers,
  HiOutlineMapPin, HiArrowRight,
} from 'react-icons/hi2';
import { SITE } from '../../config/site';
import './index.scss';

const Pillar = ({ icon, title, desc }) => (
  <div className="pillar">
    <div className="icon-box">{icon}</div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);

const About = () => (
  <div className="about-page">
    <div className="shell">
      <Link to="/" className="back"><HiArrowLeft /> Back to home</Link>

      <header className="head">
        <span className="eyebrow"><HiHeart /> {SITE.name}</span>
        <h1>People helping people, directly.</h1>
        <p>
          {SITE.name} is a community-built platform that connects donors with
          students and families across Tamil Nadu who need help — books, fees,
          uniforms, basic essentials. Verified posts. No middlemen. No platform cut.
        </p>
      </header>

      <section className="pillars">
        <Pillar
          icon={<HiAcademicCap />}
          title="Students first"
          desc="We start where the gap is widest — children from low-income families at risk of dropping out — and grow from there."
        />
        <Pillar
          icon={<HiShieldCheck />}
          title="Verified, then visible"
          desc="Teachers, wardens, and NGOs post on behalf of students. Admin verification happens before posts go public."
        />
        <Pillar
          icon={<HiUsers />}
          title="Direct & transparent"
          desc="Donors fund directly via UPI. Posters confirm delivery with proof. You see exactly where your help went."
        />
      </section>

      <section className="origin">
        <h2>Why this exists</h2>
        <p>
          Built as a personal project by {SITE.owner.name} — a software engineer
          from {SITE.owner.address.district}, Tamil Nadu. The goal is simple:
          remove every barrier between someone who wants to help and someone
          who needs it.
        </p>
        <p className="from">
          <HiOutlineMapPin /> {SITE.tagline}
        </p>
      </section>

      <section className="cta">
        <h2>Want to help?</h2>
        <div className="cta-row">
          <Link to="/signup" className="btn-primary">Join as a donor <HiArrowRight /></Link>
          <Link to="/contact" className="btn-ghost">Contact us</Link>
        </div>
      </section>
    </div>
  </div>
);

export default About;
