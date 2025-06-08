import "./PaymentSuccess.scss";
import poster from "../../../assets/poster.jpg"; 
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-success-page">
      <div className="poster-section">
        <img src={poster} alt="Poster" className="movie-poster" />
        <div className="poster-title">SPIDERMAN ACROSS THE SPIDERVERSE</div>
      </div>

      <div className="success-info">
        <h2 className="success-header">Payment successfully</h2>

        <div className="info-group">
          <div className="info-label">Movie Title</div>
          <div className="info-value">SPIDERMAN ACROSS THE SPIDERVERSE</div>
        </div>

        <div className="info-group">
          <div className="info-label">Cinema</div>
          <div className="info-value">VINCOM MEGAMALL GRANDPARK</div>
          <div className="info-label">ROOM : 8</div>
        </div>

        <div className="info-group">
          <div className="info-label">Date</div>
          <div className="info-value">Mon, 26/5/2025</div>
        </div>

        <div className="info-group">
          <div className="info-label">Ticket (3)</div>
          <div className="info-value">C8, C9, C10</div>
        </div>

        <div className="info-group">
          <div className="info-label">Hours</div>
          <div className="info-value">15:40</div>
        </div>

        <h2 className="thank-you">Thank you !</h2>

        <button className="home-btn" onClick={() => navigate("/")}>
          Back to Home page
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
