import {useCallback, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import client from "../../client";
import {API_BASE_URL} from "../../config";
import {FaCheckCircle, FaCoffee, FaEdit, FaExclamationTriangle} from "react-icons/fa";
import Cropper from "react-easy-crop";
import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Paper,
    styled,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import {Warning} from "@mui/icons-material";
import {red} from "@mui/material/colors";

// Utility function to crop image (unchanged)
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

// Modern styled components
const MinimalPaper = styled(Paper)(({theme}) => ({
    padding: theme.spacing(4),
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
}));

const ProfileImageWrapper = styled("div")({
    position: "relative",
    width: 160,
    height: 160,
    margin: "0 auto",
    borderRadius: "50%",
    cursor: "pointer",
});

const EditOverlay = styled("div")(({theme}) => ({
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: "50%",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "opacity 0.2s ease",
    "&:hover": {
        opacity: 1,
    },
    "& svg": {
        fontSize: "1.5rem",
        color: theme.palette.common.white,
    },
}));

const SectionHeader = styled(Typography)(({theme}) => ({
    fontSize: "1.25rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(3),
    letterSpacing: 0.5,
}));

const ActionButton = styled(Button)(({theme}) => ({
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1.5, 4),
    fontWeight: 500,
    textTransform: 'none',
    letterSpacing: 0.5,
    transition: 'all 0.2s ease',
}));

export default function UserProfile() {
    const theme = useTheme();
    const [user, setUser] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [crop, setCrop] = useState({x: 0, y: 0});
    const [zoom, setZoom] = useState(1);
    const [croppedImage, setCroppedImage] = useState(null);
    const [showCropModal, setShowCropModal] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const token = localStorage.getItem("access");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await client.get(API_BASE_URL + "user/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUser(response.data);
            } catch (error) {
                console.error("Failed to fetch user data");
            }
        };

        if (token) {
            fetchUserData();
        }
    }, [token]);

    const handleDeleteAccount = async () => {
        try {
            await client.delete(API_BASE_URL + "user/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            navigate("/");
        } catch (error) {
            console.error("Failed to delete account");
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
        if (!imageSrc || !croppedAreaPixels) return;

        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            const imageType = croppedBlob.type || "image/png";
            const fileExtension = imageType === "image/png" ? "png" : "jpg";
            const croppedFile = new File([croppedBlob], `profile_picture.${fileExtension}`, {type: imageType});
            const formData = new FormData();
            formData.append("profile_picture", croppedFile);

            const response = await client.post(API_BASE_URL + "user/", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            setCroppedImage(response.data.profile_picture.toString().slice(15));
            setUser({...user, profile_picture: response.data.profile_picture.toString().slice(15)});
            localStorage.setItem("image_set", response.data.profile_picture.toString().slice(15));
            setShowCropModal(false);
        } catch (error) {
            console.error("Error cropping or uploading:", error);
        }
    };

    return (
        <Box sx={{
            maxWidth: 900,
            margin: "0 auto",
            p: {xs: 2, md: 4},
            minHeight: "100vh",
        }}>
            {/* Main Profile Card */}
            <MinimalPaper elevation={0}>
                <Grid container spacing={4}>
                    {/* Left Column - Profile Image */}
                    <Grid item xs={12} md={4}>
                        <Box sx={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                            <ProfileImageWrapper onClick={() => document.getElementById("fileInput").click()}>
                                <Avatar
                                    src={croppedImage || user?.profile_picture?.toString().slice(15) || "/images/basic/user_no_picture.png"}
                                    alt="Profile"
                                    sx={{
                                        width: "100%",
                                        height: "100%",
                                        border: `2px solid ${theme.palette.divider}`,
                                    }}
                                />
                                <EditOverlay>
                                    <FaEdit />
                                </EditOverlay>
                                <input
                                    id="fileInput"
                                    type="file"
                                    accept="image/png, image/jpeg"
                                    style={{display: "none"}}
                                    onChange={handleImageUpload}
                                />
                            </ProfileImageWrapper>

                            <Typography variant="h6" sx={{mt: 3, fontWeight: 600}}>
                                {user?.username}
                            </Typography>

                            {/* Verification Status */}
                            <Box sx={{
                                mt: 3,
                                p: 2,
                                width: "100%",
                                borderRadius: 1,
                                bgcolor: theme.palette.background.default,
                                textAlign: "center",
                            }}>
                                {user?.is_verified ? (
                                    <Box sx={{ maxWidth: 300, m: "auto", borderRadius: 2, p:2}}>
                                        <FaCheckCircle size={24} color={theme.palette.success.main}/>
                                        <Typography variant="body2" sx={{mt: 1, fontWeight: 500}}>
                                            Konto zweryfikowane
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{backgroundColor: "rgba(225,225,225,0.53)", maxWidth: 300, m: "auto", borderRadius: 2, p:2}}>
                                        <FaExclamationTriangle size={24} color={"gray"}/>
                                        <Typography variant="body2" sx={{mt: 1, fontWeight: 500}}>
                                            Wymagana weryfikacja
                                        </Typography>
                                        <ActionButton
                                            variant="contained"
                                            size="small"
                                            onClick={() => navigate("/verify-email")}
                                            sx={{mt: 2, backgroundColor: "lightgray", color: "black"}}
                                        >
                                            Zweryfikuj konto
                                        </ActionButton>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Grid>

                    {/* Right Column - User Info */}
                    <Grid item xs={12} md={8}>
                        {/* Personal Data */}
                        <Box sx={{mb: 4}}>
                            <SectionHeader variant="h2">
                                Dane osobowe
                            </SectionHeader>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Imię"
                                        name="firstName"
                                        value={user?.name || ""}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        variant="outlined"
                                        size="small"
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
                                        size="small"
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
                                        size="small"
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        {/* University Info */}
                        {user?.is_verified && (
                            <Box sx={{mb: 4}}>
                            <SectionHeader variant="h2">
                                Informacje uczelniane
                            </SectionHeader>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Wydział"
                                        value="EAIIB"
                                        variant="outlined"
                                        disabled
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Kierunek"
                                        value="AiR"
                                        variant="outlined"
                                        disabled
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Email uczelniany"
                                        value="student@aaa.edu.pl"
                                        variant="outlined"
                                        disabled
                                        size="small"
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                        )}


                        {/* Action Buttons */}
                        <Box sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            pt: 3,
                            borderTop: `1px solid ${theme.palette.divider}`,
                        }}>
                            <ActionButton
                                variant={isEditing ? "contained" : "outlined"}
                                onClick={() => setIsEditing(!isEditing)}
                                sx={{mr: 2}}
                            >
                                {isEditing ? "Zapisz zmiany" : "Edytuj profil"}
                            </ActionButton>
                        </Box>
                    </Grid>
                </Grid>
            </MinimalPaper>

            {/* Action Cards */}
            <Grid container spacing={2} sx={{mt: 2}}>
                <Grid item xs={12} md={6}>
                    <MinimalPaper sx={{bgcolor: theme.palette.background.default}}>
                        <Box sx={{textAlign: "center"}}>
                            <FaCoffee size={24} style={{marginBottom: 8}}/>
                            <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 600}}>
                                Wesprzyj naszą platformę
                            </Typography>
                            <ActionButton
                                variant="contained"
                                color="primary"
                                sx={{mt:1}}
                            >
                                Postaw kawę
                            </ActionButton>
                        </Box>
                    </MinimalPaper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <MinimalPaper>
                        <Box sx={{textAlign: "center"}}>
                            <Warning size={24} style={{marginBottom: 8}}/>
                            <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 600, textAlign: "center"}}>
                                Niebezpieczna strefa
                            </Typography>
                            <ActionButton
                                variant="outlined"
                                color="error"
                                onClick={() => setOpenDeleteDialog(true)}
                                sx={{borderWidth: 2, mt: 1, '&:hover': {borderWidth: 2}}}
                            >
                                Usuń konto
                            </ActionButton>
                        </Box>
                    </MinimalPaper>
                </Grid>
            </Grid>

            {/* Crop Modal */}
            <Dialog
                open={showCropModal}
                onClose={() => setShowCropModal(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{fontWeight: 600}}>Przytnij zdjęcie profilowe</DialogTitle>
                <DialogContent>
                    <Box sx={{
                        position: "relative",
                        height: 300,
                        bgcolor: theme.palette.grey[100],
                        borderRadius: 1,
                        overflow: "hidden",
                        mt: 2
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
                            />
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <ActionButton onClick={() => setShowCropModal(false)}>
                        Anuluj
                    </ActionButton>
                    <ActionButton variant="contained" onClick={handleCropSave}>
                        Zapisz
                    </ActionButton>
                </DialogActions>
            </Dialog>

            {/* Delete Account Dialog */}
            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.error.main}`
                    }
                }}
            >
                <DialogTitle sx={{fontWeight: 600, color: theme.palette.error.main}}>
                    Usuwanie konta
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Ta akcja jest nieodwracalna. Wszystkie Twoje dane zostaną trwale usunięte.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <ActionButton onClick={() => setOpenDeleteDialog(false)}>
                        Anuluj
                    </ActionButton>
                    <ActionButton
                        variant="contained"
                        color="error"
                        onClick={handleDeleteAccount}
                    >
                        Usuń konto
                    </ActionButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
}