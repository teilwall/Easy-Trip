// import React, { useState } from 'react';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import { Icon } from "leaflet";
// import MarkerClusterGroup from "react-leaflet-cluster";
// import 'leaflet-routing-machine';
// import "leaflet/dist/leaflet.css";
// import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
// import "./MapComponent.css";

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
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/10220/10220516.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/10220/10220558.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/10220/10220600.png", iconSize: [38, 38] }),
//     new Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/128/10220/10220634.png", iconSize: [38, 38] }),
// ]

// function MapComponent() {
//     const parsedData = {
//         '0': [
//             '{"english_name":"Centre Pompidou","original_name":"Centre Georges Pompidou","lat":48.8605235,"lon":2.3524395,"image":""}',
//             '{"english_name":"","original_name":"Temple de l\'Oratoire du Louvre","lat":48.8616725,"lon":2.3400059,"image":""}',
//             '{"english_name":"Luxembourg Palace","original_name":"Palais du Luxembourg","lat":48.8485515,"lon":2.3371454,"image":"https://photos.app.goo.gl/M5jk2h47KPirVmsFA"}'
//         ],
//         '1': [
//             '{"english_name":"Eiffel Tower","original_name":"Tour Eiffel","lat":48.8582603,"lon":2.2945008,"image":"https://fr.wikipedia.org/wiki/Fichier:Tour_Eiffel_Wikimedia_Commons.jpg"}',
//             '{"english_name":"Arc de Triomphe","original_name":"Arc de Triomphe","lat":48.8737782,"lon":2.2950354,"image":"http://upload.wikimedia.org/wikipedia/commons/e/e9/Arc_de_triomphe_Paris.jpg"}',
//             '{"english_name":"","original_name":"Chapelle Notre-Dame-de-Consolation","lat":48.8654949,"lon":2.306089,"image":""}'
//         ],
//         '2': [
//             '{"english_name":"Basilica of the Sacred Heart of Paris","original_name":"Basilique du Sacré-Cœur","lat":48.8867961,"lon":2.3430272,"image":"http://upload.wikimedia.org/wikipedia/commons/2/2e/Sacre_Coeur_2009-02-28.JPG"}',
//             '{"english_name":"","original_name":"Église Saint-Eugène Sainte-Cécile","lat":48.8733469,"lon":2.3471633,"image":""}',
//             '{"english_name":"","original_name":"Église Saint-Eustache","lat":48.8634023,"lon":2.3451777,"image":"https://photos.app.goo.gl/sURGfkbVmo6LkU3b9"}'
//         ],
//         '3': [
//             '{"english_name":"Cathedral of Notre Dame","original_name":"Cathédrale Notre-Dame de Paris","lat":48.8529372,"lon":2.3498701,"image":"https://photos.app.goo.gl/vZTdAEpuPZcpVuV66"}',
//             '{"english_name":"Montparnasse Tower","original_name":"Tour Montparnasse","lat":48.8421127,"lon":2.3219796,"image":"https://photos.app.goo.gl/X8AyJ9LPo1yUBjMJ7"}',
//             '{"english_name":"","original_name":"Sainte-Chapelle","lat":48.8553966,"lon":2.3450136,"image":""}'
//         ]
//     };

//     const [selectedGroup, setSelectedGroup] = useState(null);

//     const locations = Object.entries(parsedData).flatMap(([groupIndex, groupLocations]) => {
//         const iconIndex = parseInt(groupIndex) % customIcons.length;
//         return groupLocations.map(location => ({
//             ...JSON.parse(location),
//             groupIndex: groupIndex,
//             icon: customIcons[iconIndex]
//         }));
//     });

//     const handleButtonClick = (groupIndex) => {
//         setSelectedGroup(groupIndex);
//     };

//     const selectedGroupLocations = locations.filter(location => selectedGroup === null || location.groupIndex === selectedGroup);

//     return (
//         <div>
//             <div style={{ marginBottom: '10px' }}>
//                 {Object.entries(parsedData).map(([groupIndex, groupLocations]) => (
//                     <button key={groupIndex} onClick={() => handleButtonClick(groupIndex)}>
//                         Group {groupIndex} ({groupLocations.length})
//                     </button>
//                 ))}
//             </div>
//             <div>
//                 {selectedGroup !== null && (
//                     <div>
//                         <h2>Selected Group: {selectedGroup}</h2>
//                         <ul>
//                             {parsedData[selectedGroup].map((location, index) => (
//                                 <li key={index}>{JSON.parse(location).english_name || JSON.parse(location).original_name}</li>
//                             ))}
//                         </ul>
//                     </div>
//                 )}
//             </div>
//             <MapContainer center={[48.8566, 2.3522]} zoom={13}>
//                 <TileLayer
//                     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                     attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//                 />
//                 <MarkerClusterGroup>
//                     {selectedGroupLocations.map((location, index) => (
//                         <Marker key={index} position={[location.lat, location.lon]} icon={location.icon}>
//                             <Popup>
//                                 <div>
//                                     <h3>{location.english_name || location.original_name}</h3>
//                                     <p>Latitude: {location.lat}</p>
//                                     <p>Longitude: {location.lon}</p>
//                                     {location.image && <img src={location.image} alt="Location" style={{ maxWidth: '100px' }} />}
//                                 </div>
//                             </Popup>
//                         </Marker>
//                     ))}
//                 </MarkerClusterGroup>
//             </MapContainer>
//         </div>
//     );
// }

// export default MapComponent;


import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import 'leaflet-routing-machine';
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
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
]

function MapComponent() {
    const parsedData = {
        '0': [
            '{"english_name":"Centre Pompidou","original_name":"Centre Georges Pompidou","lat":48.8605235,"lon":2.3524395,"image":""}',
            '{"english_name":"","original_name":"Temple de l\'Oratoire du Louvre","lat":48.8616725,"lon":2.3400059,"image":""}',
            '{"english_name":"Luxembourg Palace","original_name":"Palais du Luxembourg","lat":48.8485515,"lon":2.3371454,"image":"https://photos.app.goo.gl/M5jk2h47KPirVmsFA"}'
        ],
        '1': [
            '{"english_name":"Eiffel Tower","original_name":"Tour Eiffel","lat":48.8582603,"lon":2.2945008,"image":"https://fr.wikipedia.org/wiki/Fichier:Tour_Eiffel_Wikimedia_Commons.jpg"}',
            '{"english_name":"Arc de Triomphe","original_name":"Arc de Triomphe","lat":48.8737782,"lon":2.2950354,"image":"http://upload.wikimedia.org/wikipedia/commons/e/e9/Arc_de_triomphe_Paris.jpg"}',
            '{"english_name":"","original_name":"Chapelle Notre-Dame-de-Consolation","lat":48.8654949,"lon":2.306089,"image":""}'
        ],
        '2': [
            '{"english_name":"Basilica of the Sacred Heart of Paris","original_name":"Basilique du Sacré-Cœur","lat":48.8867961,"lon":2.3430272,"image":"http://upload.wikimedia.org/wikipedia/commons/2/2e/Sacre_Coeur_2009-02-28.JPG"}',
            '{"english_name":"","original_name":"Église Saint-Eugène Sainte-Cécile","lat":48.8733469,"lon":2.3471633,"image":""}',
            '{"english_name":"","original_name":"Église Saint-Eustache","lat":48.8634023,"lon":2.3451777,"image":"https://photos.app.goo.gl/sURGfkbVmo6LkU3b9"}'
        ],
        '3': [
            '{"english_name":"Cathedral of Notre Dame","original_name":"Cathédrale Notre-Dame de Paris","lat":48.8529372,"lon":2.3498701,"image":"https://photos.app.goo.gl/vZTdAEpuPZcpVuV66"}',
            '{"english_name":"Montparnasse Tower","original_name":"Tour Montparnasse","lat":48.8421127,"lon":2.3219796,"image":"https://photos.app.goo.gl/X8AyJ9LPo1yUBjMJ7"}',
            '{"english_name":"","original_name":"Sainte-Chapelle","lat":48.8553966,"lon":2.3450136,"image":""}'
        ]
    };

    const [selectedGroup, setSelectedGroup] = useState(null);

    const locations = Object.entries(parsedData).flatMap(([groupIndex, groupLocations]) => {
        const iconIndex = parseInt(groupIndex) % customIcons.length;
        return groupLocations.map(location => ({
            ...JSON.parse(location),
            groupIndex: groupIndex,
            icon: customIcons[iconIndex]
        }));
    });

    const handleButtonClick = (groupIndex) => {
        setSelectedGroup(groupIndex);
    };

    const selectedGroupLocations = locations.filter(location => selectedGroup === null || location.groupIndex === selectedGroup);

    return (
        <div>
            <div className='data-container'>
                <div>
                    {Object.entries(parsedData).map(([groupIndex, groupLocations]) => (
                        <button key={groupIndex} onClick={() => handleButtonClick(groupIndex)}>
                            Group {groupIndex} ({groupLocations.length})
                        </button>
                    ))}
                </div>

                <div>
                    {selectedGroup !== null && (
                        <div>
                            <h2>Selected Group: {selectedGroup}</h2>
                            <ul>
                                {parsedData[selectedGroup].map((location, index) => (
                                    <li key={index}>{JSON.parse(location).english_name || JSON.parse(location).original_name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <div className='map-container'>
                <MapContainer center={[48.8566, 2.3522]} zoom={13}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MarkerClusterGroup>
                        {selectedGroupLocations.map((location, index) => (
                            <Marker key={index} position={[location.lat, location.lon]} icon={selectedGroup !== null ? customIconsNumerated[index % customIconsNumerated.length] : location.icon}>
                                <Popup>
                                    <div>
                                        <h3>{location.english_name || location.original_name}</h3>
                                        <p>Latitude: {location.lat}</p>
                                        <p>Longitude: {location.lon}</p>
                                        {location.image && <img src={location.image} alt="Location" style={{ maxWidth: '100px' }} />}
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
