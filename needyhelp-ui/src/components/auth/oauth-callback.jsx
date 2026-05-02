import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { setAccessToken } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

// Google OAuth lands here with #token=<jwt> in the URL hash.
// Pull the token, hand it to AuthContext, then redirect to /dashboard.
const OAuthCallback = () => {
  const navigate = useNavigate();
  const { refresh } = useAuth() ?? {};
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const hash = window.location.hash.replace(/^#/, '');
    const params = new URLSearchParams(hash);
    const token = params.get('token');

    if (!token) {
      toast.error('Sign-in failed');
      navigate('/login', { replace: true });
      return;
    }

    setAccessToken(token);
    // Decode payload to seed user immediately
    try {
      JSON.parse(atob(token.split('.')[1]));
    } catch {}

    // Clean URL then go to dashboard. Force a full reload so AuthContext re-bootstraps from /refresh cookie.
    window.history.replaceState({}, '', '/dashboard');
    window.location.replace('/dashboard');
  }, [navigate, refresh]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: '#0a0d10',
      color: '#9aa3ab',
      fontSize: '0.95rem',
    }}>
      Completing sign-in…
    </div>
  );
};

export default OAuthCallback;
