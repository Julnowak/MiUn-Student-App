import React, {useContext, useEffect, useState} from 'react';
import {Container, Nav, Navbar} from "react-bootstrap";
import "./navbar.css"
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import {AuthContext} from "../../AuthContext";
import {LogoutRounded} from "@mui/icons-material";
import client from "../../client";
import {API_BASE_URL} from "../../config";

const CustomNavbar = () => {
    const {isAuthenticated} = useContext(AuthContext);
    const [image, setImage] = useState(null);
    const token = localStorage.getItem("access");
    const image_set = localStorage.getItem("image_set")
    let flag = false;

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await client.get(API_BASE_URL + "user/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setImage(response.data.profile_picture.slice(15));
                localStorage.setItem("image_set", response.data.profile_picture.slice(15))
            } catch (error) {
                console.log("Nie udało się zalogować");
            }
        };

        if (!flag){
            if (token && !image_set) {
                fetchUserData();
            }
            else {
                setImage(image_set)
            }
            flag = true;
        }


    }, [image, image_set, token]);

    return (
        <div>
            {/* Navbar */}
            <Navbar expand="lg" variant="dark" className="shadow-sm"  style={{ backgroundColor: "black"}}>
                <Container>
                    <Navbar.Brand className="text-primary fw-bold">
                        <Nav.Link href="/">
                            <img style={{display: "inline", marginRight: 10}} width={50} src={"/icons/kitty.ico"}/>
                        </Nav.Link>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls=" basic-navbar-nav"/>
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto" style={{alignItems: "center"}}>
                            {!isAuthenticated ?
                                null
                                :
                                <Nav.Link href="/main" className="text-white"><HomeRoundedIcon/></Nav.Link>
                            }


                            {/*<Nav.Link as={Link} to="/manage" className="text-white">Zarządzaj</Nav.Link>*/}

                            {!isAuthenticated ?
                                <>
                                    <Nav.Link href="/about" className="text-white">O nas</Nav.Link>
                                    <Nav.Link href="/contact" className="text-white">Kontakt</Nav.Link>
                                </>
                                :
                                <>
                                    <Nav.Link href="/pierogi" className="text-white">Progi punktowe</Nav.Link>
                                    <Nav.Link href="/calendar" className="text-white">Kalendarz</Nav.Link>
                                    <Nav.Link href="/community" className="text-white">Społeczność</Nav.Link>
                                    <Nav.Link href="/localizations" className="text-white">Lokacje</Nav.Link>
                                    <Nav.Link href="/learning" className="text-white">Nauka</Nav.Link>
                                </>
                            }

                            {!isAuthenticated ?
                                null
                                :
                                <Nav.Link href="/userProfile" className="text-white">
                                    <AccountCircleRoundedIcon width={35} className="text-white"/>
                                </Nav.Link>
                            }

                            {!isAuthenticated ?
                                <Nav.Link href="/login" className="text-white"><LoginRoundedIcon/></Nav.Link> :
                                <Nav.Link href="/logout" className="text-white"><LogoutRounded/></Nav.Link>}

                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </div>
    );
};

export default CustomNavbar;