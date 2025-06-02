import {useCallback, useEffect, useState} from "react";
import {Container, Card, Form, Modal} from "react-bootstrap";
import client from "../../client";
import {API_BASE_URL} from "../../config";
import {FaCheckCircle, FaCoffee, FaEdit, FaExclamationTriangle} from "react-icons/fa";
import Cropper from "react-easy-crop";
import "./userProfile.css"
import {useNavigate} from "react-router-dom";
import {Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";

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
    borderRadius: theme.shape.borderRadius * 3,
    boxShadow: theme.shadows[6],
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    transition: "transform 0.3s ease",
    "&:hover": {
        transform: "translateY(-4px)",
    },
}));

const ProfileImageWrapper = styled("div")(({theme}) => ({
    position: "relative",
    width: 200,
    height: 200,
    margin: "0 auto",
    borderRadius: "50%",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
    "& svg": {
        fontSize: "2rem",
        backgroundColor: theme.palette.primary.main,
        borderRadius: "50%",
        padding: theme.spacing(1),
        boxShadow: theme.shadows[4],
    },
}));

const SectionHeader = styled(Typography)(({theme}) => ({
    fontSize: "1.5rem",
    fontWeight: 700,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(2),
    position: "relative",
    "&::after": {
        content: '""',
        position: "absolute",
        bottom: -8,
        left: 0,
        width: "40px",
        height: "4px",
        backgroundColor: theme.palette.primary.main,
        borderRadius: "2px",
    },
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

    // YOUR handleVerification FUNCTION GOES HERE
    const handleVerification = async () => {
        try {
            const student_id = prompt("Podaj swój numer indeksu (student ID):");

            const response = await client.post(API_BASE_URL + "generate-verification-code/", {
                student_id: student_id,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const generatedCode = response.data.verification_code;
            alert(`Twój kod weryfikacyjny: ${generatedCode}`);

            const enteredCode = prompt("Wpisz wygenerowany kod weryfikacyjny:");

            const verifyResponse = await client.post(API_BASE_URL + "verify-account/", {
                code: enteredCode,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (verifyResponse.status === 200) {
                alert("Konto zostało zweryfikowane!");
                setUser({ ...user, is_verified: true });
            } else {
                alert("Niepoprawny lub wygasły kod.");
            }
        } catch (error) {
            console.error("Błąd podczas weryfikacji konta:", error);
            alert("Wystąpił błąd podczas weryfikacji konta.");
        }
    };

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
        <Box sx={{
            maxWidth: 900,
            margin: "0 auto",
            p: 4,
            minHeight: "100vh",
            background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`
        }}>
            <StyledPaper elevation={3}>
                <Grid container spacing={4}>
                    {/* Profile Image Section */}
                    <Grid item xs={12} md={4} sx={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                        <ProfileImageWrapper
                            onMouseEnter={() => setHover(true)}
                            onMouseLeave={() => setHover(false)}
                            onClick={() => document.getElementById("fileInput").click()}
                        >
                            <Avatar
                                src={croppedImage || user?.profile_picture?.toString().slice(15) || "/images/basic/user_no_picture.png"}
                                alt="Profil"
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    border: `3px solid ${theme.palette.primary.main}`,
                                    "&:hover": {
                                        borderColor: theme.palette.primary.dark,
                                    },
                                }}
                            />
                            <EditOverlay className="edit-overlay">
                                <FaEdit color={theme.palette.common.white}/>
                            </EditOverlay>
                            <input
                                id="fileInput"
                                type="file"
                                accept="image/png, image/jpeg"
                                style={{display: "none"}}
                                onChange={handleImageUpload}
                            />
                        </ProfileImageWrapper>

                        <Typography variant="h4" sx={{mt: 3, fontWeight: 700, letterSpacing: -0.5}}>
                            {user?.username}
                        </Typography>

                        {/* Verification Status */}
                        <Box sx={{
                            mt: 3,
                            p: 2,
                            width: "100%",
                            borderRadius: theme.shape.borderRadius,
                            bgcolor: user?.is_verified ?
                                theme.palette.success.light :
                                theme.palette.warning.light,
                            textAlign: "center",
                            border: `1px solid ${user?.is_verified ? 
                                theme.palette.success.dark : 
                                theme.palette.warning.dark}`
                        }}>
                            {user?.is_verified ? (
                                <>
                                    <FaCheckCircle size={28} color={theme.palette.success.dark}/>
                                    <Typography variant="body1" sx={{mt: 1, fontWeight: 500}}>
                                        Konto zweryfikowane
                                    </Typography>
                                </>
                            ) : (
                                <>
                                    <FaExclamationTriangle size={28} color={theme.palette.warning.dark}/>
                                    <Typography variant="body1" sx={{mt: 1, fontWeight: 500}}>
                                        Wymagana weryfikacja
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        size="medium"
                                        sx={{
                                            mt: 2,
                                            borderRadius: "8px",
                                            py: 1,
                                            px: 3,
                                            fontWeight: 600
                                        }}
                                        onClick={handleVerification}
                                    >
                                        Zweryfikuj konto
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Grid>

                    {/* User Info Section */}
                    <Grid item xs={12} md={8}>
                        <Box sx={{mb: 4}}>
                            <SectionHeader variant="h2">
                                Dane osobowe
                            </SectionHeader>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Imię"
                                        name="firstName"
                                        value={user?.name || ""}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        variant="outlined"
                                        InputLabelProps={{
                                            style: {color: theme.palette.text.secondary}
                                        }}
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
                                        variant="outlined"
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
                                        variant="outlined"
                                        InputProps={{
                                            endAdornment: (
                                                <IconButton size="small" sx={{mr: -1}}>
                                                    <FaEdit fontSize="small"/>
                                                </IconButton>
                                            ),
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        <Box sx={{mb: 4}}>
                            <SectionHeader variant="h2">
                                Informacje uczelniane
                            </SectionHeader>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Wydział"
                                        value="EAIIB"
                                        variant="outlined"
                                        disabled
                                        InputLabelProps={{shrink: true}}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Kierunek"
                                        value="AiR"
                                        variant="outlined"
                                        disabled
                                        InputLabelProps={{shrink: true}}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Email uczelniany"
                                        value="student@aaa.edu.pl"
                                        variant="outlined"
                                        disabled
                                        InputProps={{
                                            endAdornment: (
                                                <IconButton size="small" disabled sx={{mr: -1}}>
                                                    <FaEdit fontSize="small"/>
                                                </IconButton>
                                            ),
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Action Buttons */}
                        <Box sx={{
                            mt: 4,
                            display: "flex",
                            gap: 2,
                            justifyContent: "flex-end",
                            borderTop: `1px solid ${theme.palette.divider}`,
                            pt: 3
                        }}>
                            <Button
                                variant={isEditing ? "contained" : "outlined"}
                                color="primary"
                                onClick={() => setIsEditing(!isEditing)}
                                sx={{
                                    borderRadius: "8px",
                                    px: 4,
                                    py: 1.5,
                                    fontWeight: 600,
                                    textTransform: "none",
                                    "&:hover": {
                                        transform: "translateY(-1px)",
                                        boxShadow: theme.shadows[2],
                                    }
                                }}
                            >
                                {isEditing ? "Zapisz zmiany" : "Edytuj profil"}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </StyledPaper>

            {/* Additional Sections */}
            <Grid container spacing={3} sx={{mt: 2}}>
                <Grid item xs={12} md={6}>
                    <StyledPaper sx={{
                        background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
                        color: theme.palette.primary.contrastText
                    }}>
                        <Box sx={{textAlign: "center", p: 3}}>
                            <FaCoffee size={32} style={{marginBottom: 16}}/>
                            <Typography variant="h6" gutterBottom sx={{fontWeight: 700}}>
                                Wesprzyj naszą platformę
                            </Typography>
                            <Button
                                variant="contained"
                                color="secondary"
                                sx={{
                                    borderRadius: "8px",
                                    px: 4,
                                    py: 1.5,
                                    fontWeight: 600,
                                    textTransform: "none",
                                    boxShadow: theme.shadows[3],
                                    "&:hover": {
                                        transform: "translateY(-1px)",
                                        boxShadow: theme.shadows[4],
                                    }
                                }}
                            >
                                Postaw kawę
                            </Button>
                        </Box>
                    </StyledPaper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <StyledPaper sx={{
                        background: theme.palette.error.light,
                        borderColor: theme.palette.error.dark
                    }}>
                        <Box sx={{p: 3}}>
                            <Typography variant="h6" gutterBottom sx={{fontWeight: 700}}>
                                Niebezpieczna strefa
                            </Typography>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleClickOpen}
                                sx={{
                                    borderRadius: "8px",
                                    px: 4,
                                    py: 1.5,
                                    fontWeight: 600,
                                    textTransform: "none",
                                    borderWidth: 2,
                                    "&:hover": {
                                        borderWidth: 2,
                                        backgroundColor: theme.palette.error.dark + "15",
                                    }
                                }}
                            >
                                Usuń konto
                            </Button>
                        </Box>
                    </StyledPaper>
                </Grid>
            </Grid>

            {/* Crop Modal */}
            <Dialog open={showCropModal} onClose={() => setShowCropModal(false)} maxWidth="md">
                <DialogTitle sx={{fontWeight: 700}}>Przytnij zdjęcie profilowe</DialogTitle>
                <DialogContent>
                    <Box sx={{
                        position: "relative",
                        height: 400,
                        bgcolor: theme.palette.grey[900],
                        borderRadius: theme.shape.borderRadius,
                        overflow: "hidden"
                    }}>
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
                                classes={{containerClassName: "crop-container"}}
                            />
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{p: 3}}>
                    <Button
                        onClick={() => setShowCropModal(false)}
                        sx={{mr: 2, px: 4}}
                    >
                        Anuluj
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCropSave}
                        sx={{px: 4}}
                    >
                        Zapisz zmiany
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Account Dialog */}
            <Dialog
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        borderRadius: "12px",
                        border: `2px solid ${theme.palette.error.main}`
                    }
                }}
            >
                <DialogTitle sx={{fontWeight: 700, color: theme.palette.error.main}}>
                    Usuwanie konta
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{mt: 2}}>
                        Ta akcja jest nieodwracalna! Wszystkie Twoje dane zostaną trwale usunięte.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{p: 3}}>
                    <Button
                        onClick={handleClose}
                        sx={{color: theme.palette.text.secondary}}
                    >
                        Anuluj
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteAccount}
                        sx={{
                            px: 4,
                            "&:hover": {
                                backgroundColor: theme.palette.error.dark
                            }
                        }}
                    >
                        Usuń konto
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}