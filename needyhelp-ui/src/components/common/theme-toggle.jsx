import React from 'react';
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi2';
import { useTheme } from '../../context/ThemeContext';
import './theme-toggle.scss';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggle } = useTheme();
  const isLight = theme === 'light';
  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={toggle}
      aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      aria-pressed={isLight}
      title={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
    >
      <span className="theme-toggle__track" aria-hidden="true">
        <span className="theme-toggle__thumb">
          {isLight ? <HiOutlineSun /> : <HiOutlineMoon />}
        </span>
      </span>
    </button>
  );
};

export default ThemeToggle;
