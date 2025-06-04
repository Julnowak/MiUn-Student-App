import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Divider,
  IconButton,
  Dialog,
  Chip,
  Avatar,
  Paper,
  useTheme,
  Tabs,
  Tab,
  Badge, CircularProgress
} from '@mui/material';
import {
  LocationOn,
  CalendarToday,
  SwapHoriz,
  Favorite,
  FavoriteBorder,
  ArrowBack,
  ArrowForward,
  Close,
  Message,
  Share
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const OfferPage = () => {
  const { id } = useParams();
  const theme = useTheme();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [liked, setLiked] = useState(false);

  // Mock data for barter exchange
  const mockOffer = {
    id: 1,
    title: "Rower górski Trek Marlin 5",
    description: "Nowoczesny rower górski w idealnym stanie, przejechany zaledwie 200 km. Idealny na wycieczki terenowe i leśne ścieżki. Kompletnie serwisowany, gotowy do użytku.",
    exchangeFor: "Poszukuję konsoli do gier (PS5/Xbox Series X) lub wysokiej klasy słuchawek bezprzewodowych",
    location: "Warszawa, Mokotów",
    created_at: "2023-05-15T10:30:00Z",
    category: "Sport i rekreacja",
    condition: "Jak nowy",
    user: {
      name: "Marek Nowak",
      rating: 4.8,
      joinDate: "2021-03-10",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    images: [
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
      "https://images.unsplash.com/photo-1511994298241-608e28f14fde",
      "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8"
    ],
    similarOffers: [
      {
        id: 101,
        title: "Konsola PS5",
        image: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e",
        exchangeFor: "Rower górski lub laptop gamingowy"
      },
      {
        id: 102,
        title: "Słuchawki Sony WH-1000XM4",
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df",
        exchangeFor: "Sprzęt sportowy lub elektronika"
      }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setOffer(mockOffer);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleOpenModal = (index) => {
    setCurrentImageIndex(index);
    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev === 0 ? offer.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev === offer.images.length - 1 ? 0 : prev + 1));
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleLike = () => setLiked(!liked);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  // Styled components
  const ExchangeChip = styled(Chip)(({ theme }) => ({
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
    fontWeight: 600,
    margin: theme.spacing(0.5)
  }));

  const ConditionChip = styled(Chip)(({ theme }) => ({
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.contrastText
  }));

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 2, md: 4 }, bgcolor: 'background.default' }}>
      {/* Main content */}
      <Grid container spacing={4}>
        {/* Gallery section */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                position: 'relative',
                height: { xs: 300, md: 450 },
                cursor: 'pointer'
              }}
              onClick={() => handleOpenModal(0)}
            >
              <CardMedia
                component="img"
                image={offer.images[0]}
                alt={offer.title}
                sx={{ height: '100%', width: '100%', objectFit: 'cover' }}
              />
              <ExchangeChip
                label="WYMIANA BARTEROWA"
                icon={<SwapHoriz />}
                sx={{ position: 'absolute', top: 16, left: 16 }}
              />
              <ConditionChip
                label={offer.condition}
                sx={{ position: 'absolute', top: 16, right: 16 }}
              />
            </Box>

            {/* Thumbnails */}
            <Box display="flex" p={1} sx={{ overflowX: 'auto' }}>
              {offer.images.map((img, idx) => (
                <Box
                  key={idx}
                  sx={{
                    width: 80,
                    height: 80,
                    m: 0.5,
                    borderRadius: 1,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: currentImageIndex === idx ? `2px solid ${theme.palette.primary.main}` : 'none'
                  }}
                  onClick={() => handleOpenModal(idx)}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Similar offers */}
          <Box mt={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Podobne oferty wymiany
            </Typography>
            <Grid container spacing={2}>
              {offer.similarOffers.map(item => (
                <Grid item xs={6} sm={4} key={item.id}>
                  <Card sx={{ borderRadius: 2, cursor: 'pointer' }}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={item.image}
                      alt={item.title}
                    />
                    <CardContent>
                      <Typography variant="subtitle2">{item.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Wymienię na: {item.exchangeFor}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>

        {/* Details section */}
        <Grid item xs={12} md={5}>
          <Box sx={{ position: 'sticky', top: 20 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                {offer.title}
              </Typography>
              <IconButton onClick={handleLike} color={liked ? 'error' : 'default'}>
                {liked ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
            </Box>

            <Box display="flex" alignItems="center" mt={1} mb={3}>
              <LocationOn color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                {offer.location}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }}>•</Typography>
              <CalendarToday color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                {new Date(offer.created_at).toLocaleDateString()}
              </Typography>
            </Box>

            {/* Exchange section */}
            <Paper elevation={0} sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              backgroundColor: theme.palette.success.light,
              color: theme.palette.success.contrastText
            }}>
              <Box display="flex" alignItems="center" mb={1}>
                <SwapHoriz sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Wymienię na:
                </Typography>
              </Box>
              <Typography>{offer.exchangeFor}</Typography>
            </Paper>

            {/* Tabs */}
            <Paper sx={{ mb: 3, borderRadius: 2 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  '& .MuiTabs-indicator': {
                    backgroundColor: theme.palette.primary.main,
                    height: 3
                  }
                }}
              >
                <Tab label="Opis" />
                <Tab label="Stan" />
                <Tab label="Dostawa" />
              </Tabs>
              <Box p={3}>
                {tabValue === 0 && (
                  <Typography>{offer.description}</Typography>
                )}
                {tabValue === 1 && (
                  <Typography>Przedmiot w idealnym stanie, praktycznie nieużywany. Kompletny z wszystkimi oryginalnymi akcesoriami.</Typography>
                )}
                {tabValue === 2 && (
                  <Typography>Możliwość odbioru osobistego w Warszawie lub wysyłka na koszt odbiorcy.</Typography>
                )}
              </Box>
            </Paper>

            {/* User info */}
            <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar src={offer.user.avatar} sx={{ width: 56, height: 56, mr: 2 }} />
                <Box>
                  <Typography variant="h6">{offer.user.name}</Typography>
                  <Box display="flex" alignItems="center">
                    <Badge badgeContent={offer.user.rating} color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Użytkownik od {new Date(offer.user.joinDate).getFullYear()}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Message />}
                    sx={{ borderRadius: 2 }}
                  >
                    Wyślij wiadomość
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Share />}
                    sx={{ borderRadius: 2 }}
                  >
                    Udostępnij
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Exchange proposal */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<SwapHoriz />}
              sx={{
                borderRadius: 2,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600
              }}
            >
              ZAPROPONUJ WYMIANĘ
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Image modal */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="lg"
        PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none' } }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={handlePrevImage}
            sx={{
              position: 'absolute',
              left: 10,
              top: '50%',
              zIndex: 2,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              transform: 'translateY(-50%)'
            }}
          >
            <ArrowBack />
          </IconButton>
          <img
            src={offer.images[currentImageIndex]}
            alt={`Zdjęcie ${currentImageIndex + 1}`}
            style={{
              maxHeight: '90vh',
              maxWidth: '90vw',
              borderRadius: 8,
              display: 'block'
            }}
          />
          <IconButton
            onClick={handleNextImage}
            sx={{
              position: 'absolute',
              right: 10,
              top: '50%',
              zIndex: 2,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              transform: 'translateY(-50%)'
            }}
          >
            <ArrowForward />
          </IconButton>
          <IconButton
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 2,
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