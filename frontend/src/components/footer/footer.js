import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { Link } from "react-router-dom"; // Użyj jeśli masz routing w aplikacji


const Footer = () => {
  return (
    <footer className="footer bg-dark text-white py-4">
      <div className="container text-center text-md-start">
        <div className="row">
          {/* Sekcja linków */}
          <div className="col-md-4 mb-3">
            <h5>Szybkie linki</h5>
            <ul className="list-unstyled">
              <li><Link to="/about" className="text-white text-decoration-none">O nas</Link></li>
              <li><Link to="/contact" className="text-white text-decoration-none">Kontakt</Link></li>
              <li><Link to="/privacy-policy" className="text-white text-decoration-none">Polityka prywatności</Link></li>
            </ul>
          </div>

          {/* Sekcja kontaktu */}
          <div className="col-md-4 mb-3">
            <h5>Kontakt</h5>
            <p>Email: <a href="mailto:kontakt@example.com" className="text-white">kontakt@example.com</a></p>
            <p>Telefon: +48 123 456 789</p>
          </div>

          {/* Sekcja social media */}
          <div className="col-md-4 mb-3">
            <h5>Śledź nas</h5>
            <div className="d-flex gap-3">
              <a href="#" className="text-white fs-4"><FaFacebook /></a>
              <a href="#" className="text-white fs-4"><FaTwitter /></a>
              <a href="#" className="text-white fs-4"><FaInstagram /></a>
              <a href="#" className="text-white fs-4"><FaLinkedin /></a>
            </div>
          </div>
        </div>
      </div>

      {/* Stopka z prawami autorskimi */}
      <div className="text-center mt-3 border-top pt-3">
        &copy; {new Date().getFullYear()} TwojaFirma. Wszelkie prawa zastrzeżone.
      </div>
    </footer>
  );
};

export default Footer;