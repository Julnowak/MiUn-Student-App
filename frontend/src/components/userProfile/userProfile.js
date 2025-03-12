import {useCallback, useEffect, useState} from "react";
import {Container, Card, Form, Button, Modal} from "react-bootstrap";
import client from "../../client";
import {API_BASE_URL} from "../../config";
import {FaEdit} from "react-icons/fa";
import Cropper from "react-easy-crop";
import "./userProfile.css"

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
    const [croppedImage, setCroppedImage] = useState("/images/basic/user_no_picture.png");
    const [showCropModal, setShowCropModal] = useState(false);
    const token = localStorage.getItem("access");


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
            console.log("Konto usunięte");
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
            const croppedImageUrl = URL.createObjectURL(croppedBlob);
            setCroppedImage(croppedImageUrl);
            setUser({...user, profile_picture: croppedImageUrl});
            setShowCropModal(false);
        } catch (error) {
            console.error("Błąd przycinania:", error);
        }
    };


    return (
        <div style={{maxWidth: 1000, margin: "auto"}}>
            <div style={{maxWidth: 1000, padding: 20}}>
                <h1 style={{textAlign: "left"}}>Profil użytkownika</h1>
                <Button onClick={() => setIsEditing(!isEditing)} className="mb-3">
                    {isEditing ? "Wyłącz edycję" : "Włącz edycję"}
                </Button>
                <div className="position-relative d-flex align-items-center bg-light p-4" style={{
                    minHeight: "150px",
                    borderBottomLeftRadius: 100, borderTopLeftRadius: 100
                }}>
                    {/* Profile Image */}
                    <div
                        className="rounded-circle position-absolute"
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                        style={{left: "0", top: "50%", transform: "translateY(-50%)", cursor: "pointer",}}
                    >
                        <img
                            src={croppedImage || user.profile_picture}
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
                    </div>
                    {/* User Info */}
                    <div style={{marginLeft: 80}}>
                        <Form.Group>
                            <Form.Label>Nazwa użytkownika</Form.Label>
                            <Form.Control style={{marginLeft: 110, maxWidth: 300}} type="text" name="username"
                                          value={user.username} onChange={handleChange} disabled={!isEditing}/>
                        </Form.Group>
                        <Form.Group className="">
                            <Form.Label>Email</Form.Label>
                            <Form.Control style={{marginLeft: 110, maxWidth: 300}} type="email" name="email"
                                          value={user.email} onChange={handleChange} disabled={!isEditing}/>
                        </Form.Group>
                    </div>
                </div>

                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Imię</Form.Label>
                        <Form.Control type="text" name="firstName" value={user.name} onChange={handleChange}
                                      disabled={!isEditing}/>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Nazwisko</Form.Label>
                        <Form.Control type="text" name="lastName" value={user.surname} onChange={handleChange}
                                      disabled={!isEditing}/>
                    </Form.Group>
                    <Button variant="primary" className="w-100 mb-2" disabled={!isEditing}>Zapisz zmiany</Button>
                    <Button variant="danger" className="w-100" onClick={handleDeleteAccount}>Usuń konto</Button>
                </Form>
            </div>
            {/* Crop Modal */}
            <Modal show={showCropModal} onHide={() => setShowCropModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Przytnij zdjęcie</Modal.Title>
                </Modal.Header>
                <Modal.Body >
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
    );
}