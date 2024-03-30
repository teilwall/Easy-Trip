import "leaflet/dist/leaflet.css"
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "./MapComponent.css"

import React, { Component } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { Icon } from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster"
import 'leaflet-routing-machine'

const customIcon = new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png",
    iconSize: [38, 38]
})

class MapComponent extends Component {
    componentDidMount() {
        if (this.mapRef && this.mapRef.leafletElement) {
            const map = this.mapRef.leafletElement;

            const waypoints = [
                L.latLng(51.5, -0.09),
                L.latLng(51.51, -0.1),
                L.latLng(51.52, -0.12)
            ];

            const routingControl = L.Routing.control({
                waypoints,
                routeWhileDragging: true,
                createMarker: function (i, waypoint, n) {
                    return L.marker(waypoint.latLng, {
                        icon: customIcon // Use custom icon for each waypoint
                    }).bindPopup("Waypoint " + i); // Customize popup content if needed
                }
            }).addTo(map);

            // If you want to bind events to the routing control, you can do so like this:
            routingControl.on('routeselected', function (e) {
                var routes = e.routes;
                // Do something with the routes
            });
        }
    }

    render() {
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
                    <Marker position={[51.505, -0.09]} icon={customIcon}>
                        <Popup>
                            A pretty CSS3 popup. <br /> Easily customizable.
                        </Popup>
                    </Marker>
                </MarkerClusterGroup>
            </MapContainer>
        );
    }
}

export default MapComponent;

