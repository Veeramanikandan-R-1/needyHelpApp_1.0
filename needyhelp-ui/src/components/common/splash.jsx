import React from 'react';
import { HiHeart } from 'react-icons/hi2';
import './splash.scss';

/** Branded full-screen loading splash. Used by ProtectedRoute/RoleRoute/Profile. */
const Splash = ({ label = 'Loading…' }) => (
  <div className="splash" role="status" aria-live="polite">
    <div className="ring" aria-hidden="true">
      <HiHeart />
    </div>
    <span className="label">{label}</span>
  </div>
);

export default Splash;
