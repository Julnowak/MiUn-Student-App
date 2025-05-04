import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  TextField,
  MenuItem,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Slide, Avatar, Box
} from '@mui/material';
import { AddAPhoto, AddCircle, Close, FilterList } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const categories = [
  'Elektronika',
  'Odzież',
  'Meble',
  'Książki',
  'Sport',
  'Inne'
];

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ItemCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6]
  }
}));

const PriceChip = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.success.light,
  color: theme.palette.success.contrastText,
  borderRadius: '12px',
  padding: '4px 12px',
  fontWeight: 600,
  fontSize: '0.9rem'
}));

const ImageCarousel = ({ images = [] }) => { // Domyślna wartość dla images
  return (
    <Swiper
      modules={[Navigation, Pagination]}
      navigation
      pagination={{ clickable: true }}
      style={{ height: 200 }}
    >
      {images.map((img, index) => (
        <SwiperSlide key={index}>
          <img
            src={img}
            alt={`Oferta ${index + 1}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};


const Exchange = () => {
  const [offers, setOffers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: ''
  });
  const [newOffer, setNewOffer] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    image: null
  });

  useEffect(() => {
    // Tutaj można dodać pobieranie ofert z API
    const mockOffers = [
      {
        id: 1,
        title: 'Konsola do gier',
        description: 'Używana konsola w idealnym stanie',
        category: 'Elektronika',
        price: 450,
        image: '/images/gaming-console.jpg'
      },

    ];
    setOffers(mockOffers);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredOffers = offers.filter(offer => {
    return (
      offer.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      (filters.category === '' || offer.category === filters.category) &&
      (filters.minPrice === '' || offer.price >= Number(filters.minPrice)) &&
      (filters.maxPrice === '' || offer.price <= Number(filters.maxPrice))
    );
  });

  const handleAddOffer = () => {
    const offer = {
      ...newOffer,
      id: Date.now(),
      image: newOffer.image || '/images/default-item.jpg'
    };
    setOffers(prev => [offer, ...prev]);
    setOpenModal(false);
    setNewOffer({
      title: '',
      description: '',
      category: '',
      price: '',
      image: null
    });
  };


  // Obsługa wielu zdjęć
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert('Maksymalnie można dodać 5 zdjęć');
      return;
    }

    const readers = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(results => {
      setNewOffer(prev => ({ ...prev, images: [...prev.images, ...results] }));
    });
  };

  // Usuwanie zdjęcia
  const handleRemoveImage = (index) => {
    setNewOffer(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <div>
      <AppBar position="static" color="inherit">
        <Toolbar>
          <Typography variant="h4" sx={{ flexGrow: 1, fontWeight: 700 }}>
            BarterHub
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddCircle />}
            onClick={() => setOpenModal(true)}
          >
            Dodaj ofertę
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }} elevation={2}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Szukaj"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                label="Kategoria"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                variant="outlined"
              >
                <MenuItem value="">Wszystkie</MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                type="number"
                fullWidth
                label="Cena min"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                type="number"
                fullWidth
                label="Cena max"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={3} sx={{ textAlign: 'right' }}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setFilters({
                  search: '',
                  category: '',
                  minPrice: '',
                  maxPrice: ''
                })}
              >
                Wyczyść filtry
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={4}>
          {filteredOffers.map(offer => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={offer.id}>
              <ItemCard>
                <CardMedia
                  component="img"
                  height="200"
                  image={offer.image}
                  alt={offer.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {offer.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {offer.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Kategoria: {offer.category}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <PriceChip>
                    {offer.price.toFixed(2)} zł
                  </PriceChip>
                  <Button size="small" variant="outlined">Zaproponuj wymianę</Button>
                </CardActions>
              </ItemCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Dialog
        fullWidth
        maxWidth="sm"
        open={openModal}
        onClose={() => setOpenModal(false)}
        TransitionComponent={Transition}
      >
        <DialogTitle>
          <Typography variant="h5">Dodaj nową ofertę</Typography>
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={() => setOpenModal(false)}
          >
            <Close />
          </IconButton>
        </DialogTitle>
         <DialogContent dividers>
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <input
          accept="image/*"
          id="offer-image-upload"
          type="file"
          hidden
          multiple
          onChange={handleImageUpload}
        />
        <label htmlFor="offer-image-upload">
          <Button
            fullWidth
            variant="outlined"
            component="span"
            startIcon={<AddAPhoto />}
            sx={{ height: 100, mb: 2 }}
          >
            Dodaj zdjęcia (max 5)
          </Button>
        </label>

        <Grid container spacing={1}>
          {newOffer.images?.map((img, index) => (
            <Grid item key={index}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={img}
                  variant="rounded"
                  sx={{ width: 80, height: 80 }}
                />
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bgcolor: 'error.main',
                    '&:hover': { bgcolor: 'error.dark' }
                  }}
                  onClick={() => handleRemoveImage(index)}
                >
                  <Close fontSize="small" sx={{ color: 'white' }} />
                </IconButton>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tytuł oferty"
                value={newOffer.title}
                onChange={(e) => setNewOffer(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Opis"
                multiline
                rows={4}
                value={newOffer.description}
                onChange={(e) => setNewOffer(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Kategoria"
                value={newOffer.category}
                onChange={(e) => setNewOffer(prev => ({ ...prev, category: e.target.value }))}
                required
              >
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Oczekiwana cena"
                value={newOffer.price}
                onChange={(e) => setNewOffer(prev => ({ ...prev, price: e.target.value }))}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Anuluj</Button>
          <Button
            variant="contained"
            onClick={handleAddOffer}
            disabled={!newOffer.title || !newOffer.description || !newOffer.category || !newOffer.price}
          >
            Opublikuj ofertę
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Exchange;