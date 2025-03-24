import React, { useState } from 'react';
import { Button, Form, Container, Row, Col, Card } from 'react-bootstrap';

const ProgiPunktowe = () => {
  const [formData, setFormData] = useState({
    interests: '',
    subjects: '',
    preferences: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [calculationResult, setCalculationResult] = useState(null);

  // Funkcja do aktualizacji stanu formularza
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Funkcja do obliczania wyniku
  const calculateResult = () => {
    const score = formData.interests.length + formData.subjects.length + formData.preferences.length;
    setCalculationResult(`Twój wynik to: ${score} punktów.`);
  };

  // Funkcje nawigacji między stronami
  const nextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const previousPage = () => {
    setCurrentPage(currentPage - 1);
  };

  return (
    <Container className="my-5">
      <h1 className="mb-4 text-center">Formularz Progi Punktowe</h1>

      <Card>
        <Card.Body>
          <Form>
            {currentPage === 1 && (
              <div>
                <h4>Twoje zainteresowania</h4>
                <Form.Group controlId="interests">
                  <Form.Label>Wpisz swoje zainteresowania</Form.Label>
                  <Form.Control
                    type="text"
                    name="interests"
                    value={formData.interests}
                    onChange={handleInputChange}
                    placeholder="Np. matematyka, informatyka"
                  />
                </Form.Group>
              </div>
            )}

            {currentPage === 2 && (
              <div>
                <h4>Zdawane przedmioty na maturze</h4>
                <Form.Group controlId="subjects">
                  <Form.Label>Wpisz przedmioty maturalne</Form.Label>
                  <Form.Control
                    type="text"
                    name="subjects"
                    value={formData.subjects}
                    onChange={handleInputChange}
                    placeholder="Np. matematyka, fizyka"
                  />
                </Form.Group>
              </div>
            )}

            {currentPage === 3 && (
              <div>
                <h4>Twoje preferencje</h4>
                <Form.Group controlId="preferences">
                  <Form.Label>Wpisz swoje preferencje</Form.Label>
                  <Form.Control
                    type="text"
                    name="preferences"
                    value={formData.preferences}
                    onChange={handleInputChange}
                    placeholder="Np. kierunek studiów, miejsce zamieszkania"
                  />
                </Form.Group>
              </div>
            )}

            {currentPage === 4 && (
              <div>
                <h4>Podsumowanie i kalkulacja</h4>
                <p>Twoje zainteresowania: {formData.interests}</p>
                <p>Zdawane przedmioty na maturze: {formData.subjects}</p>
                <p>Twoje preferencje: {formData.preferences}</p>
                <Button variant="primary" onClick={calculateResult}>
                  Oblicz wynik
                </Button>

                {calculationResult && <p className="mt-3">{calculationResult}</p>}
              </div>
            )}

            <Row className="mt-4">
              <Col className="text-left">
                {currentPage > 1 && (
                  <Button variant="secondary" onClick={previousPage}>
                    Wstecz
                  </Button>
                )}
              </Col>
              <Col className="text-right">
                {currentPage < 4 ? (
                  <Button variant="primary" onClick={nextPage}>
                    Dalej
                  </Button>
                ) : (
                  <Button variant="success" onClick={calculateResult}>
                    Oblicz wynik
                  </Button>
                )}
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProgiPunktowe;
