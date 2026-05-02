import React from 'react';
import { Link } from 'react-router-dom';
import {
  HiArrowLeft, HiOutlineEnvelope, HiOutlinePhone, HiOutlineMapPin,
  HiOutlineChatBubbleLeftRight, HiHeart,
} from 'react-icons/hi2';
import { SITE, formatAddress } from '../../config/site';
import './index.scss';

const initialsOf = (n = '') =>
  n.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('');

const Contact = () => {
  const { owner } = SITE;
  const a = owner.address;
  const addr = formatAddress(a);
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
  const mailHref = `mailto:${owner.email}?subject=${encodeURIComponent('needyHelp — hello')}`;
  const telHref = `tel:${owner.phoneRaw}`;
  const waHref = `https://wa.me/${owner.whatsapp}`;

  return (
    <div className="contact-page">
      <div className="c-shell">
        <Link to="/" className="back"><HiArrowLeft /> Back to home</Link>

        <div className="head">
          <h1>Get in touch</h1>
          <p>
            Questions, partnerships, or you'd like to verify a request?
            Reach out — replies usually within a day.
          </p>
        </div>

        <div className="grid">
          <article className="card person-card">
            <div className="avatar" aria-hidden="true">{initialsOf(owner.name)}</div>
            <div className="who">
              <span className="name">{owner.name}</span>
              <span className="role">{owner.role}</span>
            </div>
          </article>

          <article className="card">
            <div className="row">
              <div className="icon-box"><HiOutlineEnvelope /></div>
              <div className="meta">
                <span className="label">Email</span>
                <span className="value"><a href={mailHref}>{owner.email}</a></span>
              </div>
            </div>
          </article>

          <article className="card">
            <div className="row">
              <div className="icon-box"><HiOutlinePhone /></div>
              <div className="meta">
                <span className="label">Phone</span>
                <span className="value"><a href={telHref}>{owner.phone}</a></span>
                <span className="sub">Mon–Sat, 10am–8pm IST</span>
              </div>
            </div>
          </article>

          <article className="card">
            <div className="row">
              <div className="icon-box"><HiOutlineChatBubbleLeftRight /></div>
              <div className="meta">
                <span className="label">WhatsApp</span>
                <span className="value">
                  <a href={waHref} target="_blank" rel="noreferrer">Chat on WhatsApp</a>
                </span>
              </div>
            </div>
          </article>

          <article className="card">
            <div className="row">
              <div className="icon-box"><HiOutlineMapPin /></div>
              <div className="meta">
                <span className="label">Address</span>
                <span className="value">
                  <a href={mapsHref} target="_blank" rel="noreferrer">
                    {a.line1}, {a.line2}, {a.district} – {a.pincode}, {a.state}
                  </a>
                </span>
              </div>
            </div>
          </article>
        </div>

        <div className="actions">
          <a className="btn-primary" href={mailHref}><HiOutlineEnvelope /> Email me</a>
          <a className="btn-ghost" href={waHref} target="_blank" rel="noreferrer">
            <HiOutlineChatBubbleLeftRight /> WhatsApp
          </a>
          <Link to="/" className="btn-ghost"><HiHeart /> Back to {SITE.name}</Link>
        </div>
      </div>
    </div>
  );
};

export default Contact;
