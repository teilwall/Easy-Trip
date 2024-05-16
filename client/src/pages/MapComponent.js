import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from "leaflet";
import { useLocation } from 'react-router-dom';
import MarkerClusterGroup from "react-leaflet-cluster";
import { useNavigate } from 'react-router-dom';
import "leaflet/dist/leaflet.css";
import "./MapComponent.css";

const customIcons = [
    new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png", iconSize: [38, 38] }),
    new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/727/727606.png", iconSize: [38, 38] }),
    new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/7987/7987463.png", iconSize: [38, 38] }),
    new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/9101/9101314.png", iconSize: [38, 38] }),
    new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/449/449970.png", iconSize: [38, 38] }),
    new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/10402/10402353.png", iconSize: [38, 38] }),
    new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/660/660623.png", iconSize: [38, 38] }),
    new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/13898/13898353.png", iconSize: [38, 38] }),
    new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/1518/1518055.png", iconSize: [38, 38] }),
    new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/13193/13193564.png", iconSize: [38, 38] })
];

const customIconsNumerated = [
    new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/9955/9955698.png", iconSize: [38, 38] }),
    new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/9955/9955810.png", iconSize: [38, 38] }),
    new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/9955/9955933.png", iconSize: [38, 38] }),
    new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/9956/9956027.png", iconSize: [38, 38] }),
    new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/9956/9956086.png", iconSize: [38, 38] }),
    new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/9956/9956130.png", iconSize: [38, 38] }),
]

function customEncoder(obj) {
    let encodedString = '';

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            if (key === 'cityName') {
                encodedString += obj[key].replace(/\s/g, '%') + '%';
            } else {
              const stringValue = (typeof value === 'string') ? value : JSON.stringify(value);
              const encodedValue = stringValue.replace(/[^a-zA-Z0-9]/g, '%');
              encodedString += encodedValue + '%';
            }
        }
    }

    // Remove the trailing '%'
    encodedString = encodedString.slice(0, -1);

    return encodedString;
}

function MapComponent() {
    const [parsedData, setParsedData] = useState({}); 
    const [mainInfo, setMainInfo] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const navigate = useNavigate();
    const { search } = useLocation();
    const queryParams = new URLSearchParams(search);
    const city = customEncoder(JSON.parse(queryParams.get('city')));
    const mapRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // const response = await fetch('http://localhost:5000/api');
                const response = await fetch(`http://localhost:5000/api${city}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                // console.log(data);
                setMainInfo(data[-1]);
                delete data[-1];
                // console.log(mainInfo);
                setParsedData(data)
                setIsLoading(false); 
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        const waitUntilFetchIsOk = async () => {
            let responseOk = false;
            while (!responseOk) {
                try {
                    const response = await fetch(`http://localhost:5000/api${city}`);
                    // const response = await fetch('http://localhost:5000/api');
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
        // fetchData();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const calculateGroupCenter = (locations) => {
        if (locations.length === 0) return [0, 0];
    
        // Calculate the average latitude and longitude of all locations in the group
        const sumLat = locations.reduce((sum, location) => sum + location.lat, 0);
        const sumLon = locations.reduce((sum, location) => sum + location.lon, 0);
        const avgLat = sumLat / locations.length;
        const avgLon = sumLon / locations.length;
    
        return [avgLat, avgLon];
    };

    const panToLocation = (lat, lon) => {
        mapRef.current.panTo([lat, lon]);
    };

    const setViewLocation = (lat, lon, zoom) => {
        if (mapRef.current) {
            mapRef.current.setView([lat, lon], zoom);
        }
    };

    const handleButtonClick = (groupIndex) => {
        setSelectedGroup(groupIndex);
        // Calculate the center of the group
        const groupLocations = parsedData[groupIndex];
        const groupCenter = calculateGroupCenter(groupLocations);
        // Set the map center to the center of the group
        // panToLocation(groupCenter[0], groupCenter[1]);
        setViewLocation(groupCenter[0], groupCenter[1], 13);
    };

    const handleAddTripClick = () => {
        navigate('/');
    };


    const locations = Object.entries(parsedData).flatMap(([groupIndex, groupLocations]) => {
        const iconIndex = groupIndex % customIcons.length;
        return groupLocations.map(location => ({
            ...location,
            groupIndex: groupIndex,
            icon: customIcons[iconIndex]
        }));
    });

    const selectedGroupLocations = locations.filter(location => selectedGroup === null || location.groupIndex === selectedGroup);

    return (
        <div>
            <div className='data-container'>
                <div className='data-header'>
                    <h1>{mainInfo.city}</h1>
                    <p>
                        {new Date(mainInfo.fromDate).toLocaleDateString()} - {new Date(mainInfo.toDate).toLocaleDateString()}
                    </p>
                </div>
                <div className='data-body'>
                    {Object.entries(parsedData).map(([day, groupLocations]) => (
                        <div>
                            <button key={day} onClick={() => handleButtonClick(day)}>
                                Day {parseInt(day)+1}
                            </button>
                            {selectedGroup === day && (
                                <div>
                                    {parsedData[day] && parsedData[day].map((location, locationIndex) => (
                                        <div key={locationIndex}>
                                            <strong>{location.english_name || location.original_name}</strong> 
                                            <br></br>
                                            {location.description}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    <button className="add-trip-button" onClick={handleAddTripClick}>
                        New Trip
                    </button>
                </div>
            </div>

            <div className='map-container'>
                <MapContainer ref={mapRef} center={[mainInfo.lat, mainInfo.lon]} zoom={13}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MarkerClusterGroup disableClusteringAtZoom={12} animateAddingMarkers={true}>
                        {selectedGroupLocations.map((location, index) => (
                            <Marker key={index} position={[location.lat, location.lon]} icon={selectedGroup !== null ? customIconsNumerated[index % customIconsNumerated.length] : location.icon}>
                                <Popup>
                                    <div className="popup-content">
                                        {location.image && (
                                            <div className="popup-image" style={{ backgroundImage: `url(${location.image})` }}></div>
                                        )}
                                        <div className="popup-details">
                                            <h3>{location.english_name || location.original_name}</h3>
                                            <p>{location.description}</p>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MarkerClusterGroup>
                </MapContainer>
            </div>
        </div>
    );
}

export default MapComponent;
