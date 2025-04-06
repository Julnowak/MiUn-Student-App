import React, { useState } from 'react';

const Donations = () => {
  const [amount, setAmount] = useState('');
  const suggestedAmounts = [5, 10, 15];

  const handleSuggestedClick = (value) => {
    setAmount(value.toString());
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleDonate = () => {
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      alert('Podaj poprawną kwotę donacji.');
      return;
    }

    const paymentUrl = `https://example-payment.com?amount=${numericAmount}`;
    window.location.href = paymentUrl;
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <div className="card shadow">
        <div className="card-body text-center">
          <h4 className="card-title mb-4">Wesprzyj nas!</h4>
          <div className="mb-3 d-flex justify-content-center gap-2 flex-wrap">
            {suggestedAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => handleSuggestedClick(amt)}
                className={`btn ${
                  amount === amt.toString() ? 'btn-success' : 'btn-outline-secondary'
                }`}
              >
                {amt} zł
              </button>
            ))}
          </div>
          <input
            type="text"
            className="form-control mb-3 text-center"
            placeholder="Wpisz własną kwotę"
            value={amount}
            onChange={handleInputChange}
          />
          <button className="btn btn-primary w-100" onClick={handleDonate}>
            Przejdź do płatności
          </button>
        </div>
      </div>
    </div>
  );
};

export default Donations;
