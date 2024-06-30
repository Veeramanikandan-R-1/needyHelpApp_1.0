import React from 'react';
import './index.scss';
import { Link } from 'react-router-dom';
import { animateScroll as scroll } from "react-scroll";

const Logo = () => {
  const toggleHome = () => {
    scroll.scrollToTop();
  };
  
  return (
    <Link className='logo-container' to="/" onClick={toggleHome}>
      needYHelp
    </Link>
  )
}

export default Logo