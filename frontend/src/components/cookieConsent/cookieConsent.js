import { useState, useEffect } from "react";

const CookieConsent = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consentGiven = localStorage.getItem("cookieConsent");
    if (!consentGiven) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 p-4 bg-gray-800 text-white rounded-lg shadow-lg flex justify-between items-center">
      <p>Ta strona używa plików cookies, aby zapewnić najlepsze doświadczenie.</p>
      <button onClick={handleAccept} className="ml-4 bg-blue-500 px-4 py-2 rounded text-white">Akceptuję</button>
    </div>
  );
};

export default CookieConsent;
