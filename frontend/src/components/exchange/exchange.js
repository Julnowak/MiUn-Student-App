import React, { useState, useEffect } from 'react';
import {
  Button, Container, Grid, Card, CardMedia, CardContent, CardActions, Typography, TextField,
  MenuItem, Paper, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Slide,
  Avatar, Box, Fab, Tabs, Tab, Slider, Checkbox, Tooltip
} from '@mui/material';
import { AddAPhoto, Close, FilterList, Add as AddIcon, Favorite, FavoriteBorder } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
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

const ImageCarousel = ({ images = [] }) => (
  <Swiper modules={[Navigation, Pagination]} navigation pagination={{ clickable: true }} style={{ height: 200 }}>
    {images.map((img, index) => (
      <SwiperSlide key={index}>
        <img src={img} alt={`Oferta ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </SwiperSlide>
    ))}
  </Swiper>
);

const Exchange = () => {
  const [offers, setOffers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [tab, setTab] = useState(0);
  const [filters, setFilters] = useState({ search: '', category: '', priceRange: [0, 1000] });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [newOffer, setNewOffer] = useState({ title: '', description: '', category: '', price: '', images: [] });
  const [likedOffers, setLikedOffers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const mockOffers = [
      { id: 1, title: 'Konsola do gier', description: 'Używana konsola w idealnym stanie', category: 'Elektronika', price: 450, images: ['/images/trading/k.jpg'], userOwn: true },
      { id: 2, title: 'Zestaw mebli ogrodowych', description: 'Stolik i 4 krzesła', category: 'Meble', price: 800, images: ['/images/trading/k.jpg', '/images/trading/images.jpg'], userOwn: false },
      { id: 3, title: 'Kurtka zimowa', description: 'Nowa kurtka, rozmiar M', category: 'Odzież', price: 150, images: ['/images/trading/k.jpg'], userOwn: false }
    ];
    setOffers(mockOffers);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e, newRange) => {
    setFilters(prev => ({ ...prev, priceRange: newRange }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
  };

  const handleLikeToggle = (id) => {
    setLikedOffers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredOffers = offers.filter(o => (
    o.title.toLowerCase().includes(appliedFilters.search.toLowerCase()) &&
    (appliedFilters.category === '' || o.category === appliedFilters.category) &&
    o.price >= appliedFilters.priceRange[0] &&
    o.price <= appliedFilters.priceRange[1]
  ));

  const myOffers = offers.filter(o => o.userOwn);
  const liked = offers.filter(o => likedOffers.includes(o.id));

  const handleAddOffer = () => {
    const offer = { ...newOffer, id: Date.now(), userOwn: true };
    setOffers(prev => [offer, ...prev]);
    setOpenModal(false);
    setNewOffer({ title: '', description: '', category: '', price: '', images: [] });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    const readers = files.map(file => new Promise(res => {
      const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(file);
    }));
    Promise.all(readers).then(imgs => setNewOffer(prev => ({ ...prev, images: [...prev.images, ...imgs] })));
  };

  const handleRemoveImage = idx => setNewOffer(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));

  return (
    <div>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label="Wszystkie oferty" />
          <Tab label="Moje oferty" />
          <Tab label="Obserwowane" />
        </Tabs>

        <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }} elevation={2}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={6} md={2}>
              <TextField fullWidth label="Nazwa" name="search" value={filters.search} onChange={handleFilterChange} />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField select fullWidth label="Kategoria" name="category" value={filters.category} onChange={handleFilterChange}>
                <MenuItem value="">Wszystkie</MenuItem>
                {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography gutterBottom>Cena: {filters.priceRange[0]} zł - {filters.priceRange[1]} zł</Typography>
              <Slider value={filters.priceRange} onChange={handlePriceChange} valueLabelDisplay="auto" min={0} max={2000} />
            </Grid>
            <Grid item xs={12} md={3} container spacing={1} justifyContent="flex-end">
              <Grid item>
                <Button variant="contained" onClick={handleApplyFilters}>Szukaj</Button>
              </Grid>
              <Grid item>
                <Button variant="outlined" startIcon={<FilterList />} onClick={() => { setFilters({ search: '', category: '', priceRange: [0, 1000] }); setAppliedFilters({ search: '', category: '', priceRange: [0, 1000] }); }}>Wyczyść filtry</Button>
              </Grid>
            </Grid>
          </Grid>
        </Paper>

        {tab === 0 && (
          <Grid container spacing={4}>
            {filteredOffers.map(o => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={o.id}>
                 <ItemCard>
                  <ImageCarousel images={o.images} />
                  <CardContent  onClick={() => {navigate(`/offer-page/${o.id}`)}}>
                    <Typography variant="h6">{o.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{o.description}</Typography>
                    <Typography variant="caption">Kategoria: {o.category}</Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                    <PriceChip>{o.price} zł</PriceChip>
                    <Tooltip title="Polub ofertę">
                      <Checkbox icon={<FavoriteBorder />} checkedIcon={<Favorite />} checked={likedOffers.includes(o.id)} onChange={() => handleLikeToggle(o.id)} />
                    </Tooltip>
                  </CardActions>
                </ItemCard>
              </Grid>
            ))}
          </Grid>
        )}

        {tab === 1 && (
          myOffers.length ? (
            <Grid container spacing={4}>
              {myOffers.map(o => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={o.id}>
                  <ItemCard>
                    <ImageCarousel images={o.images} />
                    <CardContent>
                      <Typography variant="h6">{o.title}</Typography>
                    </CardContent>
                  </ItemCard>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px">
              <Typography variant="h6">Brak Twoich ofert</Typography>
            </Box>
          )
        )}

        {tab === 2 && (
          liked.length ? (
            <Grid container spacing={4}>
              {liked.map(o => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={o.id}>
                  <ItemCard>
                    <ImageCarousel images={o.images} />
                    <CardContent>
                      <Typography variant="h6">{o.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{o.description}</Typography>
                    </CardContent>
                  </ItemCard>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px">
              <Typography variant="h6">Brak obserwowanych ofert</Typography>
            </Box>
          )
        )}
      </Container>

      <Fab color="primary" sx={{ position: 'fixed', bottom: 20, right: 20 }} onClick={() => setOpenModal(true)}>
        <AddIcon />
      </Fab>


      <Dialog fullWidth maxWidth="sm" open={openModal} onClose={() => setOpenModal(false)} TransitionComponent={Transition}>
        <DialogTitle>
          <Typography variant="h5">Dodaj nową ofertę</Typography>
          <IconButton sx={{ position: 'absolute', top: 8, right: 8 }} onClick={() => setOpenModal(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <input accept="image/*" id="upload-images" type="file" hidden multiple onChange={handleImageUpload} />
              <label htmlFor="upload-images">
                <Button fullWidth variant="outlined" component="span" startIcon={<AddAPhoto />} sx={{ height: 100, mb: 2 }}>
                  Dodaj zdjęcia (max 5)
                </Button>
              </label>
              <Grid container spacing={1}>
                {newOffer.images.map((img, i) => (
                  <Grid item key={i}>
                    <Box sx={{ position: 'relative' }}>
                      <Avatar src={img} variant="rounded" sx={{ width: 80, height: 80 }} />
                      <IconButton size="small" sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'error.main' }} onClick={() => handleRemoveImage(i)}>
                        <Close fontSize="small" sx={{ color: 'white' }} />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid item xs={12}><TextField fullWidth label="Tytuł" value={newOffer.title} onChange={e => setNewOffer(prev => ({ ...prev, title: e.target.value }))} required /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Opis" multiline rows={4} value={newOffer.description} onChange={e => setNewOffer(prev => ({ ...prev, description: e.target.value }))} required /></Grid>
            <Grid item xs={12} md={6}><TextField select fullWidth label="Kategoria" value={newOffer.category} onChange={e => setNewOffer(prev => ({ ...prev, category: e.target.value }))} required>{categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth type="number" label="Oczekiwana cena" value={newOffer.price} onChange={e => setNewOffer(prev => ({ ...prev, price: e.target.value }))} required /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Anuluj</Button>
          <Button variant="contained" onClick={handleAddOffer} disabled={!newOffer.title || !newOffer.description || !newOffer.category || !newOffer.price}>Opublikuj ofertę</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Exchange;