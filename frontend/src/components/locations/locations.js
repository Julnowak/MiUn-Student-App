import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import client from "../../client";
import { API_BASE_URL } from "../../config";
import Alert from '@mui/material/Alert';
import { Autocomplete, TextField, Button, Box, Typography, Container } from "@mui/material";
import { LocationOn, Search, Directions } from "@mui/icons-material";
import {useParams} from "react-router-dom";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const Locations = () => {
    const [userLocation, setUserLocation] = useState(null);
    const [locations, setLocations] = useState([]);
    const [allLocations, setAllLocations] = useState([]);
    const [query, setQuery] = useState("");
    const [error, setError] = useState("");
    const [flag, setFlag] = useState(false);
    const token = localStorage.getItem("access");
    const mapRef = useRef(null);
    const [bounds, setBounds] = useState(null);
    const locationParam = useParams();

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

                console.log(locationParam.id[0] + "-" + locationParam.id[1])

                // Jeśli jest parametr w URL, wyszukaj odpowiedni budynek
                if (locationParam.id) {
                    const foundLocation = response.data.find(loc =>
                        loc.name.includes(locationParam.id[0] + "-" + locationParam.id[1]) ||
                        loc.abbreviation.includes(locationParam.id[0] + "-" + locationParam.id[1])
                    );

                    if (foundLocation) {
                        console.log(foundLocation)
                        setQuery(foundLocation.id);
                        setLocations([foundLocation]);
                        const newBounds = L.latLngBounds([
                            [foundLocation.latitude, foundLocation.longitude]
                        ]);

                        setBounds(newBounds.pad(0.5));
                    }
                } else if (response.data.length > 0) {
                    // Standardowe zachowanie - pokaż wszystkie lokalizacje
                    const coords = response.data.map(loc => [loc.latitude, loc.longitude]);
                    const newBounds = L.latLngBounds(coords);
                    setBounds(newBounds);
                }
            } catch (error) {
                console.log("Nie udało się pobrać lokalizacji");
            }
        };

        if (locations.length < 1 && token) {
            fetchLocations();
        }
    }, [token, locationParam]); // Dodaj locationParam do zależności

    useEffect(() => {
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

    async function findPlace(pin) {
        setFlag(false);
        if (!pin) {
            setError("Proszę wpisać budynek.");
            return;
        }

        try {
            const response = await client.get(`${API_BASE_URL}building/${pin.replace(/\s+/g, '_')}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setLocations([response.data]);
            setError(null);

            // Center map on the found location
            if (response.data?.latitude && response.data?.longitude) {
                const newBounds = L.latLngBounds([
                    [response.data.latitude, response.data.longitude]
                ]);
                setBounds(newBounds.pad(0.5)); // Add some padding
            }

            return response.data;
        } catch (error) {
            setError("Nie znaleziono budynku.");
            return null;
        }
    }

    const FitBounds = () => {
        const map = useMap();

        useEffect(() => {
            if (bounds) {
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }, [map]);

        return null;
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{
                textAlign: "center",
                mb: 8,
                px: 2
            }}>
                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 2,
                            backgroundColor: 'error.light',
                            color: 'error.contrastText'
                        }}
                    >
                        {error}
                    </Alert>
                )}

                <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                        fontWeight: 700,
                        mb: 2,
                        color: 'primary.main'
                    }}
                >
                    Zagubiony? Pomożemy!
                </Typography>

                <Typography
                    variant="subtitle1"
                    sx={{
                        mb: 4,
                        color: 'text.secondary'
                    }}
                >
                    Znajdź budynek na kampusie AGH
                </Typography>

                <Box sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'center',
                    flexDirection: { xs: 'column', sm: 'row' },
                    maxWidth: 800,
                    mx: 'auto'
                }}>
                    <Autocomplete
                        freeSolo
                        disableClearable
                        options={allLocations?.map((option) => option.name)}
                        onInputChange={(event, newInputValue) => {
                            setQuery(newInputValue);
                        }}
                        onChange={(event, value) => {
                            setQuery(value);
                            setError(null);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Wpisz nazwę budynku"
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: <LocationOn sx={{ color: 'action.active', mr: 1 }} />,
                                }}
                                fullWidth
                            />
                        )}
                        sx={{ flex: 1 }}
                    />

                    <Button
                        variant="contained"
                        startIcon={<Search />}
                        onClick={() => {
                            if (!query) return;
                            findPlace(query);
                        }}
                        sx={{
                            height: '56px',
                            px: 4,
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Szukaj
                    </Button>
                </Box>
            </Box>

            <Box sx={{
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 3,
                mb: 6
            }}>
                <MapContainer
                    center={[50.064496663386926, 19.92334282951794]}
                    zoom={16}
                    style={{
                        height: "500px",
                        width: "100%",
                    }}
                    whenCreated={(map) => {
                        mapRef.current = map;
                    }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    <FitBounds />

                    {locations?.map((loc) => (
                        <Marker
                            key={loc.id}
                            position={[loc.latitude, loc.longitude]}
                        >
                            <Popup>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                    {loc.name}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    {loc.symbol && loc.symbol !== "brak" ? loc.symbol : ''}
                                    {loc.symbol !== loc.abbreviation ? ` (${loc.abbreviation})` : ''}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    {loc.function}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 2 }}>
                                    {loc.address}
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<Directions />}
                                    onClick={() => handleOpenRoute(`${loc.latitude},${loc.longitude}`)}
                                >
                                    Wyznacz trasę
                                </Button>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </Box>

            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    Mapa miasteczka AGH
                </Typography>
                <Box
                    component="img"
                    src="/images/basic/mapa_agh.jpg"
                    alt="Mapa miasteczka AGH"
                    sx={{

                        p: 3,
                        height: 'auto',
                        borderRadius: 2,
                        boxShadow: 3,
                        maxWidth: '100%',
                    }}
                />
            </Box>
        </Container>
    );
};

export default Locations;