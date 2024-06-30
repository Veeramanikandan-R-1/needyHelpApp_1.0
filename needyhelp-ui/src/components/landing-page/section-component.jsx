import React from 'react'
import "./index.scss";
import aboutImg from "../../assets/images/about.png";
import CustomButton from '../common/custom-button';

const SectionComponent = () => {
  return (
    <div className='section-container'>
        <div className='sec-content'>
            <p className='sec-title'>A VOLUNTARY ORGANIZATION</p>
            <p className='sec-description'>Help the needs by donating the items or avail it if your are in the need</p>
            <CustomButton buttonText="Get Started" />
        </div>
        <div className='image'>
            <img src={aboutImg} alt="about" className='section-img'/>
        </div>
    </div>
  )
}

export default SectionComponent