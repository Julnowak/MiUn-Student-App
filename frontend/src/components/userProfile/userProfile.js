import {useCallback, useEffect, useState} from "react";
import {Container, Card, Form, Modal} from "react-bootstrap";
import client from "../../client";
import {API_BASE_URL} from "../../config";
import {FaCheckCircle, FaCoffee, FaEdit, FaExclamationTriangle} from "react-icons/fa";
import Cropper from "react-easy-crop";
import "./userProfile.css"
import {useNavigate} from "react-router-dom";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";

import {
    Box,
    Divider,
    Grid,
    IconButton,
    Paper,
    styled,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import "./userProfile.css";

// Utility function to crop image (to be implemented)
async function getCroppedImg(imageSrc, croppedAreaPixels) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = imageSrc;
        image.crossOrigin = "anonymous";

        image.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = croppedAreaPixels.width;
            canvas.height = croppedAreaPixels.height;

            ctx.drawImage(
                image,
                croppedAreaPixels.x, croppedAreaPixels.y,
                croppedAreaPixels.width, croppedAreaPixels.height,
                0, 0,
                canvas.width, canvas.height
            );

            canvas.toBlob((blob) => {
                if (!blob) {
                    return reject(new Error("Błąd konwersji obrazu"));
                }
                resolve(blob);
            }, "image/png");
        };

        image.onerror = (error) => reject(error);
    });
}


const StyledPaper = styled(Paper)(({theme}) => ({
    padding: theme.spacing(4),
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: theme.shadows[4],
    background: `linear-gradient(145deg, ${theme.palette.background.default}, ${theme.palette.background.paper})`,
}));

const ProfileImageWrapper = styled("div")(({theme}) => ({
    position: "relative",
    width: 188,
    height: 188,
    margin: "0 auto",
    borderRadius: "50%",
    transition: "transform 0.3s ease",
    "&:hover": {
        transform: "scale(1.05)",
        "& .edit-overlay": {
            opacity: 1,
        },
    },
}));

const EditOverlay = styled("div")(({theme}) => ({
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: "50%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "opacity 0.3s ease",
    cursor: "pointer",
}));

export default function UserProfile() {
    const theme = useTheme();
    const [user, setUser] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [hover, setHover] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [crop, setCrop] = useState({x: 0, y: 0});
    const [zoom, setZoom] = useState(1);
    const [croppedImage, setCroppedImage] = useState(null);
    const [showCropModal, setShowCropModal] = useState(false);
    const token = localStorage.getItem("access");
    const navigate = useNavigate()


    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await client.get(API_BASE_URL + "user/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUser(response.data);
                console.log("Zalogowano");
                console.log(response.data);
            } catch (error) {
                console.log("Nie udało się zalogować");
            }
        };

        if (token) {
            fetchUserData();
        }
    }, [token]);

    const handleDeleteAccount = () => {
        if (window.confirm("Czy na pewno chcesz usunąć swoje konto?")) {
            try {
                const response = client.delete(API_BASE_URL + "user/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                // setUser(response.data);
                console.log("Zalogowano");
                console.log(response.data);
                navigate("/")
            } catch (error) {
                console.log("Nie udało się zalogować");
            }
        }
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result);
                setShowCropModal(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        setUser({
            ...user,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleCropSave = async () => {
        if (!imageSrc || !croppedAreaPixels) {
            console.error("Brak obrazu lub danych przycięcia.");
            return;
        }

        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            const imageType = croppedBlob.type || "image/png"; // Default to PNG
            const fileExtension = imageType === "image/png" ? "png" : "jpg";
            const croppedFile = new File([croppedBlob], `profile_picture.${fileExtension}`, {type: imageType});
            const formData = new FormData();
            formData.append("profile_picture", croppedFile); // Match Django field name

            const response = await client.post(API_BASE_URL + "user/", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data", // Let browser handle boundaries
                },
            });

            console.log("Updated user profile:", response.data);

            setCroppedImage(response.data.profile_picture.toString().slice(15)); // Update frontend state
            setUser({...user, profile_picture: response.data.profile_picture.toString().slice(15)}); // Update user data
            localStorage.setItem("image_set", response.data.profile_picture.toString().slice(15))
            setShowCropModal(false);
        } catch (error) {
            console.error("Error cropping or uploading:", error);
        }
    };

    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    return (
        <Box sx={{maxWidth: 800, margin: "0 auto", p: 3}}>
            <StyledPaper elevation={3}>
                <Grid container spacing={4}>
                    {/* Profile Image Section */}
                    <Grid item xs={12} md={4} sx={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                        <ProfileImageWrapper
                            onMouseEnter={() => setHover(true)}
                            onMouseLeave={() => setHover(false)}
                            onClick={() => document.getElementById("fileInput").click()}
                        >
                            <img
                                src={croppedImage || user?.profile_picture?.toString().slice(15) || "/images/basic/user_no_picture.png"}
                                alt="Profil"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                }}
                            />
                            <EditOverlay className="edit-overlay">
                                <FaEdit size={32} color={theme.palette.common.white}/>
                            </EditOverlay>
                            <input
                                id="fileInput"
                                type="file"
                                accept="image/png, image/jpeg"
                                style={{display: "none"}}
                                onChange={handleImageUpload}
                            />
                        </ProfileImageWrapper>

                        <Typography variant="h5" sx={{mt: 2, fontWeight: 600}}>
                            {user?.username}
                        </Typography>

                        {/* Verification Status */}
                        <Box sx={{
                            mt: 2,
                            p: 2,
                            width: "100%",
                            borderRadius: theme.shape.borderRadius,
                            bgcolor: user?.is_verified ? "success.light" : "warning.light",
                            textAlign: "center"
                        }}>
                            {user?.is_verified ? (
                                <>
                                    <FaCheckCircle size={24} color={theme.palette.success.main}/>
                                    <Typography variant="body2" sx={{mt: 1, color: "success.dark"}}>
                                        Konto zweryfikowane
                                    </Typography>
                                </>
                            ) : (
                                <>
                                    <FaExclamationTriangle size={24} color={theme.palette.warning.main}/>
                                    <Typography variant="body2" sx={{mt: 1, color: "warning.dark"}}>
                                        Wymagana weryfikacja
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        sx={{mt: 1, borderRadius: "20px"}}
                                    >
                                        Zweryfikuj konto
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Grid>

                    {/* User Info Section */}
                    <Grid item xs={12} md={8}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom sx={{fontWeight: 600}}>
                                    Dane osobowe
                                </Typography>
                                <Divider sx={{mb: 2}}/>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Imię"
                                            name="firstName"
                                            value={user?.name || ""}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            variant="filled"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Nazwisko"
                                            name="lastName"
                                            value={user?.surname || ""}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            variant="filled"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            name="email"
                                            value={user?.email || ""}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            variant="filled"
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom sx={{fontWeight: 600}}>
                                    Informacje uczelniane
                                </Typography>
                                <Divider sx={{mb: 2}}/>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Wydział"
                                            value="EAIIB"
                                            variant="filled"
                                            disabled
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Kierunek"
                                            value="AiR"
                                            variant="filled"
                                            disabled
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Email uczelniany"
                                            value="student@aaa.edu.pl"
                                            variant="filled"
                                            disabled
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Action Buttons */}
                        <Box sx={{mt: 4, display: "flex", gap: 2, justifyContent: "flex-end"}}>
                            <Button
                                variant={isEditing ? "contained" : "outlined"}
                                color={isEditing ? "success" : "primary"}
                                onClick={() => setIsEditing(!isEditing)}
                                sx={{borderRadius: "20px", px: 4}}
                            >
                                {isEditing ? "Zapisz zmiany" : "Edytuj profil"}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </StyledPaper>

            {/* Additional Sections */}
            <Box sx={{mt: 4, display: "flex", gap: 4, flexDirection: {xs: "column", md: "row"}}}>
                <StyledPaper sx={{flex: 1, background: theme.palette.primary.light}}>
                    <Box sx={{textAlign: "center"}}>
                        <Typography variant="h6" gutterBottom sx={{fontWeight: 600}}>
                            Wesprzyj naszą platformę
                        </Typography>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<FaCoffee/>}
                            sx={{borderRadius: "20px", px: 4}}
                        >
                            Postaw kawę
                        </Button>
                    </Box>
                </StyledPaper>

                <StyledPaper sx={{flex: 1, bgcolor: "error.light"}}>
                    <Typography variant="h6" gutterBottom sx={{fontWeight: 600}}>
                        Niebezpieczna strefa
                    </Typography>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleClickOpen}
                        sx={{borderRadius: "20px"}}
                    >
                        Usuń konto
                    </Button>
                </StyledPaper>
            </Box>

            {/* Crop Modal */}
            <Modal show={showCropModal} onHide={() => setShowCropModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Przytnij zdjęcie</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{position: "relative", height: 300, background: "#333"}}>
                        {imageSrc && (
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                                cropShape="round"
                                showGrid={false}
                            />
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant={"contained"} onClick={() => setShowCropModal(false)}>Anuluj</Button>
                    <Button variant={"contained"} onClick={handleCropSave}>Zapisz</Button>
                </Modal.Footer>
            </Modal>

            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Czy na pewno chcesz usunąć konto?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Operacja jest nieodwracalna, a wszystkie
                        Twoje dane zostaną usunięte! Czy chcesz kontynuować?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Anuluj</Button>
                    <Button variant={"contained"} onClick={handleDeleteAccount} autoFocus>
                        Usuń konto
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}