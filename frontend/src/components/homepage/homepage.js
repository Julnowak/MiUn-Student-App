import React from 'react';
import {Link} from "react-router-dom";
import {Button} from "react-bootstrap";


const Homepage = () => {

    return (
        <div>
            {/* Hero Section */}
            <header
                className="header d-flex flex-column align-items-center justify-content-center text-center py-5 bg-primary text-white min-vh-60">
                <h2 className="display-4 fw-bold">Smart Home Solutions with Dwello</h2>
                <p className="lead w-50">Manage and monitor your smart home effortlessly with our intuitive
                    platform.</p>
                <Button as={Link} to="/get-started" variant="light" className="mt-3 fw-semibold shadow">Get
                    Started</Button>
            </header>
        </div>
    );
};

export default Homepage;