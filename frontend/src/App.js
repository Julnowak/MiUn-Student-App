import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Homepage from "./components/homepage/homepage";
import Login from "./components/login/login";
import CustomNavbar from "./components/navbar/navbar";
import Footer from "./components/footer/footer";
import React from "react";
import UserProfile from "./components/userProfile/userProfile";
import Main from "./components/main/main";
import {AuthProvider} from "./AuthContext";
import Logout from "./components/logout/logout";
import Community from "./components/community/community";
import MyCalendar from "./components/myCalendar/myCalendar";
import ProgiPunktowe from "./components/progiPunktowe/progiPunktowe";
import About from "./components/about/about";
import Contact from "./components/contact/contact";
import Locations from "./components/locations/locations";
import Learning from "./components/learning/learning";
import Register from "./components/register/register";
import Notifications from "./components/notifications/notifications";
import Donations from "./components/donations/donations";
import Exchange from "./components/exchange/exchange";
import MyOffers from "./components/exchange/myOffers";
import Groups from "./components/groups/groups";
import Actualities from "./components/actualities/actualities";
import NotFoundPage from "./components/notFoundPage/notFoundPage";
import Forum from "./components/forum/forum";
import OfferPage from "./components/exchange/offerPage";
import GroupPage from "./components/groups/groupPage";
import EmailVerification from "./components/userProfile/verification";
import StudentGradesPage from "./components/grades/studentGradesPage";
import SchedulePage from "./components/plan/plan";
import StudentChecklist from "./components/checklist/studentCheclist";

function App() {
    return (
        <div className={`App`}>
            <BrowserRouter>
                <AuthProvider>
                {/* Navbar */}
                <CustomNavbar/>

                <div className="background-main min-vh-100">
                    <Routes>
                        <Route path="/" element={<Homepage/>}/>
                        <Route path="/userProfile" element={<UserProfile/>}/>
                        <Route path="/notifications" element={<Notifications/>}/>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/register" element={<Register/>}/>
                        <Route path="/logout" element={<Logout/>}/>
                        <Route path="/main" element={<Main/>}/>
                        <Route path="/verify-email" element={<EmailVerification />} />

                        <Route path="/community" element={<Community/>}/>
                        <Route path="/calendar" element={<MyCalendar/>}/>
                        <Route path="/pierogi" element={<ProgiPunktowe/>}/>
                        <Route path="/localizations" element={<Locations/>}/>
                        <Route path="/localizations/:id" element={<Locations />} />
                        <Route path="/learning" element={<Learning/>}/>

                        <Route path="/about" element={<About/>}/>
                        <Route path="/contact" element={<Contact/>}/>
                        <Route path="/grades" element={<StudentGradesPage/>}/>
                        <Route path="/donations" element={<Donations/>}/>
                        <Route path="/schedule" element={<SchedulePage/>}/>
                        <Route path="/studentCheclist" element={<StudentChecklist/>}/>

                        <Route path="/exchanges" element={<Exchange />} />
                        <Route path="/my-offers" element={<MyOffers />} />

                        <Route path="/groups" element={<Groups />} />
                        <Route path="/group/:id" element={<GroupPage />} />

                        <Route path="/actual-info" element={<Actualities />} />
                        <Route path="/forum" element={<Forum />} />
                        <Route path="/offer/:id" element={<OfferPage />} />
                        <Route path="*" element={<NotFoundPage />} />

                    </Routes>
                </div>
                {/* Routes */}


                {/* Footer */}
                <Footer/>
                </AuthProvider>
            </BrowserRouter>
        </div>
    );
}

export default App;
