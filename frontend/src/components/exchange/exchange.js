import React, { useState, useEffect } from 'react';
import {
  Button, Container, Grid, Card, CardMedia, CardContent, CardActions, Typography, TextField,
  MenuItem, Paper, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Slide,
  Avatar, Box, Fab, Tabs, Tab, Slider, Checkbox, Tooltip, Chip, Divider, useTheme, Badge
} from '@mui/material';
import { AddAPhoto, Close, FilterList, Add as AddIcon, Favorite, FavoriteBorder, SwapHoriz } from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useNavigate } from "react-router-dom";

const categories = ['Elektronika', 'Odzież', 'Meble', 'Książki', 'Sport', 'Inne'];

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  boxShadow: theme.shadows[2],
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
    '& .MuiCardMedia-root': {
      transform: 'scale(1.05)'
    }
  }
}));

const ExchangeTag = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  right: 16,
  backgroundColor: alpha(theme.palette.success.main, 0.9),
  color: theme.palette.success.contrastText,
  fontWeight: 600,
  zIndex: 1
}));

const WantTag = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.warning.light, 0.9),
  color: theme.palette.warning.contrastText,
  marginRight: theme.spacing(1)
}));

const Exchange = () => {
  const theme = useTheme();
  const [offers, setOffers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [tab, setTab] = useState(0);
  const [filters, setFilters] = useState({ search: '', category: '', exchangeFor: '' });
  const [newOffer, setNewOffer] = useState({
    title: '',
    description: '',
    category: '',
    exchangeFor: '',
    images: []
  });
  const [likedOffers, setLikedOffers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const mockOffers = [
      {
        id: 1,
        title: 'Konsola do gier PS5',
        description: 'Nowa konsola PlayStation 5 w idealnym stanie z 2 kontrolerami',
        category: 'Elektronika',
        exchangeFor: 'Smartfon wysokiej klasy lub laptop',
        images: ['https://images.unsplash.com/photo-1607853202273-797f1c22a38e'],
        userOwn: true
      },
      {
        id: 2,
        title: 'Zestaw mebli ogrodowych',
        description: 'Elegancki stolik i 4 krzesła rattanowe w stylu boho',
        category: 'Meble',
        exchangeFor: 'Rowerek treningowy lub sprzęt AGD',
        images: ['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6'],
        userOwn: false
      },
      {
        id: 3,
        title: 'Kurtka zimowa North Face',
        description: 'Nowa kurtka zimowa, rozmiar M, kolor czarny',
        category: 'Odzież',
        exchangeFor: 'Buty zimowe rozmiar 42 lub plecak turystyczny',
        images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea'],
        userOwn: false
      }
    ];
    setOffers(mockOffers);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredOffers = offers.filter(o => (
    o.title.toLowerCase().includes(filters.search.toLowerCase()) &&
    (filters.category === '' || o.category === filters.category) &&
    (filters.exchangeFor === '' || o.exchangeFor.toLowerCase().includes(filters.exchangeFor.toLowerCase()))
  ));

  const myOffers = offers.filter(o => o.userOwn);
  const liked = offers.filter(o => likedOffers.includes(o.id));

  const handleAddOffer = () => {
    const offer = { ...newOffer, id: Date.now(), userOwn: true };
    setOffers(prev => [offer, ...prev]);
    setOpenModal(false);
    setNewOffer({ title: '', description: '', category: '', exchangeFor: '', images: [] });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    const readers = files.map(file => new Promise(res => {
      const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(file);
    }));
    Promise.all(readers).then(imgs => setNewOffer(prev => ({ ...prev, images: [...prev.images, ...imgs] })));
  };

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 4 }}>
          <Tab label="Wszystkie oferty" icon={<SwapHoriz />} />
          <Tab label="Moje oferty" icon={<FavoriteBorder />} />
          <Tab label="Obserwowane" icon={<Favorite />} />
        </Tabs>

        <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Szukaj ofert"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Kategoria"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <MenuItem value="">Wszystkie</MenuItem>
                {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Wymienię na"
                name="exchangeFor"
                value={filters.exchangeFor}
                onChange={handleFilterChange}
                placeholder="Czego szukasz w zamian?"
              />
            </Grid>
          </Grid>
        </Paper>

        {tab === 0 && (
          <Grid container spacing={3}>
            {filteredOffers.map(o => (
              <Grid item xs={12} sm={6} md={4} key={o.id}>
                <ModernCard>
                  <Box sx={{ position: 'relative', height: 200 }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={o.images[0]}
                      alt={o.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <ExchangeTag icon={<SwapHoriz />} label="Wymiana" />
                  </Box>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {o.title}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <WantTag label="Wymienię na:" size="small" />
                      <Typography variant="body2" component="span">
                        {o.exchangeFor}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {o.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between' }}>
                    <Button
                      size="small"
                      onClick={() => navigate(`/offer/${o.id}`)}
                    >
                      Zobacz szczegóły
                    </Button>
                    <Tooltip title={likedOffers.includes(o.id) ? "Usuń z obserwowanych" : "Dodaj do obserwowanych"}>
                      <Checkbox
                        icon={<FavoriteBorder />}
                        checkedIcon={<Favorite color="error" />}
                        checked={likedOffers.includes(o.id)}
                        onChange={() => setLikedOffers(prev =>
                          prev.includes(o.id) ? prev.filter(id => id !== o.id) : [...prev, o.id]
                        )}
                      />
                    </Tooltip>
                  </CardActions>
                </ModernCard>
              </Grid>
            ))}
          </Grid>
        )}

        {/* ... (pozostałe zakładki pozostają bez zmian) ... */}
      </Container>

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
        onClick={() => setOpenModal(true)}
      >
        <AddIcon />
      </Fab>

      <Dialog fullWidth maxWidth="sm" open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>
          <Typography variant="h5">Dodaj nową ofertę wymiany</Typography>
          <IconButton sx={{ position: 'absolute', top: 8, right: 8 }} onClick={() => setOpenModal(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <input accept="image/*" id="offer-images" type="file" hidden multiple onChange={handleImageUpload} />
              <label htmlFor="offer-images">
                <Button fullWidth variant="outlined" component="span" startIcon={<AddAPhoto />}>
                  Dodaj zdjęcia przedmiotu
                </Button>
              </label>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tytuł oferty"
                value={newOffer.title}
                onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Opis przedmiotu"
                multiline
                rows={3}
                value={newOffer.description}
                onChange={(e) => setNewOffer({...newOffer, description: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Kategoria"
                value={newOffer.category}
                onChange={(e) => setNewOffer({...newOffer, category: e.target.value})}
                required
              >
                {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Wymienię na"
                value={newOffer.exchangeFor}
                onChange={(e) => setNewOffer({...newOffer, exchangeFor: e.target.value})}
                placeholder="Opisz czego szukasz w zamian"
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
            disabled={!newOffer.title || !newOffer.description || !newOffer.category || !newOffer.exchangeFor}
          >
            Opublikuj ofertę
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Exchange;