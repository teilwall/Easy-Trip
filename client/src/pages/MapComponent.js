// import React, { useState, useEffect, useRef, useMemo } from 'react';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import { Icon } from "leaflet";
// import { useLocation } from 'react-router-dom';
// import MarkerClusterGroup from "react-leaflet-cluster";
// import { useNavigate } from 'react-router-dom';
// import "leaflet/dist/leaflet.css";
// import "./MapComponent.css";
// import CustomPopup from './Popup';


// const customIcons = [
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/727/727606.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/7987/7987463.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/9101/9101314.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/449/449970.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/10402/10402353.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/660/660623.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/13898/13898353.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/1518/1518055.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/13193/13193564.png", iconSize: [38, 38] })
// ];

// const customIconsNumerated = [
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/9955/9955698.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/9955/9955810.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/9955/9955933.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/9956/9956027.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/9956/9956086.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/9956/9956130.png", iconSize: [38, 38] }),
// ]

// function customEncoder(obj) {
//     let encodedString = '';

//     for (const key in obj) {
//         if (obj.hasOwnProperty(key)) {
//             const value = obj[key];
//             if (key === 'cityName') {
//                 encodedString += obj[key].replace(/\s/g, '%') + '%';
//             } else {
//               const stringValue = (typeof value === 'string') ? value : JSON.stringify(value);
//               const encodedValue = stringValue.replace(/[^a-zA-Z0-9]/g, '%');
//               encodedString += encodedValue + '%';
//             }
//         }
//     }

//     // Remove the trailing '%'
//     encodedString = encodedString.slice(0, -1);

//     return encodedString;
// }

// function MapComponent() {
//     const [parsedData, setParsedData] = useState({}); 
//     const [mainInfo, setMainInfo] = useState({});
//     const [isLoading, setIsLoading] = useState(true);
//     const [selectedGroup, setSelectedGroup] = useState(null);
//     const [isDataEmpty, setIsDataEmpty] = useState(false);
//     const [showTimeoutPopup, setShowTimeoutPopup] = useState(false);
//     const navigate = useNavigate();
//     const { search } = useLocation();
//     const queryParams = useMemo(() => new URLSearchParams(search), [search]);
//     const city = customEncoder(JSON.parse(queryParams.get('city')));
//     const mapRef = useRef(null);

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const response = await fetch(`http://localhost:5000/api${city}`);
//                 console.log(response.status);
//                 if (!response.ok) {
//                     throw new Error('Network response was not ok');
//                 }
//                 const data = await response.json();
//                 if (Object.keys(data).length === 0) {
//                     setIsLoading(false);
//                     setIsDataEmpty(true);
//                     return;
//                 }
//                 setMainInfo(JSON.parse(queryParams.get('city')));
//                 setParsedData(data)
//                 setIsLoading(false); 
//                 setShowTimeoutPopup(false);
//             } catch (error) {
//                 console.error('Error fetching data:', error);
//             }
//         };
//         const waitUntilFetchIsOk = async () => {
//             let responseOk = false;
//             while (!responseOk) {
//                 try {
//                     const response = await fetch(`http://localhost:5000/api${city}`);
//                     if (response.ok) {
//                         responseOk = true;
//                     }
//                 } catch (error) {
//                     // console.error('Error checking response:', error);
//                     console.log("loading");
//                 }
//             }
//             fetchData();
//         };

//         const timeoutId = setTimeout(() => {
//             if (isLoading) {
//                 setShowTimeoutPopup(true);
//                 setIsLoading(false);
//             }
//         }, 15000);

//         waitUntilFetchIsOk();

//         return () => clearTimeout(timeoutId); 
//     }, [city, queryParams, isLoading]);

//     if (isLoading) {
//         return <div>Loading...</div>;
//     }

//     const calculateGroupCenter = (locations) => {
//         if (locations.length === 0) return [0, 0];
    
//         // Calculate the average latitude and longitude of all locations in the group
//         const sumLat = locations.reduce((sum, location) => sum + location.lat, 0);
//         const sumLon = locations.reduce((sum, location) => sum + location.lon, 0);
//         const avgLat = sumLat / locations.length;
//         const avgLon = sumLon / locations.length;
    
//         return [avgLat, avgLon];
//     };

//     const setViewLocation = (lat, lon, zoom) => {
//         if (mapRef.current) {
//             mapRef.current.setView([lat, lon], zoom);
//         }
//     };

//     const handleButtonClick = (groupIndex) => {
//         setSelectedGroup(groupIndex);
//         // Calculate the center of the group
//         const groupLocations = parsedData[groupIndex];
//         const groupCenter = calculateGroupCenter(groupLocations);
//         // Set the map center to the center of the group
//         setViewLocation(groupCenter[0], groupCenter[1], 13);
//     };

//     const handleAddTripClick = () => {
//         navigate('/');
//     };


//     const locations = Object.entries(parsedData).flatMap(([groupIndex, groupLocations]) => {
//         const iconIndex = groupIndex % customIcons.length;
//         return groupLocations.map(location => ({
//             ...location,
//             groupIndex: groupIndex,
//             icon: customIcons[iconIndex]
//         }));
//     });

//     const selectedGroupLocations = locations.filter(location => selectedGroup === null || location.groupIndex === selectedGroup);

//     if (isDataEmpty || showTimeoutPopup) {
//         return <div> <CustomPopup message="Selected city is not supported currently. Choose another city please." onClose={handleAddTripClick} /> </div>
//     }
    
//     return (
//         <div>
//             <div className='data-container'>
//                 <div className='data-header'>
//                     <h1>{mainInfo.cityName}</h1>
//                     <p>
//                         {new Date(JSON.parse(mainInfo.fromDateStr)).toLocaleDateString()} - {new Date(JSON.parse(mainInfo.toDateStr)).toLocaleDateString()}
//                     </p>
//                 </div>
//                 <div className='data-body'>
//                     {Object.entries(parsedData).map(([day, groupLocations]) => (
//                         <div>
//                             <button key={day} onClick={() => handleButtonClick(day)}>
//                                 Day {parseInt(day)+1}
//                             </button>
//                             {selectedGroup === day && (
//                                 <div>
//                                     {parsedData[day] && parsedData[day].map((location, locationIndex) => (
//                                         <div key={locationIndex}>
//                                             <strong>{location.english_name || location.original_name}</strong> 
//                                             <br></br>
//                                             {location.description}
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>
//                     ))}
//                     <button className="add-trip-button" onClick={handleAddTripClick}>
//                         New Trip
//                     </button>
//                 </div>
//             </div>

//             <div className='map-container'>
//                 <MapContainer ref={mapRef} center={[mainInfo.lat, mainInfo.lon]} zoom={13}>
//                     <TileLayer
//                         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//                     />
//                     <MarkerClusterGroup disableClusteringAtZoom={12} animateAddingMarkers={true}>
//                         {selectedGroupLocations.map((location, index) => (
//                             <Marker key={index} position={[location.lat, location.lon]} icon={selectedGroup !== null ? customIconsNumerated[index % customIconsNumerated.length] : location.icon}>
//                                 <Popup>
//                                     <div className="popup-content">
//                                         {location.image && (
//                                             <div className="popup-image" style={{ backgroundImage: `url(${location.image})` }}></div>
//                                         )}
//                                         <div className="popup-details">
//                                             <h3>{location.english_name || location.original_name}</h3>
//                                             <p>{location.description}</p>
//                                         </div>
//                                     </div>
//                                 </Popup>
//                             </Marker>
//                         ))}
//                     </MarkerClusterGroup>
//                 </MapContainer>
//             </div>
//         </div>
//     );
// }

// export default MapComponent;

// import React, { useState, useEffect, useRef, useMemo } from 'react';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import { Icon } from "leaflet";
// import { useLocation } from 'react-router-dom';
// import MarkerClusterGroup from "react-leaflet-cluster";
// import { useNavigate } from 'react-router-dom';
// import "leaflet/dist/leaflet.css";
// import "./MapComponent.css";
// import CustomPopup from './Popup';
// import axios from 'axios';

// const customIcons = [
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/727/727606.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/7987/7987463.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/9101/9101314.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/449/449970.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/10402/10402353.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/660/660623.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/13898/13898353.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/1518/1518055.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/13193/13193564.png", iconSize: [38, 38] })
// ];

// const customIconsNumerated = [
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/9955/9955698.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/9955/9955810.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/9955/9955933.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/9956/9956027.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/9956/9956086.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/9956/9956130.png", iconSize: [38, 38] }),
// ]

// function customEncoder(obj) {
//     let encodedString = '';

//     for (const key in obj) {
//         if (obj.hasOwnProperty(key)) {
//             const value = obj[key];
//             if (key === 'cityName') {
//                 encodedString += obj[key].replace(/\s/g, '%') + '%';
//             } else {
//               const stringValue = (typeof value === 'string') ? value : JSON.stringify(value);
//               const encodedValue = stringValue.replace(/[^a-zA-Z0-9]/g, '%');
//               encodedString += encodedValue + '%';
//             }
//         }
//     }

//     // Remove the trailing '%'
//     encodedString = encodedString.slice(0, -1);

//     return encodedString;
// }

// function MapComponent() {
//     const [parsedData, setParsedData] = useState({}); 
//     const [mainInfo, setMainInfo] = useState({});
//     const [isLoading, setIsLoading] = useState(true);
//     const [selectedGroup, setSelectedGroup] = useState(null);
//     const [isDataEmpty, setIsDataEmpty] = useState(false);
//     const [showTimeoutPopup, setShowTimeoutPopup] = useState(false); // State to handle timeout
//     const navigate = useNavigate();
//     const { search } = useLocation();
//     const queryParams = useMemo(() => new URLSearchParams(search), [search]);
//     const city = customEncoder(JSON.parse(queryParams.get('city')));
//     const mapRef = useRef(null);

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const response = await axios.get(`http://localhost:5000/api${city}`);
//                 console.log(response.status);
//                 if (response.status !== 200) {
//                     throw new Error('Network response was not ok');
//                 }
//                 const data = response.data;
//                 if (Object.keys(data).length === 0 || response.status === 204) {
//                     setIsLoading(false);
//                     setIsDataEmpty(true);
//                     return;
//                 }
//                 setMainInfo(JSON.parse(queryParams.get('city')));
//                 setParsedData(data);
//                 setIsLoading(false); 
//                 setShowTimeoutPopup(false); // Clear the timeout popup state
//             } catch (error) {
//                 console.error('Error fetching data:', error);
//             }
//         };

//         const waitUntilFetchIsOk = async () => {
//             let responseOk = false;
//             while (!responseOk) {
//                 try {
//                     const response = await axios.get(`http://localhost:5000/api${city}`);
//                     if (response.status === 200) {
//                         responseOk = true;
//                         fetchData();
//                     }
//                 } catch (error) {
//                     console.log("loading");
//                 }
//             }
//         };

//         const timeoutId = setTimeout(() => {
//             if (isLoading) {
//                 setShowTimeoutPopup(true);
//                 setIsLoading(false); // Set loading to false after timeout
//             }
//         }, 15000); // 15 seconds timeout

//         waitUntilFetchIsOk();

//         return () => clearTimeout(timeoutId); // Clear timeout on component unmount
//     }, [city, queryParams, isLoading]);

//     if (isLoading) {
//         return <div>Loading...</div>;
//     }

//     const calculateGroupCenter = (locations) => {
//         if (locations.length === 0) return [0, 0];
    
//         const sumLat = locations.reduce((sum, location) => sum + location.lat, 0);
//         const sumLon = locations.reduce((sum, location) => sum + location.lon, 0);
//         const avgLat = sumLat / locations.length;
//         const avgLon = sumLon / locations.length;
    
//         return [avgLat, avgLon];
//     };

//     const setViewLocation = (lat, lon, zoom) => {
//         if (mapRef.current) {
//             mapRef.current.setView([lat, lon], zoom);
//         }
//     };

//     const handleButtonClick = (groupIndex) => {
//         setSelectedGroup(groupIndex);
//         const groupLocations = parsedData[groupIndex];
//         const groupCenter = calculateGroupCenter(groupLocations);
//         setViewLocation(groupCenter[0], groupCenter[1], 13);
//     };

//     const handleAddTripClick = () => {
//         navigate('/');
//     };

//     const locations = Object.entries(parsedData).flatMap(([groupIndex, groupLocations]) => {
//         const iconIndex = groupIndex % customIcons.length;
//         return groupLocations.map(location => ({
//             ...location,
//             groupIndex: groupIndex,
//             icon: customIcons[iconIndex]
//         }));
//     });

//     const selectedGroupLocations = locations.filter(location => selectedGroup === null || location.groupIndex === selectedGroup);

//     if (isDataEmpty || showTimeoutPopup) {
//         return <div> <CustomPopup message="Selected city is not supported currently. Choose another city please." onClose={handleAddTripClick} /> </div>;
//     }

//     return (
//         <div>
//             <div className='data-container'>
//                 <div className='data-header'>
//                     <h1>{mainInfo.cityName}</h1>
//                     <p>
//                         {new Date(JSON.parse(mainInfo.fromDateStr)).toLocaleDateString()} - {new Date(JSON.parse(mainInfo.toDateStr)).toLocaleDateString()}
//                     </p>
//                 </div>
//                 <div className='data-body'>
//                     {Object.entries(parsedData).map(([day, groupLocations]) => (
//                         <div key={day}>
//                             <button onClick={() => handleButtonClick(day)}>
//                                 Day {parseInt(day) + 1}
//                             </button>
//                             {selectedGroup === day && (
//                                 <div>
//                                     {parsedData[day] && parsedData[day].map((location, locationIndex) => (
//                                         <div key={locationIndex}>
//                                             <strong>{location.english_name || location.original_name}</strong>
//                                             <br></br>
//                                             {location.description}
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>
//                     ))}
//                     <button className="add-trip-button" onClick={handleAddTripClick}>
//                         New Trip
//                     </button>
//                 </div>
//             </div>

//             <div className='map-container'>
//                 <MapContainer ref={mapRef} center={[mainInfo.lat, mainInfo.lon]} zoom={13}>
//                     <TileLayer
//                         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//                     />
//                     <MarkerClusterGroup disableClusteringAtZoom={12} animateAddingMarkers={true}>
//                         {selectedGroupLocations.map((location, index) => (
//                             <Marker key={index} position={[location.lat, location.lon]} icon={selectedGroup !== null ? customIconsNumerated[index % customIconsNumerated.length] : location.icon}>
//                                 <Popup>
//                                     <div className="popup-content">
//                                         {location.image && (
//                                             <div className="popup-image" style={{ backgroundImage: `url(${location.image})` }}></div>
//                                         )}
//                                         <div className="popup-details">
//                                             <h3>{location.english_name || location.original_name}</h3>
//                                             <p>{location.description}</p>
//                                         </div>
//                                     </div>
//                                 </Popup>
//                             </Marker>
//                         ))}
//                     </MarkerClusterGroup>
//                 </MapContainer>
//             </div>
//         </div>
//     );
// }

// export default MapComponent;

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from "leaflet";
import { useLocation } from 'react-router-dom';
import MarkerClusterGroup from "react-leaflet-cluster";
import { useNavigate } from 'react-router-dom';
import "leaflet/dist/leaflet.css";
import "./MapComponent.css";
import CustomPopup from './Popup';
import axios from 'axios';

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
    const [isDataEmpty, setIsDataEmpty] = useState(false);
    const [showTimeoutPopup, setShowTimeoutPopup] = useState(false); // State to handle timeout
    const navigate = useNavigate();
    const { search } = useLocation();
    const queryParams = useMemo(() => new URLSearchParams(search), [search]);
    const city = customEncoder(JSON.parse(queryParams.get('city')));
    const mapRef = useRef(null);

    useEffect(() => {
        const maxAttempts = 30; // Max number of attempts
        let attempts = 0;

        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api${city}`);
                console.log(response.status);
                if (response.status !== 200) {
                    throw new Error('Network response was not ok');
                }
                const data = response.data;
                if (Object.keys(data).length === 0 || response.status === 204) {
                    setIsLoading(false);
                    setIsDataEmpty(true);
                    return;
                }
                setMainInfo(JSON.parse(queryParams.get('city')));
                setParsedData(data);
                setIsLoading(false);
                setShowTimeoutPopup(false); // Clear the timeout popup state
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsLoading(false); // Ensure loading is set to false on error
                setIsDataEmpty(true);
            }
        };

        const pollServer = async () => {
            while (attempts < maxAttempts) {
                try {
                    const response = await axios.get(`http://localhost:5000/api${city}`);
                    if (response.status === 200) {
                        fetchData(); // Call fetchData once the response is ok
                        return;
                    }
                } catch (error) {
                    console.log("Waiting for the URL to become available...");
                }
                attempts += 1;
                await new Promise(resolve => setTimeout(resolve, 500)); // Wait 0.5 seconds between attempts
            }
            setIsLoading(false); // Set loading to false after max attempts
            setShowTimeoutPopup(true); // Show timeout popup after max attempts
        };

        pollServer();

        const timeoutId = setTimeout(() => {
            if (isLoading) {
                setShowTimeoutPopup(true);
                setIsLoading(false); // Set loading to false after timeout
            }
        }, 15000); // 15 seconds timeout

        return () => clearTimeout(timeoutId); // Clear timeout on component unmount
    }, [city, queryParams, isLoading]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const calculateGroupCenter = (locations) => {
        if (locations.length === 0) return [0, 0];

        const sumLat = locations.reduce((sum, location) => sum + location.lat, 0);
        const sumLon = locations.reduce((sum, location) => sum + location.lon, 0);
        const avgLat = sumLat / locations.length;
        const avgLon = sumLon / locations.length;

        return [avgLat, avgLon];
    };

    const setViewLocation = (lat, lon, zoom) => {
        if (mapRef.current) {
            mapRef.current.setView([lat, lon], zoom);
        }
    };

    const handleButtonClick = (groupIndex) => {
        setSelectedGroup(groupIndex);
        const groupLocations = parsedData[groupIndex];
        const groupCenter = calculateGroupCenter(groupLocations);
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

    if (isDataEmpty || showTimeoutPopup) {
        return <div> <CustomPopup message="Selected city is not supported currently. Choose another city please." onClose={handleAddTripClick} /> </div>;
    }

    return (
        <div>
            <div className='data-container'>
                <div className='data-header'>
                    <h1>{mainInfo.cityName}</h1>
                    <p>
                        {new Date(JSON.parse(mainInfo.fromDateStr)).toLocaleDateString()} - {new Date(JSON.parse(mainInfo.toDateStr)).toLocaleDateString()}
                    </p>
                </div>
                <div className='data-body'>
                    {Object.entries(parsedData).map(([day, groupLocations]) => (
                        <div key={day}>
                            <button onClick={() => handleButtonClick(day)}>
                                Day {parseInt(day) + 1}
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
