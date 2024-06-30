import React, { useState } from 'react';
import "./index.scss";
import globeVideo from '../../assets/videos/globe.mp4';
import Navbar from './navbar';
import SideBar from './sidebar';
import CustomButton from '../common/custom-button';
import { useNavigate } from 'react-router-dom';
import SectionComponent from './section-component';

const LandingPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggle = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div className='landing-container'>
      <Navbar toggle={toggle}/>
      {isOpen && <SideBar isOpen={isOpen} toggle={toggle}/>}
      <div className="hero-section">
        <video id="background-video" autoPlay loop muted>
          <source src={globeVideo} type="video/mp4" />
        </video>
        <div className="hero-content">
          <p className='main-title'>Help the needs..</p>
          <p>“No one is useless in this world who lightens the burdens of another.” ― Charles Dickens</p>
          <CustomButton buttonText="Get Started" onClick={()=>navigate("signup")}/>
        </div>
      </div>
      <div id="about">
        <SectionComponent />
      </div>
      <div id="donate/recieve">Donate/Receive</div>
      <div id="services">Services</div>
      <div id="signup">Sign up</div>
      <div id="contact">contact</div>
    </div>
  )
}

export default LandingPage