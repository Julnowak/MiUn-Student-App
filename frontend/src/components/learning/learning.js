import React from 'react';

const Learning = () => {
  return (
    <div className="container mt-4 p-4rounded">
      {/* Learning Section */}
      <div className="mb-4">
        <h2 className="text-center fw-bold mb-3">Nauka</h2>
        <div className="mb-3">
          <label className="form-label">Filtruj</label>
          <input type="text" placeholder="np. wydział, kierunek, przedmiot" className="form-control" />
        </div>
        <div className="mb-3">
          <label className="form-label">Wyszukaj Literaturę:</label>
          <div className="input-group">
            <input type="text" className="form-control" />
            <button className="btn btn-secondary">Szukaj</button>
          </div>
        </div>
        <hr />
        <div className="mb-3">
          <p className="fw-bold">Tytuł</p>
          <p>informacje, link z publikacją, link do pobrania</p>
        </div>
        <hr />
        <p className="text-center">Jeżeli nie ma jeszcze tego zasobu dodaj go:</p>
        <div className="mt-3">
          <label className="form-label">Tytuł</label>
          <input type="text" className="form-control mb-2" />
          <label className="form-label">informacje, link z publikacją, link do pobrania</label>
          <input type="text" className="form-control mb-2" />
          <button className="btn btn-success w-100">Dodaj</button>
        </div>
      </div>

      {/* Test Section */}
      <hr className="my-4" />
      <div>
        <h2 className="text-center fw-bold mb-3">Testy</h2>
        <p className="text-center mb-3">Podaj przedmiot oraz tematykę a my stworzymy dla ciebie test, który pomoże ci w nauce</p>
        <div className="mb-3">
          <label className="form-label">Podaj przedmiot</label>
          <input type="text" className="form-control" />
        </div>
        <div className="mb-3">
          <label className="form-label">Podaj tematykę:</label>
          <input type="text" className="form-control" />
        </div>
        <button className="btn btn-secondary w-100">Stwórz</button>
      </div>
    </div>
  );
};

export default Learning;
