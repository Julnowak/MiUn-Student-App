import React, { useState, useEffect } from 'react';
import {
  Tabs,
  Tab,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Divider,
  Box, Typography, FormControl, InputLabel, Select, MenuItem, Avatar, Grid, FormControlLabel, Switch, Snackbar
} from '@mui/material';
import {Search, FilterList, Lock, LockOpen, Description, GroupAdd, Public} from '@mui/icons-material';
import {People} from "react-bootstrap-icons";
import {Alert} from "react-bootstrap";

// Mock danych
const mockGroups = [
  { id: 1, name: 'Grupa React', year: 2023, isPublic: true, members: [], password: '' },
  { id: 2, name: 'Advanced JS', year: 2023, isPublic: false, members: [], password: 'secret' },
  { id: 3, name: 'MUI Masters', year: 2022, isPublic: true, members: [], password: '' },
];

const mockFieldByYears = [
  { id: 1, year: 2023, fieldName: 'Informatyka' },
  { id: 2, year: 2023, fieldName: 'Matematyka' },
  { id: 3, year: 2022, fieldName: 'Fizyka' },
];

const Groups = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState({ name: '', year: '' });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [password, setPassword] = useState('');
  const [groups, setGroups] = useState(mockGroups);
  const [userGroups, setUserGroups] = useState([]);
  const userId = 1;

  const [newGroup, setNewGroup] = useState({
    name: '',
    fieldByYear: '',
    description: '',
    isPublic: true,
    password: '',
    capacity: 30
  });
  const [createdGroupCode, setCreatedGroupCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCreateGroup = () => {
    const selectedField = mockFieldByYears.find(f => f.id === newGroup.fieldByYear);
    const generatedCode = Math.random().toString(36).substr(2, 8).toUpperCase();

    const newGroupObject = {
      id: groups.length + 1,
      ...newGroup,
      year: selectedField.year,
      fieldByYear: selectedField,
      admin: userId,
      code: generatedCode,
      members: [userId],
      capacity: Number(newGroup.capacity)
    };

    setGroups([...groups, newGroupObject]);
    setCreatedGroupCode(generatedCode);
    setShowSuccess(true);
    setNewGroup({
      name: '',
      fieldByYear: '',
      description: '',
      isPublic: true,
      password: '',
      capacity: 30
    });
  };

  useEffect(() => {
    const userGroups = groups.filter(g => g.members.includes(userId));
    setUserGroups(userGroups);
  }, [groups, userId]);

  const handleJoinGroup = () => {
    if (!selectedGroup) return;

    const requiresPassword = !selectedGroup.isPublic && password !== selectedGroup.password;
    if (requiresPassword) {
      alert('Nieprawidłowe hasło!');
      return;
    }

    setGroups(groups.map(g =>
      g.id === selectedGroup.id ? { ...g, members: [...g.members, userId] } : g
    ));
    setSelectedGroup(null);
    setPassword('');
  };

  const filteredGroups = groups.filter(g => {
    const matchesName = g.name.toLowerCase().includes(search.name.toLowerCase());
    const matchesYear = search.year ? g.year.toString() === search.year : true;
    return matchesName && matchesYear;
  });

  return (
    <Box sx={{ p: 2, maxWidth: 1000, margin: "auto" }}>
      <Tabs value={activeTab} onChange={(e, newVal) => setActiveTab(newVal)}>
        <Tab label="Moje grupy" />
        <Tab label="Odkrywaj grupy" />
        <Tab label="Nowa grupa" />
      </Tabs>

      {activeTab === 0 ? (
        <Box sx={{ mt: 2 }}>
          <List sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {userGroups.length > 0 ? (
              userGroups.map(g => (
                <ListItem key={g.id} sx={{ width: '100%', maxWidth: 600 }}>
                  <ListItemText
                    primary={g.name}
                    secondary={`Rok: ${g.year} • ${g.members.length} członków`}
                  />
                  <IconButton edge="end" aria-label="manage">
                    <FilterList />
                  </IconButton>
                </ListItem>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', mt: 6 }}>
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png"
                  alt="Brak grup"
                  style={{ width: 100, height: 100, opacity: 0.6 }}
                />
                <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 2 }}>
                  Nie dołączono jeszcze do żadnej grupy.
                </Typography>
              </Box>
            )}
          </List>
        </Box>
      ) : activeTab === 1 ? (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              label="Szukaj po nazwie"
              value={search.name}
              onChange={e => setSearch({ ...search, name: e.target.value })}
              InputProps={{ startAdornment: <Search /> }}
            />
            <TextField
              label="Rok"
              type="number"
              value={search.year}
              onChange={e => setSearch({ ...search, year: e.target.value })}
            />
            <Button
              variant="contained"
              onClick={() => setSearch({ ...search, year: new Date().getFullYear() })}
            >
              Pokaż tegoroczne
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <List>
            {filteredGroups.map(g => (
              <ListItem
                key={g.id}
                button
                onClick={() => !g.members.includes(userId) && setSelectedGroup(g)}
                disabled={g.members.includes(userId)}
              >
                <ListItemText
                  primary={g.name}
                  secondary={`Rok: ${g.year} • ${g.isPublic ? 'Publiczna' : 'Prywatna'}`}
                />
                {g.isPublic ? <LockOpen color="success" /> : <Lock color="error" />}
                {g.members.includes(userId) && <Chip label="Należysz" sx={{ ml: 2 }} />}
              </ListItem>
            ))}
          </List>
        </Box>
      ) : activeTab === 2 ? (
        <Box sx={{ mt: 4, maxWidth: 800, mx: 'auto' }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar sx={{
              bgcolor: 'primary.main',
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 2
            }}>
              <GroupAdd fontSize="large" />
            </Avatar>
            <Typography variant="h4" gutterBottom>
              Nowa Grupa
            </Typography>
            <Typography color="textSecondary">
              Stwórz przestrzeń do współpracy i wymiany wiedzy
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Podstawowe informacje
                </Typography>

                <TextField
                  label="Nazwa grupy"
                  fullWidth
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                  required
                  sx={{ mb: 3 }}
                />

                <TextField
                  label="Opis grupy"
                  multiline
                  rows={4}
                  fullWidth
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                  helperText="Opisz cel i charakter grupy (max 600 znaków)"
                  sx={{ mb: 3 }}
                />

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Kierunek i rok</InputLabel>
                  <Select
                    value={newGroup.fieldByYear}
                    label="Kierunek i rok"
                    onChange={(e) => setNewGroup({...newGroup, fieldByYear: e.target.value})}
                    required
                  >
                    {mockFieldByYears.map((field) => (
                      <MenuItem key={field.id} value={field.id}>
                        {field.fieldName} ({field.year})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  <People sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Ustawienia dostępu
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={newGroup.isPublic}
                      onChange={(e) => setNewGroup({...newGroup, isPublic: e.target.checked})}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {newGroup.isPublic ? <Public /> : <Lock />}
                      <Box sx={{ ml: 1 }}>
                        {newGroup.isPublic ? 'Grupa publiczna' : 'Grupa prywatna'}
                        <Typography variant="body2" color="textSecondary">
                          {newGroup.isPublic
                            ? 'Każdy może dołączyć'
                            : 'Wymagane hasło do dołączenia'}
                        </Typography>
                      </Box>
                    </Box>
                  }
                  sx={{ mb: 3 }}
                />

                {!newGroup.isPublic && (
                  <TextField
                    label="Hasło dostępu"
                    type="password"
                    fullWidth
                    value={newGroup.password}
                    onChange={(e) => setNewGroup({...newGroup, password: e.target.value})}
                    required
                    sx={{ mb: 3 }}
                  />
                )}

                <TextField
                  label="Maksymalna liczba członków"
                  type="number"
                  fullWidth
                  value={newGroup.capacity}
                  onChange={(e) => setNewGroup({...newGroup, capacity: e.target.value})}
                  inputProps={{ min: 2, max: 100 }}
                  helperText="0 oznacza brak limitu"
                  sx={{ mb: 3 }}
                />

                <Divider sx={{ my: 3 }} />

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleCreateGroup}
                  disabled={!newGroup.name || !newGroup.fieldByYear || (!newGroup.isPublic && !newGroup.password)}
                  startIcon={<GroupAdd />}
                >
                  Utwórz grupę
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Snackbar
            open={showSuccess}
            autoHideDuration={6000}
            onClose={() => setShowSuccess(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert
              severity="success"
              sx={{ width: '100%' }}
              icon={<GroupAdd fontSize="inherit" />}
            >
              <Typography variant="body1">
                Grupa utworzona pomyślnie!
              </Typography>
              <Typography variant="body2">
                Kod dostępu: <strong>{createdGroupCode}</strong>
              </Typography>
              <Button
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
                onClick={() => navigator.clipboard.writeText(createdGroupCode)}
              >
                Kopiuj kod
              </Button>
            </Alert>
          </Snackbar>
        </Box>) : null}

      <Dialog open={!!selectedGroup} onClose={() => setSelectedGroup(null)}>
        <DialogTitle>Dołącz do {selectedGroup?.name}</DialogTitle>
        <DialogContent>
          {!selectedGroup?.isPublic && (
            <TextField
              autoFocus
              margin="dense"
              label="Hasło dostępu"
              type="password"
              fullWidth
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedGroup(null)}>Anuluj</Button>
          <Button onClick={handleJoinGroup} variant="contained">
            Dołącz
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Groups;