import React, { useState } from 'react';
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';

/**
 * Password input with show/hide toggle. Drop-in replacement for <input type="password">.
 * Reused by login.jsx, signup.jsx, profile/security tab.
 */
const PasswordField = ({
  id, value, onChange, onBlur, placeholder = '••••••••',
  autoComplete = 'current-password', invalid, describedBy,
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="pwd-wrap">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={!!invalid}
        aria-describedby={describedBy}
      />
      <button
        type="button"
        className="pwd-toggle"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? 'Hide password' : 'Show password'}
        aria-pressed={show}
        tabIndex={-1}
      >
        {show ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
      </button>
    </div>
  );
};

export default PasswordField;
