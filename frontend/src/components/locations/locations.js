import React, {useEffect, useRef, useState} from "react";
import {MapContainer, TileLayer, Marker, Popup, useMap} from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import "./locations.css";
import 'leaflet-routing-machine';
import client from "../../client";
import {API_BASE_URL} from "../../config";
import {Alert} from "react-bootstrap"; // Import leaflet-routing-machine

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// const locations = [
//     {id: 1, name: "Kraków", latitude: 50.064496663386926, longitude: 19.92334282951794, description: "A-0"},
// ];

const Locations = () => {
    const [userLocation, setUserLocation] = useState(null);
    const [locations, setLocations] = useState([]);
    const [allLocations, setAllLocations] = useState([]);
    const [query, setQuery] = useState("");
    const [error, setError] = useState("");
    const [flag, setFlag] = useState(false);
    const token = localStorage.getItem("access");
    const [suggestions, setSuggestions] = useState([]);
    const markerRef = useRef(null);


    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await client.get(API_BASE_URL + "buildings/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setLocations(response.data);
                setAllLocations(response.data);
            } catch (error) {
                console.log("Nie udało się zalogować");
            }
        };

        if (locations.length < 1 && token) {
            fetchLocations();
        }
    }, [token]);

    useEffect(() => {
        if (query.length > 0) {
            const filtered = allLocations
                .filter((loc) => loc.name.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 5);
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    }, [query, locations]);

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

    const handleOpenRoute = (endCoords) => {
        console.log(endCoords)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const startCoords = `${position.coords.latitude},${position.coords.longitude}`;
                    const url = `https://www.google.com/maps/dir/${startCoords}/${endCoords}`;
                    window.open(url, "_blank");
                },
                (error) => {
                    alert("Nie udało się pobrać lokalizacji.");
                }
            );
        } else {
            alert("Geolokalizacja nie jest dostępna w tej przeglądarce.");
        }
    };

    async function findPlace(pin)
    {
        setFlag(false)
        if (!pin) {
            setError("Proszę wpisać budynek.")
            console.error("PIN cannot be empty");
            return;
        }

        try {
            const response = await client.get(`${API_BASE_URL}building/${pin.replace(/\s+/g, '_')}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setLocations([response.data]); // Ensure it's an array
            console.log(response.data);

            return response.data;
        } catch (error) {
            setError("Nie znaleziono budynku.")
            console.error("Nie udało się pobrać danych:", error);
            return null;
        }
    }

    const ChangeMapCenter = ({ lat, lon }) => {
        const map = useMap();  // Access the map object using useMap hook
        if (lat && lon) {
          map.setView([lat, lon], 16);  // Set new center with zoom level 16
          markerRef.current?.openPopup();
        }
        return null; // This component doesn't need to render anything
      };




    return (
        <div className="p-4">
            <div style={{marginTop: 30, textAlign: "center", marginBottom: 160}}>
                <h2 className="about-us-title" style={{fontSize: "2rem", fontWeight: "bold", color: "#ffffff"}}>
                    Zagubiony? Pomożemy!
                </h2>

                <p style={{fontSize: "1rem", color: "#c8c8c8", marginBottom: "20px"}}>
                    Wybierz budynek na kampusie, który chcesz odnaleźć:
                </p>

                <div className="input-group mb-3"
                     style={{width: "80%", maxWidth: "500px", margin: "0 auto", position: "relative"}}>
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
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value)
                            setFlag(true)
                            setError(null)
                        }}
                    />
                    {suggestions.length > 0 && flag && (
                        <div
                            style={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                width: "100%",
                                background: "white",
                                border: "1px solid #ddd",
                                borderRadius: "5px",
                                zIndex: 10,
                                padding: "5px",
                            }}
                        >
                            {suggestions.map((loc, index) => (
                                <div
                                    key={index}
                                    style={{
                                        padding: "5px 10px",
                                        color: "gray",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {
                                        setQuery(loc.name)
                                        setFlag(false)
                                    }}
                                >
                                    {loc.name}
                                </div>
                            ))}
                        </div>
                    )}

             <button
            type="button"
            className="btn"
            style={{
              padding: "10px 20px",
              fontSize: "1rem",
              backgroundColor: "rgba(219,15,173,0.59)",
              borderRadius: "5px",
              cursor: "pointer",
              display: "inline",
              color: "white",
            }}
            onClick={() => {
              const result = findPlace(query);
              result && result.then(() => {
                if (locations.length > 0) {
                  const loc = locations[0];
                  // Ensure that lat and lon are available before updating the map
                  if (loc.latitude && loc.longitude) {
                    return <ChangeMapCenter lat={loc.latitude} lon={loc.longitude} />;
                  } else {
                    console.error("Location data missing latitude or longitude");
                  }
                }
              });
            }}
          >
            Szukaj
          </button>
                </div>

                {error?
                    <Alert variant={"danger"}>
                        {error}
                    </Alert>
                : null}

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
                        {locations?.map((loc) => (
                            <Marker
                                ref={locations.length < 2? markerRef: null}
                                key={loc.id}
                                position={[loc.latitude, loc.longitude]}
                            >
                                <Popup>
                                    <h5
                                        style={{
                                            borderBottom: "2px solid black",
                                            paddingBottom: "5px",
                                            marginBottom: "5px",
                                            color: "rgb(0,0,0)",
                                        }}
                                    >
                                        {loc.name}
                                    </h5>
                                    <h6>
                                        {loc.symbol && loc.symbol !== "brak"? loc.symbol: null } {loc.symbol !== loc.abbreviation? `(${loc.abbreviation})` : null}
                                    </h6>
                                    <p style={{fontSize: "14px", color: "black"}}>
                                        {loc.function}
                                        <br></br>
                                        {loc.address}
                                    </p>

                                    <p>
                                        <button className={"btn btn-dark"} onClick={() => handleOpenRoute(`${loc.latitude},${loc.longitude}`)}>Wyznacz trasę</button>
                                    </p>
                                </Popup>
                            </Marker>
                        ))}

                        {locations.length > 0 && locations[0].latitude && locations[0].longitude && (
                            <ChangeMapCenter lat={locations[0].latitude} lon={locations[0].longitude} />
                      )}
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
