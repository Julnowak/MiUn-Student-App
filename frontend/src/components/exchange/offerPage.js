import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  CircularProgress,
  Divider, IconButton, Dialog,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MessageIcon from '@mui/icons-material/Message';
import {ArrowBackIosNew, ArrowForwardIos, Close} from "@mui/icons-material";
import ContactSection from "./contactSection";

const OfferPage = () => {
  const { id } = useParams();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);


  useEffect(() => {
    const fetchOffer = async () => {
      try {
        // const res = await fetch(`http://localhost:8000/api/offers/${id}/`);
        // const data = await res.json();
        // setOffer(data);
        setOffer({
          "id": 1,
          "title": "Sprzedam rower górski",
          "price": 900,
          "description": "Rower w bardzo dobrym stanie, używany sporadycznie.",
          "location": "Kraków, Małopolskie",
          "created_at": "2025-05-01T12:00:00Z",
          "category": "Sport i Hobby",
          "images": [
            "https://upload.wikimedia.org/wikipedia/commons/5/56/Ma%C5%82y_kot_domowy.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Felis_catus_%28Argenta%2C_Karbon%29_in_Szczecin%2C_2020.jpg/1024px-Felis_catus_%28Argenta%2C_Karbon%29_in_Szczecin%2C_2020.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Felis_catus_%28Argenta%2C_Karbon%29_in_Szczecin%2C_2020.jpg/1024px-Felis_catus_%28Argenta%2C_Karbon%29_in_Szczecin%2C_2020.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Felis_catus_%28Argenta%2C_Karbon%29_in_Szczecin%2C_2020.jpg/1024px-Felis_catus_%28Argenta%2C_Karbon%29_in_Szczecin%2C_2020.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Felis_catus_%28Argenta%2C_Karbon%29_in_Szczecin%2C_2020.jpg/1024px-Felis_catus_%28Argenta%2C_Karbon%29_in_Szczecin%2C_2020.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Felis_catus_%28Argenta%2C_Karbon%29_in_Szczecin%2C_2020.jpg/1024px-Felis_catus_%28Argenta%2C_Karbon%29_in_Szczecin%2C_2020.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Felis_catus_%28Argenta%2C_Karbon%29_in_Szczecin%2C_2020.jpg/1024px-Felis_catus_%28Argenta%2C_Karbon%29_in_Szczecin%2C_2020.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Felis_catus_%28Argenta%2C_Karbon%29_in_Szczecin%2C_2020.jpg/1024px-Felis_catus_%28Argenta%2C_Karbon%29_in_Szczecin%2C_2020.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Felis_catus_%28Argenta%2C_Karbon%29_in_Szczecin%2C_2020.jpg/1024px-Felis_catus_%28Argenta%2C_Karbon%29_in_Szczecin%2C_2020.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Felis_catus_%28Argenta%2C_Karbon%29_in_Szczecin%2C_2020.jpg/1024px-Felis_catus_%28Argenta%2C_Karbon%29_in_Szczecin%2C_2020.jpg"
          ],
          "user_name": "Jan Kowalski"
        });
        setLoading(false);
      } catch (error) {
        console.error('Błąd ładowania oferty:', error);
      }
    };
    fetchOffer();
  }, [id]);

  const handleOpenModal = (index) => {
    setCurrentImageIndex(index);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? offer.images.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === offer.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (loading) return <Box textAlign="center" mt={10}><CircularProgress /></Box>;

  return (
    <Box p={3} maxWidth="1200px" margin="auto">
      <Grid container spacing={3}>
        {/* Galeria główna */}
        <Grid item xs={12} md={8}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => handleOpenModal(0)}>
            <CardMedia
              component="img"
              image={offer.images?.[0] || "/placeholder.jpg"}
              alt="Zdjęcie oferty"
              sx={{ height: 400, objectFit: 'cover' }}
            />
          </Card>
          <Box display="flex" gap={1} mt={1}>
            {offer.images?.slice(1).map((img, idx) => (
              <Card
                key={idx + 1}
                sx={{ width: 100, height: 100, cursor: 'pointer' }}
                onClick={() => handleOpenModal(idx + 1)}
              >
                <CardMedia
                  component="img"
                  image={img}
                  alt={`Zdjęcie ${idx + 2}`}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Card>
            ))}
          </Box>
        </Grid>

        {/* Szczegóły oferty */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>{offer.title}</Typography>
              <Typography variant="h4" color="primary" gutterBottom>
                {offer.price} zł
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="textSecondary">
                <LocationOnIcon fontSize="small" /> {offer.location}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Dodano: {new Date(offer.created_at).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Kategoria: {offer.category}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1">{offer.description}</Typography>
            </CardContent>
          </Card>

          {/* Dane użytkownika */}
          {/*<Card sx={{ mt: 2 }}>*/}
          {/*  <CardContent>*/}
          {/*    <Typography variant="subtitle1">Ogłoszeniodawca:</Typography>*/}
          {/*    <Typography variant="h6">{offer.user_name}</Typography>*/}
          {/*    <Button*/}
          {/*      variant="contained"*/}
          {/*      fullWidth*/}
          {/*      startIcon={<MessageIcon />}*/}
          {/*      sx={{ mt: 2 }}*/}
          {/*    >*/}
          {/*      Napisz wiadomość*/}
          {/*    </Button>*/}
          {/*  </CardContent>*/}
          {/*</Card>*/}

          <ContactSection offer={offer}/>

        </Grid>
      </Grid>

      {/* MODAL: Galeria zdjęć */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md">
        <Box position="relative" display="flex" alignItems="center">
          <IconButton
            onClick={handlePrevImage}
            sx={{
              position: 'absolute',
              left: 10,
              zIndex: 2,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white'
            }}
          >
            <ArrowBackIosNew />
          </IconButton>
          <img
            src={offer.images[currentImageIndex]}
            alt={`Zdjęcie ${currentImageIndex + 1}`}
            style={{ maxHeight: '80vh', maxWidth: '100%' }}
          />
          <IconButton
            onClick={handleNextImage}
            sx={{
              position: 'absolute',
              right: 10,
              zIndex: 2,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white'
            }}
          >
            <ArrowForwardIos />
          </IconButton>
          <IconButton
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              top: 5,
              right: 5,
              zIndex: 3,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white'
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </Dialog>
    </Box>
  );
};


export default OfferPage;
