import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { TextField, Select, MenuItem, InputLabel } from "@mui/material";
import Paginator from "../../paginator/paginator";
import { Link } from "react-router-dom";

const categories = ["Wszystkie", "Elektronika", "Meble", "Książki"];

const Exchange = () => {
  const [offers, setOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("Wszystkie");
  const [currentPage, setCurrentPage] = useState(1);

  // Przykładowe dane
  const allOffers = [
    { id: 1, title: "iPhone 12", category: "Elektronika", description: "Używany, jak nowy" },
    { id: 2, title: "Kanapa 3-osobowa", category: "Meble", description: "Bardzo wygodna" },
    { id: 3, title: "Harry Potter", category: "Książki", description: "Cała seria" },
    // Dodaj więcej
  ];

  useEffect(() => {
    let filtered = allOffers.filter((offer) =>
      offer.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (category === "Wszystkie" || offer.category === category)
    );
    setOffers(filtered);
  }, [searchTerm, category, currentPage]);

  const offersPerPage = 3;
  const totalPages = Math.ceil(offers.length / offersPerPage);
  const paginatedOffers = offers.slice(
    (currentPage - 1) * offersPerPage,
    currentPage * offersPerPage
  );

  return (
    <Container className="mt-4">
      <Row className="mb-3">
        <Col md={3}>
          <InputLabel>Kategoria</InputLabel>
          <Select
            fullWidth
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
        </Col>
        <Col md={6}>
          <TextField
            fullWidth
            label="Szukaj"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={3} className="d-flex justify-content-end">
          <Link to="/add-offer">
            <Button variant="success" className="mt-3">+ Dodaj ofertę</Button>
          </Link>
        </Col>
      </Row>

      <Row>
        {paginatedOffers.length > 0 ? (
          paginatedOffers.map((offer) => (
            <Col md={4} key={offer.id} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>{offer.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">{offer.category}</Card.Subtitle>
                  <Card.Text>{offer.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p className="text-center">Brak ofert do wyświetlenia.</p>
        )}
      </Row>

      <Row>
        <Col className="d-flex justify-content-center">
          <Paginator
            totalPages={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Exchange;
