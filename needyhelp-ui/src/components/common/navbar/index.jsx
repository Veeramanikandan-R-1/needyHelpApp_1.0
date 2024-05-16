import { Link } from "react-router-dom";
import "./index.scss";
import Logo from "../logo";

const Navbar = () => {
    return (
        <div className="nav-container">
            <Logo />
            <nav className="nav-links">
                <Link to={`about`}>Home</Link>
                <Link to={`contact`}>Program</Link>
                <Link to={`contact`}>Stories</Link>
                <Link to={`contact`}>Blog</Link>
                <Link to={`contact`}>About</Link>
            </nav>
        </div>
    )
}

export default Navbar