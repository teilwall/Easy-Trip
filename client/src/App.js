import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapComponent from './pages/MapComponent';
import MyForm from './pages/Form';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MyForm />} />
                <Route path="/map" element={<MapComponent />} />
            </Routes>
        </Router>
    );
}

export default App;
