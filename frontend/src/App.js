import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Homepage from "./components/homepage/homepage";
import Login from "./components/login/login";
import CustomNavbar from "./components/navbar/navbar";
import Footer from "./components/footer/footer";
import { ThemeContext } from "./Theme";
import React, {useContext} from "react";
import UserProfile from "./components/userProfile/userProfile";
import Main from "./components/main/main";
import {AuthProvider} from "./AuthContext";
import Logout from "./components/logout/logout";

function App() {
    const { theme } = useContext(ThemeContext);

    return (
        <div className={`App ${theme}`}>
            <BrowserRouter>
                <AuthProvider>
                {/* Navbar */}
                <CustomNavbar/>

                <div className="background-main min-vh-100">
                    <Routes>
                        <Route path="/" element={<Homepage/>}/>
                        <Route path="/userProfile" element={<UserProfile/>}/>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/logout" element={<Logout/>}/>
                        <Route path="/main" element={<Main/>}/>
                    </Routes>
                </div>
                {/* Routes */}


                {/* Footer */}
                <Footer/>
                {/*<CookieConsent/>*/}
                </AuthProvider>
            </BrowserRouter>
        </div>
    );
}

export default App;
