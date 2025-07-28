import "./Footer.scss";
import logo from "../../assets/logo.png";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-top">
                <div className="footer-col logo-col">
                    <img src={logo} alt="Cinease Logo" className="footer-logo" />
                    <div className="footer-desc">
                        Vietnam's leading modern cinema system, bringing you the ultimate movie experience.
                    </div>
                    <div className="footer-social">
                        <a href="https://www.facebook.com/khanhhung2712" className="social-icon"><i className="fa-brands fa-facebook"></i></a>
                        <a href="https://www.instagram.com/hux.hung27" className="social-icon"><i className="fa-brands fa-instagram"></i></a>
                        <a href="https://www.youtube.com/@hux.hung27" className="social-icon"><i className="fa-brands fa-youtube"></i></a>
                        <a href="https://www.tiktok.com/@hux.hung27" className="social-icon"><i className="fa-brands fa-tiktok"></i></a>
                    </div>
                </div>
                <div className="footer-col">
                    <div className="footer-title">Cinease Cinema</div>
                    <ul>
                        <li>About Us</li>
                        <li>News & Promotions</li>
                        <li>Careers</li>
                        <li>Advertising Contact</li>
                        <li>Terms of Use</li>
                    </ul>
                </div>
                <div className="footer-col">
                    <div className="footer-title">Support</div>
                    <ul>
                        <li>Feedback & Complaints</li>
                        <li>FAQs</li>
                        <li>Privacy Policy</li>
                        <li>Rules & Terms</li>
                    </ul>
                </div>
                <div className="footer-col">
                    <div className="footer-title">Contact</div>
                    <ul>
                        <li><i className="fa-solid fa-location-dot"></i> Thu Duc City, Ho Chi Minh City</li>
                        <li><i className="fa-solid fa-phone"></i> Contact: 1900 7788</li>
                        <li><i className="fa-solid fa-envelope"></i> cinease@gmail.com</li>
                    </ul>
                    <div className="footer-title">Accepted Payments</div>
                    <div className="footer-payments">
                        <i className="fa-brands fa-cc-visa payment-icon"></i>
                        <i className="fa-brands fa-cc-mastercard payment-icon"></i>
                        <i className="fa-brands fa-cc-jcb payment-icon"></i>
                        <i className="fa-brands fa-cc-paypal payment-icon"></i>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <hr />
                <div className="footer-copyright">
                    © 2025 Cinease Cinema. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
