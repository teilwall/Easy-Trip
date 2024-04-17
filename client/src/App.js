import React, { useEffect, useState } from 'react';
import MapComponent from './pages/MapComponent';
import MyForm from './pages/Form';

function App() {
    // const [locations, setLocations] = useState([]);
    // const [isLoading, setIsLoading] = useState(true);
    // const [formExecuted, setFormExecuted] = useState(false);

    // useEffect(() => {
    //     // if (formExecuted) {
    //         const fetchData = async () => {
    //             try {
    //                 console.log("inside useEffect");
    //                 const response = await fetch('http://localhost:5000/api');
    //                 if (!response.ok) {
    //                     console.log("not working");
    //                     throw new Error('Network response was not ok');
    //                 }
    //                 const jsonData = await response.json();
    //                 // console.log(jsonData);
    //                 setLocations(jsonData);
    //                 setIsLoading(false); // Set loading state to false when data is fetched
    //             } catch (error) {
    //                 console.error('Error fetching data:', error);
    //             }
    //         };
    
    //         fetchData();
    //     // }
    // }, [formExecuted]);

    // const handleFormSubmit = () => {
    //     setIsLoading(false);
    //     console.log("in the HANDLE!");
    // };
    
    // useEffect(() => {
    //     if (formExecuted) {
    //         fetch("/api").then(
    //             console.log("inside api")).then(
    //             response => response.json()
    //         ).then(
    //             locations => {
    //                 setLocations(locations);
    //                 setIsLoading(false);
    //             }
    //         ).catch(error => {
    //             console.log('Error fetching data: ', error);
    //         })
    //     }
    //     }, [formExecuted]);

    return (
        <div>
            {/* <MyForm onSubmit={handleFormSubmit} /> */}
            <MyForm />
            <h1>Leaflet Map Example</h1>
            {/* {isLoading ? (
                <p>Loading...</p>
            ) : (
                <MapComponent/>
                // <MapComponent locations={locations} />
            )} */}
            <MapComponent />
        </div>
    );
}

export default App;
