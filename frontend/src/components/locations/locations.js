import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import "./locations.css";
import 'leaflet-routing-machine'; // Import leaflet-routing-machine

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const locations = [
    {id: 1, name: "Kraków", latitude: 50.064496663386926, longitude: 19.92334282951794, description: "A-0"},
];

const Locations = () => {
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        // Get user's current position
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                console.error("Error getting user location", error);
            }
        );
    }, []);

    function MapWithRoute() {
        const map = useMap(); // Use the map instance from react-leaflet

        useEffect(() => {
            if (userLocation) {
                // Create a marker for the user's location
                L.marker([userLocation.latitude, userLocation.longitude]).addTo(map)
                    .bindPopup("Tu jesteś")
                    .openPopup();

                // Add routing control from user location to Kraków
                const routeControl = L.Routing.control({
                    waypoints: [
                        L.latLng(userLocation.latitude, userLocation.longitude),
                        L.latLng(locations[0].latitude, locations[0].longitude), // Kraków location
                    ],
                    routeWhileDragging: true,
                }).addTo(map);
            }
        }, [map]);

        return null; // No need to render anything from this component
    }

    return (
        <div className="p-4">
<div style={{ marginTop: 30, textAlign: "center" }}>
    <h2 className="about-us-title" style={{ fontSize: "2rem", fontWeight: "bold", color: "#ffffff" }}>
        Zagubiony? Pomożemy!
    </h2>

    <p style={{ fontSize: "1rem", color: "#c8c8c8", marginBottom: "20px" }}>
        Wybierz budynek na kampusie, który chcesz odnaleźć:
    </p>

    <div className="input-group mb-3" style={{ width: "80%", maxWidth: "500px", margin: "0 auto" }}>
        <input
            type="text"
            className="form-control"
            placeholder="Wpisz nazwę budynku..."
            aria-label="Wyszukiwanie budynku"
            style={{
                padding: "10px",
                fontSize: "1rem",
                borderRadius: "5px",
                border: "1px solid #ddd",
            }}
            list="locations-list"
        />
        <datalist id="locations-list">
            <option value="Budynek A" />
            <option value="Budynek B" />
            <option value="Budynek C" />
            <option value="Budynek D" />
            <option value="Biblioteka" />
            <option value="Wykładowa" />
        </datalist>
    </div>

    <button
        type="button"
        className="btn btn-primary"
        style={{
            padding: "10px 20px",
            fontSize: "1rem",
            backgroundColor: "#0056b3",
            borderColor: "#004085",
            borderRadius: "5px",
            cursor: "pointer",
            transition: "background-color 0.3s",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#004085")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#0056b3")}
    >
        Szukaj
    </button>
</div>

            {/* Map Section */}
            <div
                style={{
                    maxWidth: "1000px",
                    margin: "auto",
                    padding: "20px",
                    borderRadius: "10px",
                    color: "white",
                }}
            >
                <div>
                    <MapContainer
                        center={[50.064496663386926, 19.92334282951794]}
                        zoom={16}
                        style={{
                            height: "500px",
                            width: "100%",
                            borderRadius: "10px",
                            overflow: "hidden",
                            marginTop: "20px",
                        }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {locations.map((loc) => (
                            <Marker
                                key={loc.id}
                                position={[loc.latitude, loc.longitude]}
                            >
                                <Popup>
                                    <h4
                                        style={{
                                            borderBottom: "2px solid black",
                                            paddingBottom: "5px",
                                            marginBottom: "5px",
                                            color: "#ff7329",
                                        }}
                                    >
                                        Hotel Weles {loc.name}
                                    </h4>
                                    <p style={{fontSize: "14px", color: "black"}}>
                                        {loc.description}
                                    </p>
                                </Popup>
                            </Marker>
                        ))}
                        {/*<MapWithRoute /> /!* Add the MapWithRoute component *!/*/}
                    </MapContainer>


                </div>
            </div>

            {/* Image Section */}
            <div className="mt-6 text-center">
                <h2 className="text-xl font-semibold mb-2">Mapa miasteczka AGH</h2>
                <img
                    src="images/basic/mapa_agh.jpg"
                    alt="Mapa miasteczka AGH"
                    className="w-full max-w-lg mx-auto rounded-lg shadow-md responsive-image"
                />
            </div>
        </div>
    );
};

export default Locations;
