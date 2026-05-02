import { Link, useLocation } from "react-router-dom";
import { HiArrowLeft, HiHeart } from "react-icons/hi2";
import "./error-page.scss";

export default function ErrorPage() {
    // We use BrowserRouter (not the data router), so this is the catch-all 404.
    const location = useLocation();
    const is404 = true;
    const error = null;
    const code = is404 ? '404' : (error?.status || 'Error');
    const title = is404 ? "Page not found" : "Something went wrong";
    const detail = is404
        ? `We couldn't find a page at ${location.pathname}.`
        : (error?.statusText || error?.message || "Try refreshing or come back later.");

    return (
        <div className="error-page">
            <div className="error-card">
                <div className="brand"><HiHeart /> needyHelp</div>
                <span className="code">{code}</span>
                <h1>{title}</h1>
                <p>{detail}</p>
                <div className="actions">
                    <Link to="/" className="btn-primary"><HiArrowLeft /> Back to home</Link>
                </div>
            </div>
        </div>
    );
}
