import React, { useEffect, useRef } from 'react'
import { Link as LinkS } from "react-scroll";
import { IoClose } from "react-icons/io5";
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../common/theme-toggle';

const SideBar = ({ toggle }) => {
    const { user } = useAuth();
    const linkProps = { smooth: true, duration: 500, spy: true, exact: 'true', offset: -80, onClick: toggle };
    const dialogRef = useRef(null);
    const firstFocusableRef = useRef(null);

    // Lock body scroll, focus trap, Esc to close
    useEffect(() => {
        const prevOverflow = document.body.style.overflow;
        const prevActive = document.activeElement;
        document.body.style.overflow = 'hidden';

        // Focus first interactive element in the dialog on open
        firstFocusableRef.current?.focus();

        const onKey = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                toggle();
                return;
            }
            if (e.key !== 'Tab' || !dialogRef.current) return;
            const focusables = dialogRef.current.querySelectorAll(
                'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusables.length === 0) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };
        document.addEventListener('keydown', onKey);

        return () => {
            document.body.style.overflow = prevOverflow;
            document.removeEventListener('keydown', onKey);
            if (prevActive instanceof HTMLElement) prevActive.focus();
        };
    }, [toggle]);

    return (
        <div
            className='sidebar-container is-open'
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            ref={dialogRef}
        >
            <div className="sidebar-top">
                <ThemeToggle />
                <button
                    type="button"
                    className='close-icon'
                    onClick={toggle}
                    aria-label="Close menu"
                    ref={firstFocusableRef}
                >
                    <IoClose />
                </button>
            </div>
            <ul className="nav-menu">
                <li className='nav-item'><LinkS to="what" {...linkProps} className='nav-links'>What we do</LinkS></li>
                <li className='nav-item'><LinkS to="how" {...linkProps} className='nav-links'>How it works</LinkS></li>
                <li className='nav-item'><LinkS to="impact" {...linkProps} className='nav-links'>Impact</LinkS></li>
                <li className='nav-item'><Link to="/about" onClick={toggle} className='nav-links'>About</Link></li>
                <li className='nav-item'><Link to="/contact" onClick={toggle} className='nav-links'>Contact</Link></li>
                {user
                    ? <Link className='nav-button-link' to="/dashboard" onClick={toggle}>Dashboard</Link>
                    : <Link className='nav-button-link' to="/signup" onClick={toggle}>Get started</Link>}
            </ul>
        </div>
    )
}

export default SideBar