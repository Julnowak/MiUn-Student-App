import React, { useState } from "react";
import { Box, Button, TextField, MenuItem, Select, InputLabel, FormControl, List, ListItem, ListItemText, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Alert } from "@mui/material";

const Groups = () => {
  const [groups, setGroups] = useState([
    { name: "Grupa Robotyka 2025", direction: "Robotyka", year: 2025, accessCode: "12345" },
    { name: "Grupa Automatyka 2024", direction: "Automatyka", year: 2024, accessCode: "67890" },
    { name: "Grupa Mechatronika 2023", direction: "Mechatronika", year: 2023, accessCode: "112233" },
  ]);
  const [filteredGroups, setFilteredGroups] = useState(groups);
  const [selectedDirection, setSelectedDirection] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [joinedGroup, setJoinedGroup] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleSearch = () => {
    const filtered = groups.filter(
      (group) =>
        (selectedDirection ? group.direction === selectedDirection : true) &&
        (selectedYear ? group.year === parseInt(selectedYear) : true)
    );
    setFilteredGroups(filtered);
  };

  const handleJoinGroup = (group) => {
    if (accessCode === group.accessCode) {
      setJoinedGroup(group);
      setOpenSnackbar(true);
    } else {
      alert("Błędny kod dostępu!");
    }
    setAccessCode(""); // Reset the access code input
  };

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  return (
    <Box sx={{ p: 3 }}>
      <h2>Wyszukaj Grupy</h2>

      {/* Search Form */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Kierunek</InputLabel>
          <Select
            value={selectedDirection}
            label="Kierunek"
            onChange={(e) => setSelectedDirection(e.target.value)}
          >
            <MenuItem value="Robotyka">Robotyka</MenuItem>
            <MenuItem value="Automatyka">Automatyka</MenuItem>
            <MenuItem value="Mechatronika">Mechatronika</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Rok</InputLabel>
          <Select
            value={selectedYear}
            label="Rok"
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <MenuItem value={2025}>2025</MenuItem>
            <MenuItem value={2024}>2024</MenuItem>
            <MenuItem value={2023}>2023</MenuItem>
          </Select>
        </FormControl>

        <Button variant="contained" color="primary" onClick={handleSearch}>
          Szukaj
        </Button>
      </Box>

      {/* Display Groups */}
      <List>
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group, idx) => (
            <ListItem key={idx} button onClick={() => setSearchOpen(true)}>
              <ListItemText primary={group.name} secondary={`${group.direction} - ${group.year}`} />
              <Button variant="outlined" onClick={() => handleJoinGroup(group)}>Dołącz</Button>
            </ListItem>
          ))
        ) : (
          <ListItem>Brak grup do wyświetlenia</ListItem>
        )}
      </List>

      {/* Dialog for Entering Access Code */}
      <Dialog open={searchOpen} onClose={() => setSearchOpen(false)}>
        <DialogTitle>Wpisz Kod Dostępu</DialogTitle>
        <DialogContent>
          <TextField
            label="Kod dostępu"
            variant="outlined"
            fullWidth
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSearchOpen(false)} color="secondary">
            Anuluj
          </Button>
          <Button
            onClick={() => {
              setSearchOpen(false);
              handleJoinGroup(joinedGroup);
            }}
            color="primary"
          >
            Dołącz
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Successful Join */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          Dołączono do grupy {joinedGroup?.name}!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Groups;
