import React, { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { Select, MenuItem, InputLabel, TextField } from "@mui/material";

const AddOffer = () => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Elektronika");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Dodano: ${title}, ${category}, ${description}`);
    // tutaj można dodać POST do API
  };

  return (
    <Container className="mt-4">
      <h2>Dodaj ofertę</h2>
      <Form onSubmit={handleSubmit}>
        <TextField fullWidth label="Tytuł" value={title} onChange={(e) => setTitle(e.target.value)} className="mb-3" />
        <InputLabel>Kategoria</InputLabel>
        <Select fullWidth value={category} onChange={(e) => setCategory(e.target.value)} className="mb-3">
          <MenuItem value="Elektronika">Elektronika</MenuItem>
          <MenuItem value="Meble">Meble</MenuItem>
          <MenuItem value="Książki">Książki</MenuItem>
        </Select>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Opis"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mb-3"
        />
        <Button variant="primary" type="submit">Dodaj ofertę</Button>
      </Form>
    </Container>
  );
};

export default AddOffer;
