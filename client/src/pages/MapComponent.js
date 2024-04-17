import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster"
import 'leaflet-routing-machine'

import "leaflet/dist/leaflet.css"
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "./MapComponent.css"

const customIcon = new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png",
    iconSize: [38, 38]
})

function MapComponent () {
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("inside useEffect");
                const response = await fetch('http://localhost:5000/api');
                if (!response.ok) {
                    console.log("not working");
                    throw new Error('Network response was not ok');
                }
                const jsonData = await response.json();
                // console.log(jsonData);
                setLocations(jsonData);
                setIsLoading(false); // Set loading state to false when data is fetched
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        const waitUntilFetchIsOk = async () => {
            let responseOk = false;
            while (!responseOk) {
                try {
                    const response = await fetch('http://localhost:5000/api');
                    if (response.ok) {
                        responseOk = true;
                    }
                } catch (error) {
                    console.error('Error checking response:', error);
                }
            }
            fetchData(); // Once response is ok, fetch data
        };
    
        waitUntilFetchIsOk();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <MapContainer
            center={locations[0]}
            zoom={13}
            // ref={(ref) => { this.mapRef = ref; }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MarkerClusterGroup>
                {locations.map((location, index) => (
                    <Marker key={index} position={location} icon={customIcon}>
                        <Popup>
                            A pretty CSS3 popup. <br /> Easily customizable.
                        </Popup>
                    </Marker>
                ))}
            </MarkerClusterGroup>
        </MapContainer>
    );
}

export default MapComponent;