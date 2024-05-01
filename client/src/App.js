import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapComponent from './pages/MapComponent';
import MyForm from './pages/Form';

function App() {
    return (
        // <div>
        //     {/* <MyForm onSubmit={handleFormSubmit} /> */}
        //     <MyForm />
        //     <h1>Leaflet Map Example</h1>
        //     {/* {isLoading ? (
        //         <p>Loading...</p>
        //     ) : (
        //         <MapComponent/>
        //         // <MapComponent locations={locations} />
        //     )} */}
        //     {/* <MapComponent /> */}
        // </div>
        <Router>
            <Routes>
                <Route path="/" element={<MyForm />} />
                <Route path="/map" element={<MapComponent />} />
            </Routes>
        </Router>
    );
}

export default App;
