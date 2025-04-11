import React, { useState, useEffect } from 'react';
import {
  Autocomplete, Box, Button, Checkbox, Chip,
  Fab, FormControl, FormControlLabel, Grid, IconButton, InputLabel,
  List, ListItem, ListItemIcon, ListItemText, MenuItem, Pagination, Select,
  TextField, Typography, Badge, DialogTitle, Dialog, DialogContentText, DialogContent, DialogActions
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import LinkIcon from '@mui/icons-material/Link';
import client from "../../client";
import { API_BASE_URL } from "../../config";

const Learning = () => {
const [allResources, setAllResources] = useState([]);
const [page, setPage] = useState(1);
const [filters, setFilters] = useState({
  name: '',
  kierunek: '',
  przedmiot: '',
  tylkoMoje: false,
  zweryfikowane: true,
  sort: 'desc',
});
  const token = localStorage.getItem("access");

  const fetchData = async () => {
    try {
      const response = await client.get(API_BASE_URL + "sources/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          name: filters.name,
          kierunek: filters.kierunek,
          przedmiot: filters.przedmiot,
          tylko_moje: filters.tylkoMoje,
          zweryfikowane: filters.zweryfikowane,
          ordering: filters.sort === 'desc' ? '-created_at' : 'created_at',
        }
      });

      setAllResources(response.data);
      setPage(1); // reset strony
    } catch (error) {
      console.error("Błąd pobierania danych:", error);
    }
  };


  useEffect(() => {
    if (allResources.length < 1){
      fetchData();
    }
  }, []);

  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(allResources.length / ITEMS_PER_PAGE);
  const paginatedData = allResources.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mt-4 p-4 rounded">
      <Typography sx={{ mt: 4, mb: 2 }} variant="h6">Dostępne zasoby</Typography>

      {/* Filters */}
      <Box sx={{ flexGrow: 1, p: 2 }}>
        <Grid container spacing={2} alignItems="center" mb={2}>
          <Grid item xs={10}>
            <TextField
              fullWidth
              label="Nazwa"
              variant="standard"
              value={filters.name}
              onChange={(e) => handleFilterChange('name', e.target.value)}
            />
          </Grid>
          <Grid item xs={2}>
            <Button variant="contained" onClick={fetchData}>Wyszukaj</Button>
          </Grid>
        </Grid>

        <Grid container spacing={2} alignItems="center" mb={2}>
          <Grid item xs={3}>
            <Autocomplete
              disablePortal
              options={["Informatyka", "Automatyka"]}
              value={filters.kierunek}
              onChange={(e, val) => handleFilterChange('kierunek', val || '')}
              renderInput={(params) => <TextField {...params} label="Kierunek" variant="standard" />}
            />
          </Grid>

          <Grid item xs={3}>
            <Autocomplete
              disablePortal
              options={["Matematyka", "Programowanie"]}
              value={filters.przedmiot}
              onChange={(e, val) => handleFilterChange('przedmiot', val || '')}
              renderInput={(params) => <TextField {...params} label="Przedmiot" variant="standard" />}
            />
          </Grid>

          <Grid item xs={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.tylkoMoje}
                  onChange={(e) => handleFilterChange('tylkoMoje', e.target.checked)}
                />
              }
              label="Tylko moje"
            />
          </Grid>

          <Grid item xs={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.zweryfikowane}
                  onChange={(e) => handleFilterChange('zweryfikowane', e.target.checked)}
                />
              }
              label="Zweryfikowane"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Sort */}
      <Grid container spacing={2}>
        <Grid item xs={9}></Grid>
        <Grid item xs={3}>
          <FormControl fullWidth variant="standard">
            <InputLabel id="sort-label">Data dodania</InputLabel>
            <Select
              labelId="sort-label"
              id="sort-select"
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <MenuItem value="desc">Od najnowszych</MenuItem>
              <MenuItem value="asc">Od najstarszych</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Resource list */}
      <List>
        {paginatedData.map((resource, idx) => (
          <ListItem key={idx} secondaryAction={
            <IconButton onClick={resource.verified ? () => {
              window.open(resource.link)
            } : handleClickOpen} edge="end"><LinkIcon /></IconButton>
          }>
            <ListItemIcon>
              <Badge color={resource.verified ? "success" : "error"} badgeContent={resource.verified ? "✓" : "!"}>
                <InsertDriveFileIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText
              primary={resource.title}
              secondary={resource.description || "Brak opisu"}
            />
            <Chip label={resource.field} />
            <Dialog
              open={open}
              onClose={handleClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">
                {"Niezweryfikowany link"}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  Link do tego źródła nie został przez nas jeszcze zweryfikowany, co oznacza, że może być niebezpieczny!
                  Przy przechodzeniu na stronę zachowaj ostrożność.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} variant={"contained"}>Anuluj</Button>
                <Button onClick={() => {
                  window.open(resource.link)
                  handleClose()
                }} autoFocus>
                  Przechodzę
                </Button>
              </DialogActions>
            </Dialog>
          </ListItem>

        ))}
      </List>



      {/* Paginator */}
      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
        />
      </Box>

      <Fab color="secondary" aria-label="add" sx={{ position: 'fixed', bottom: 20, right: 20 }}>
        <AddIcon />
      </Fab>
    </div>
  );
};

export default Learning;
