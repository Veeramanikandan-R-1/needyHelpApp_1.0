import React, { useEffect, useState } from 'react'
import Logo from '../common/logo'
import { FaBars } from "react-icons/fa";
import { Link as LinkS } from "react-scroll";
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../common/theme-toggle';

const Navbar = ({ toggle }) => {
  const [scrollNav, setScrollNav] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrollNav(window.scrollY >= 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkProps = { smooth: true, duration: 500, spy: true, exact: 'true', offset: -80, activeClass: 'active' };

  return (
    <nav className={`nav-bar${scrollNav ? ' scrolled' : ''}`} aria-label="Primary">
      <div className='nav-container'>
        <Logo />
        <button
          type="button"
          className='mobile-icon'
          onClick={toggle}
          aria-label="Open menu"
          aria-expanded="false"
        >
          <FaBars />
        </button>
        <ul className="nav-menu">
          <li className='nav-item'>
            <LinkS to="what" {...linkProps} className='nav-links'>What we do</LinkS>
          </li>
          <li className='nav-item'>
            <LinkS to="how" {...linkProps} className='nav-links'>How it works</LinkS>
          </li>
          <li className='nav-item'>
            <LinkS to="impact" {...linkProps} className='nav-links'>Impact</LinkS>
          </li>
          <li className='nav-item'>
            <Link to="/about" className='nav-links'>About</Link>
          </li>
          <li className='nav-item'>
            <Link to="/contact" className='nav-links'>Contact</Link>
          </li>
        </ul>
        <div className='nav-button'>
          <ThemeToggle />
          {user ? (
            <Link className='nav-button-link' to="/dashboard">Dashboard</Link>
          ) : (
            <>
              <Link className='nav-button-ghost' to="/login">Sign in</Link>
              <Link className='nav-button-link' to="/signup">Get started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar