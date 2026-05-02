import React, { useEffect } from 'react'
import { Link as LinkS } from "react-scroll";
import { IoClose } from "react-icons/io5";
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SideBar = ({ toggle }) => {
    const { user } = useAuth();
    const linkProps = { smooth: true, duration: 500, spy: true, exact: 'true', offset: -80, onClick: toggle };

    // Lock body scroll & close on Escape while sidebar is open
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e) => { if (e.key === 'Escape') toggle(); };
        document.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prev;
            document.removeEventListener('keydown', onKey);
        };
    }, [toggle]);

    return (
        <div className='sidebar-container' role="dialog" aria-modal="true" aria-label="Site menu">
            <button type="button" className='close-icon' onClick={toggle} aria-label="Close menu">
                <IoClose />
            </button>
            <ul className="nav-menu">
                <li className='nav-item'><LinkS to="what" {...linkProps} className='nav-links'>What we do</LinkS></li>
                <li className='nav-item'><LinkS to="how" {...linkProps} className='nav-links'>How it works</LinkS></li>
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