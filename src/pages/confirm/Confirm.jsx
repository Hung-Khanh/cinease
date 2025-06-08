import React from 'react';
import './Confirm.scss';
import Select from 'react-select';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const options = [
  { value: 'BAPNGON', label: 'BAPNGON' },
  { value: 'CINEASE', label: 'CINEASE' },
  { value: 'CINEASEVIP', label: 'CINEASEVIP' },
];

const Confirm = () => {
  const navigate = useNavigate();

  const handleConfirm = () => {
    navigate('/payment-detail');
  };

  const handleBack = () => {
    navigate('/seat-selection');
  };

  return (
    <div className="confirm-wrapper">
      <main className="confirm-container">
        <button className="back-button" onClick={handleBack}>
          <FaArrowLeft />
        </button>

        <div className="ticket-box">
          <div className="poster">
            <img src="src/assets/z6663759604899_57baa9df4721a2c6cdcad271180353b3.jpg" alt="Poster" />
          </div>

          <div className="ticket-info">
            <h2>CONFIRM INFORMATION</h2>
            <p><strong>🎬 MOVIE </strong> <br /> SPIDERMAN ACROSS THE SPIDERVERSE</p>
            <p><strong>🎥 FORMAT:</strong> 2D</p>
            <p><strong>📅 SHOW DATE:</strong> 26/5/2025 &nbsp; <strong>⏰ SHOW TIME:</strong> 15H40</p>
            <p><strong>🏢 THEATER:</strong> Vincom Megamall GrandPark &nbsp; <strong>📽 ROOM:</strong> 8</p>
            <p><strong>💺 SEAT:</strong> C8 - C9 - C10 &nbsp; <strong>TICKET:</strong> 3</p>
            <p className="total"><strong>TOTAL:</strong> VND 90.000 x 3</p>

            {/* Select style react-select */}
            <div className="voucher-container">
              <Select
                className="voucher-select"
                classNamePrefix="voucher"
                options={options}
                isClearable
                isSearchable
                placeholder="Select or enter a voucher"
              />
            </div>

            <div className="customer-info">
              <p><strong>FULLNAME : </strong> Minh Trí</p>
              <p><strong>PHONE NUMBER :</strong> 0931122334</p>
              <p><strong>EMAIL:</strong> <a href="mailto:minhtri@gmail.com">minhtri@gmail.com</a></p>
            </div>

            <button
              className="confirm-button"
              onClick={handleConfirm}
            >
              CONFIRM
            </button>
            <p className="note">* Please confirm your ticket before payment. Tickets cannot be canceled after successful payment</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Confirm;
