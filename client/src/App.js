import React, { useState } from 'react';
import axios from 'axios';
import MapComponent from './MapComponent';

function App() {
    const [city, setCity] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            // Send a POST request to the server
            const response = await axios.post('/process-client-inputs', {
                city,
                category,
                priority
            });

            // Handle the response from the server
            console.log('Response from server:', response.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>
                    City:
                    <input
                        type="text"
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
                    />
                </label>
                <label>
                    Category:
                    <input
                        type="text"
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                    />
                </label>
                <label>
                    Priority:
                    <input
                        type="text"
                        value={priority}
                        onChange={(event) => setPriority(event.target.value)}
                    />
                </label>
                <button type="submit">Submit</button>
            </form>
            <h1>Leaflet Map Example</h1>
            <MapComponent />
        </div>
    );
}

export default App;
