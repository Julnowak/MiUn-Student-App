import React, {useContext, useEffect, useState} from 'react';
import {Container, Nav, Navbar, NavDropdown} from "react-bootstrap";
import {ThemeContext} from "../../Theme";
import "./navbar.css"
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import {AuthContext} from "../../AuthContext";
import {LogoutRounded} from "@mui/icons-material";
import client from "../../client";
import {API_BASE_URL} from "../../config";

const CustomNavbar = () => {
    const {theme, toggleTheme} = useContext(ThemeContext);
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
            <Navbar expand="md" className="shadow-sm">
                <Container>
                    <Navbar.Brand className="text-primary fw-bold">
                        <Nav.Link href="/">
                            <img style={{display: "inline", marginRight: 10}} width={50} src={"/images/doggo_big.png"}/>
                            <div style={{display: "inline"}}>
                                Dwello
                            </div>
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
                            <div className="header-toggle-buttons">
                                <button style={{width: 70, height: 40}} onClick={() => toggleTheme()} >{theme}</button>
                            </div>

                            {!isAuthenticated ?
                                null
                                :
                                <NavDropdown title="Zarządzaj" id="basic-nav-dropdown">
                                    <NavDropdown.Item href="/myHomes">
                                        Moje lokacje
                                    </NavDropdown.Item>
                                    <NavDropdown.Item href="/myDevices">
                                        Moje urządzenia
                                    </NavDropdown.Item>
                                    <NavDropdown.Item href="/myRooms">
                                        Moje pomieszczenia
                                    </NavDropdown.Item>
                                    <NavDropdown.Divider/>
                                    <NavDropdown.Item href="/rules">
                                        Reguły
                                    </NavDropdown.Item>
                                </NavDropdown>
                            }


                            {/*<Nav.Link as={Link} to="/manage" className="text-white">Zarządzaj</Nav.Link>*/}

                            {!isAuthenticated ?
                                null
                                :
                                <>
                                    <Nav.Link href="/dashboard" className="text-white">Wykresy</Nav.Link>
                                    <Nav.Link href="/history" className="text-white">Historia</Nav.Link>
                                </>
                            }

                            {!isAuthenticated ?
                                null
                                :
                                <Nav.Link href="/userProfile" className="text-white">
                                    <img width={35} style={{borderRadius: 17}} src={image}/>
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