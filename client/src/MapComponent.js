import "leaflet/dist/leaflet.css"
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "./MapComponent.css"

import React, { Component } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster"
import 'leaflet-routing-machine'

const customIcon = new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png",
    iconSize: [38, 38]
})

class MapComponent extends Component {
    render() {
        const locations = this.props.locations;
        // console.log(locations);
        return (
            <MapContainer
                center={[51.505, -0.09]}
                zoom={13}
                ref={(ref) => { this.mapRef = ref; }}
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
}

export default MapComponent;

