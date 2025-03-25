import React, { useContext, useState } from 'react';
import { Link } from "react-router-dom";
import { Container, Button, Form, Card, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext";

const Register = () => {
    const { registerUser, errmess, setErrmess } = useContext(AuthContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordSecond, setPasswordSecond] = useState("");

    async function submitRegistration(event) {
        event.preventDefault();
        await registerUser(username, email, password, passwordSecond);
    }

    // Clear error message when user types
    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
        if (errmess) setErrmess(null); // Clear error message on new input
    };

    return (
        <Container className="d-flex justify-content-center align-items-center min-vh-100">
            <Card className="p-4 shadow" style={{ width: "350px" }}>
                <h3 className="text-center text-primary">Rejestracja</h3>

                {/* Display error message if registration fails */}
                {errmess && <Alert variant="danger" className="text-center">{errmess}</Alert>}

                <Form onSubmit={submitRegistration}>
                    <Form.Group className="mb-3" controlId="username">
                        <Form.Label>Nazwa użytkownika</Form.Label>
                        <Form.Control
                            value={username}
                            onChange={handleInputChange(setUsername)}
                            type="text"
                            placeholder="Wprowadź nazwę użytkownika"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            value={email}
                            onChange={handleInputChange(setEmail)}
                            type="email"
                            placeholder="Wprowadź email"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="password">
                        <Form.Label>Hasło</Form.Label>
                        <Form.Control
                            value={password}
                            onChange={handleInputChange(setPassword)}
                            type="password"
                            placeholder="Wprowadź hasło"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="password_second">
                        <Form.Label>Powtórz hasło</Form.Label>
                        <Form.Control
                            value={passwordSecond}
                            onChange={handleInputChange(setPasswordSecond)}
                            type="password"
                            placeholder="Wprowadź hasło"
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" className="w-100">Zarejestruj się</Button>
                </Form>

                <p className="text-center mt-3">
                    Masz już konto? <Link to="/login">Zaloguj się</Link>
                </p>
            </Card>
        </Container>
    );
};

export default Register;
