import React from "react";
import { Container, Card, Row, Col } from "react-bootstrap";

// W prawdziwej aplikacji dane będą pochodzić z backendu i być filtrowane po użytkowniku
const myOffers = [
  { id: 1, title: "Stary laptop", category: "Elektronika", description: "Sprzedam tanio" },
  { id: 2, title: "Fotel biurowy", category: "Meble", description: "Wygodny, obrotowy" },
];

const MyOffers = () => (
  <Container className="mt-4">
    <h2>Moje oferty</h2>
    <Row>
      {myOffers.map((offer) => (
        <Col md={4} key={offer.id} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>{offer.title}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">{offer.category}</Card.Subtitle>
              <Card.Text>{offer.description}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  </Container>
);

export default MyOffers;
