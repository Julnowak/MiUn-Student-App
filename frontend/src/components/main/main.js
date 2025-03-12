import React from 'react';
import {useState, useEffect} from "react";
import {Card} from "react-bootstrap";
import {isUserAuthenticated} from "../../AuthContext"
import { Navigate } from 'react-router-dom';

const sensorsMockData = [
    {id: 1, type: "temperature", value: 22.5, unit: "°C"},
    {id: 2, type: "humidity", value: 55, unit: "%"},
    {id: 3, type: "light", value: 300, unit: "lx"},
];

const Main = () => {
    const [sensors, setSensors] = useState(sensorsMockData);
    const [ledState, setLedState] = useState(false);

    useEffect(() => {
        // Symulacja aktualizacji danych z czujników
        const interval = setInterval(() => {
            setSensors((prevSensors) =>
                prevSensors.map((sensor) => ({
                    ...sensor,
                    value: sensor.value + (Math.random() - 0.5) * 2, // Symulowana zmiana wartości
                }))
            );
        }, 5000);
        return () => clearInterval(interval);
    }, []);


    if (!isUserAuthenticated()) {
        // Redirect to login page if no token exists
        return <Navigate to="/login" />;
    }

    return (
        <div className="container min-vh-100 bg-dark text-white py-5 text-center">
            <h1 className="mb-4">Panel Zarządzania Czujnikami</h1>
            <div className="row justify-content-center">
                {sensors.map((sensor) => (
                    <div key={sensor.id} className="col-md-4 mb-4" whileHover={{scale: 1.05}}>
                        <Card className="bg-secondary text-white p-3 shadow-lg">
                            <Card.Body className="d-flex align-items-center">
                                <div className="me-3">{sensor.icon}</div>
                                <div>
                                    <Card.Title className="h5">{sensor.type}</Card.Title>
                                    <Card.Text className="h4">{sensor.value.toFixed(1)} {sensor.unit}</Card.Text>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                ))}
            </div>
            <div
                className="mt-4 p-3 bg-secondary text-white rounded shadow-lg d-flex align-items-center justify-content-center">
                {/*<Lightbulb className={ledState ? "text-warning me-3" : "text-muted me-3"}/>*/}
                <span className="h5">LED Control</span>
                {/*<Switch className="ms-3" checked={ledState} onCheckedChange={setLedState}/>*/}
            </div>
        </div>
    );
};

export default Main;