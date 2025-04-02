import {useCallback, useEffect, useState} from "react";
import {Container, Card, Form, Button, Modal} from "react-bootstrap";
import client from "../../client";
import {API_BASE_URL} from "../../config";
import {FaEdit} from "react-icons/fa";
import Cropper from "react-easy-crop";
import "./userProfile.css"
import {navigate} from "react-big-calendar/lib/utils/constants";
import {useNavigate} from "react-router-dom";

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


export default function UserProfile() {
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


    return (
        <div style={{maxWidth: 1000, margin: "auto", marginTop: 120}}>
            <div className={"grid-container"} style={{backgroundColor: "#c1c1c1", margin: 20, borderRadius: 20}}>
                <div className={"item1"} style={{maxWidth: 1000, padding: 20, height: 150}}>
                    <div
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                        style={{
                            left: "0",
                            top: "50%",
                            width: 188,
                            margin: "auto",
                            transform: "translateY(-60%)",
                            cursor: "pointer",
                        }}
                    >
                        <img
                            src={croppedImage
                                ? croppedImage
                                : user?.profile_picture
                                    ? user?.profile_picture.toString().slice(15)
                                    : "/images/basic/user_no_picture.png"}
                            alt="Profil"
                            className="rounded-circle"
                            width="188"
                            height="188"
                            style={{filter: hover ? "brightness(1.2)" : "brightness(1)"}}
                        />

                        {hover && (
                            <>
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        background: "rgba(255,255,255,0.41)",
                                        padding: 74,
                                        borderRadius: 188,
                                        cursor: "pointer",
                                    }}
                                    onClick={() => document.getElementById("fileInput").click()}
                                ><FaEdit style={{width: 40, height: 40}} color={"black"}/></div>
                                <input
                                    id="fileInput"
                                    type="file"
                                    accept="image/png, image/jpeg"
                                    style={{display: "none"}}
                                    onChange={handleImageUpload}
                                />
                            </>
                        )}

                        <h3 style={{
                            position: "absolute", margin: "auto", top: "100%", transform: "translate(-50%, 50%)",
                            left: "50%", cursor: "pointer",
                        }}>{user?.username}</h3>

                    </div>
                </div>


                <div className="button-section"
                     style={{gridColumn: "span 2", color: "black", width: "100%", textAlign: "center", margin: "auto", backgroundColor: "rgba(213,213,213,0.52)", borderRadius: 20}}>
                    <div>
                        <h6>Konto niezweryfikowane</h6>
                        <p>
                            Musisz zweryfikować swoje konto przy użycia e-maila uczelnianego, aby mieć dostęp do wszystkich funkcji aplikacji.
                        </p>
                        <Button variant={"dark"}>Zweryfikuj</Button>
                    </div>
                </div>

                {/* User Info */}

                <div
                    style={{
                        backgroundColor: "rgba(255,255,255,0.41)",
                        borderRadius: 20,
                        padding: 20,
                    }}
                >
                    <Form>
                        <Form.Group className="mb-3 d-flex align-items-center">
                            <Form.Label style={{width: "150px", marginRight: "10px"}}>Imię</Form.Label>
                            <Form.Control
                                type="text"
                                name="firstName"
                                value={user?.name}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3 d-flex align-items-center">
                            <Form.Label style={{width: "150px", marginRight: "10px"}}>Nazwisko</Form.Label>
                            <Form.Control
                                type="text"
                                name="lastName"
                                value={user?.surname}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3 d-flex align-items-center">
                            <Form.Label style={{width: "150px", marginRight: "10px"}}>Email</Form.Label>
                            <Form.Control
                                type="email" name="email"
                                value={user?.email}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3 d-flex align-items-center">
                            <Form.Label style={{width: "150px", marginRight: "10px"}}>Adres</Form.Label>
                            <Form.Control
                                type="text"
                                name="address"
                                value={user?.address}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Form.Group>
                    </Form>
                </div>


                <div
                    style={{
                        backgroundColor: "rgba(255,255,255,0.41)",
                        borderRadius: 20,
                        padding: 20,
                    }}
                >
                    <Form.Group className="mb-3 d-flex align-items-center">
                            <Form.Label style={{width: "150px", marginRight: "10px"}}>Wydział</Form.Label>
                        <Form.Select
                            name="faculty"
                            value="EAIIB"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3 d-flex align-items-center">
                            <Form.Label style={{width: "150px", marginRight: "10px"}}>Kierunek</Form.Label>
                        <Form.Select
                            name="field"
                            value="AiR"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3 d-flex align-items-center">
                            <Form.Label style={{width: "150px", marginRight: "10px"}}>Email uczelniany</Form.Label>
                        <Form.Control
                            name="student-email"
                            value="student@aaa.edu.pl"
                        />
                    </Form.Group>
                </div>

                {/* Button Section (Merged Row) */}
                <div className="button-section"
                     style={{gridColumn: "span 2", textAlign: "center", width: 200, margin: "auto"}}>
                    <Button style={{width: 200}} variant="dark" onClick={() => setIsEditing(!isEditing)}>
                        {isEditing ? "Zapisz zmiany" : "Edytuj"}
                    </Button>
                </div>

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
                        <Button variant="secondary" onClick={() => setShowCropModal(false)}>Anuluj</Button>
                        <Button variant="primary" onClick={handleCropSave}>Zapisz</Button>
                    </Modal.Footer>
                </Modal>

            </div>

            <div style={{borderRadius: 20, padding: 20, backgroundColor: "rgba(133,74,47,0.87)", margin: 40}}>
                <h3>
                    Kawka
                </h3>
                <p>
                    Jeżeli podoba Ci się to, co robimy - postaw nam kawę :)
                </p>
                <Button variant="outline-dark" style={{maxWidth: 200}}>Postaw
                    kawę</Button>
                <Button variant="outline-dark" style={{maxWidth: 200}}>Dotacja</Button>
            </div>

            <div style={{borderRadius: 20, padding: 20, backgroundColor: "rgba(255,0,128,0.56)", margin: 40}}>
                <h3>
                    Usuwanie konta
                </h3>
                <p>
                    W tym miejscu usuniesz swoje konto.
                </p>
                <Button variant="outline-dark" style={{maxWidth: 200}} onClick={handleDeleteAccount}>Usuń konto</Button>
            </div>
        </div>
    );
}