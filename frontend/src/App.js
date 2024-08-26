import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
} from "react-router-dom";
import './index.css';
import Home from "./pages/Home.js";
import Lending from "./pages/Lending.js";

function App() {
    return (
        <Router>
             {/* Include the Navbar component */}
            <Routes>
                <Route exact path="/" element={<Home />} />
                <Route exact path="/app" element={<Lending />} />
            </Routes>
        </Router>
    );
}

export default App;
