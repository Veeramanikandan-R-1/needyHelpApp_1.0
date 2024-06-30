import React, { useEffect, useState } from 'react'
import Logo from '../common/logo'
import { FaBars } from "react-icons/fa";
import { Link as LinkS } from "react-scroll";
import { Link } from 'react-router-dom';

const Navbar = ({toggle}) => {
  const [scrollNav, setScrollNav] = useState(false);

  const changeNav = () => {
    if (window.scrollY >= 80) {
      setScrollNav(true);
    } else {
      setScrollNav();
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", changeNav);
  }, []);

  return (
    <nav className='nav-bar' style={{background: scrollNav ? "#000" : "transparent"}}>
      <div className='nav-container'>
        <Logo />
        <div className='mobile-icon' onClick={toggle}>
          <FaBars />
        </div>
        <ul className="nav-menu">
          <li className='nav-item'>
            <LinkS to="about"
              smooth={true}
              duration={500}
              spy={true}
              exact="true"
              offset={-80}
              className='nav-links'
              >About</LinkS>
          </li>
          <li className='nav-item'>
            <LinkS to="donate"
              smooth={true}
              duration={500}
              spy={true}
              exact="true"
              offset={-80}
              className='nav-links'
              >Donate/Receive</LinkS>
          </li>
          <li className='nav-item'>
            <LinkS to="services"
              smooth={true}
              duration={500}
              spy={true}
              exact="true"
              offset={-80}
              className='nav-links'
              >Services</LinkS>
          </li>
          <li className='nav-item'>
            <LinkS to="signup"
              smooth={true}
              duration={500}
              spy={true}
              exact="true"
              offset={-80}
              className='nav-links'
              >Sign Up</LinkS>
          </li>
          <li className='nav-item'>
            <LinkS to="contact"
              smooth={true}
              duration={500}
              spy={true}
              exact="true"
              offset={-80}
              className='nav-links'
              >Contact</LinkS>
          </li>
        </ul>
        <nav className='nav-button'>
          <Link className='nav-button-link' to="/signin">Sign In</Link>
        </nav>
      </div>
    </nav>
  )
}

export default Navbar