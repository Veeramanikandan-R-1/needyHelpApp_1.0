import React from 'react'
import { Link as LinkS } from "react-scroll";
import { IoClose } from "react-icons/io5";
import { Link } from 'react-router-dom';

const SideBar = ({toggle}) => {
    return (
        <div className='sidebar-container'>
            <div className='close-icon' onClick={toggle}>
                <IoClose />
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
                        onClick={toggle}
                    >About</LinkS>
                </li>
            </ul>
            <ul className="nav-menu">
                <li className='nav-item'>
                    <LinkS to="donate/receive"
                        smooth={true}
                        duration={500}
                        spy={true}
                        exact="true"
                        offset={-80}
                        className='nav-links'
                        onClick={toggle}
                    >Donate/Recieve</LinkS>
                </li>
            </ul>
            <ul className="nav-menu">
                <li className='nav-item'>
                    <LinkS to="about"
                        smooth={true}
                        duration={500}
                        spy={true}
                        exact="true"
                        offset={-80}
                        className='nav-links'
                        onClick={toggle}
                    >Services</LinkS>
                </li>
            </ul>
            <ul className="nav-menu">
                <li className='nav-item'>
                    <LinkS to="contact"
                        smooth={true}
                        duration={500}
                        spy={true}
                        exact="true"
                        offset={-80}
                        className='nav-links'
                        onClick={toggle}
                    >Contact</LinkS>
                </li>
                <Link className='nav-button-link' to="signin">Sign In</Link>
            </ul>
        </div>
    )
}

export default SideBar