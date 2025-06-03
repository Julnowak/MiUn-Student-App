import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Box,
    Chip,
    List,
    ListItem,
    ListItemText,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    colors, CircularProgress
} from '@mui/material';
import { Add, CalendarToday, FilterList, Sort, Event } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import pl from 'date-fns/locale/pl';
import client from "../../client";

const EventsTab = ({ groupId }) => {
  const [events, setEvents] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [sortBy, setSortBy] = useState('start');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [loading, setLoading] = useState(false);

  // Formularz nowego wydarzenia
  const [newEvent, setNewEvent] = useState({
    name: '',
    start: new Date(),
    end: new Date(Date.now() + 3600000), // +1 godzina
    color: colors.blue[500],
    additional_info: '',
    recurrent: false,
    recurrency_details: null
  });

  // Pobierz wydarzenia
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await client.get(`/groups/${groupId}/events/`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchEvents();
    }
  }, [groupId]);

  // Filtruj i sortuj wydarzenia
  const filteredEvents = events
    .filter(event => {
      const matchesName = event.name.toLowerCase().includes(filterName.toLowerCase());
      const isActive = showActiveOnly ? new Date(event.end) >= new Date() : true;
      return matchesName && isActive;
    })
    .sort((a, b) => {
      if (sortBy === 'start') return new Date(a.start) - new Date(b.start);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  // Obsługa formularza
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, value) => {
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (currentEvent) {
        // Edycja istniejącego wydarzenia
        await client.put(`/events/${currentEvent.id}/`, currentEvent);
      } else {
        // Dodanie nowego wydarzenia
        await client.post(`/groups/${groupId}/events/`, newEvent);
      }
      setOpenModal(false);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await client.delete(`/events/${id}/`);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <Box sx={{ pt: 1 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Wydarzenia grupy</Typography>
              <Button
                startIcon={<Add />}
                onClick={() => {
                  setCurrentEvent(null);
                  setOpenModal(true);
                }}
                variant="contained"
              >
                Nowe wydarzenie
              </Button>
            </Box>

            {/* Filtry i sortowanie */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                label="Filtruj po nazwie"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                InputProps={{
                  startAdornment: <FilterList fontSize="small" sx={{ mr: 1 }} />
                }}
              />

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sortuj według</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sortuj według"
                  startAdornment={<Sort fontSize="small" sx={{ mr: 1 }} />}
                >
                  <MenuItem value="start">Data rozpoczęcia</MenuItem>
                  <MenuItem value="name">Nazwa</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={showActiveOnly}
                    onChange={(e) => setShowActiveOnly(e.target.checked)}
                  />
                }
                label="Tylko aktywne"
              />
            </Box>

            {/* Lista wydarzeń */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : filteredEvents.length === 0 ? (
              <Typography color="textSecondary" align="center" sx={{ p: 2 }}>
                Brak wydarzeń do wyświetlenia
              </Typography>
            ) : (
              <List>
                {filteredEvents.map((event) => (
                  <React.Fragment key={event.id}>
                    <ListItem
                      button
                      onClick={() => {
                        setCurrentEvent(event);
                        setOpenModal(true);
                      }}
                    >
                      <Box sx={{
                        width: 4,
                        height: 40,
                        bgcolor: event.color,
                        mr: 2,
                        borderRadius: 1
                      }} />
                      <ListItemText
                        primary={event.name}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {new Date(event.start).toLocaleString('pl-PL')}
                            </Typography>
                            {' — '}
                            <Typography component="span" variant="body2" color="text.primary">
                              {new Date(event.end).toLocaleString('pl-PL')}
                            </Typography>
                            {event.recurrent && (
                              <Chip
                                label="Cykliczne"
                                size="small"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>


      {/* Modal wydarzenia */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentEvent ? 'Edytuj wydarzenie' : 'Nowe wydarzenie'}
        </DialogTitle>
        <DialogContent dividers>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
            <TextField
              fullWidth
              label="Nazwa wydarzenia"
              name="name"
              value={currentEvent?.name || newEvent.name}
              onChange={(e) =>
                currentEvent
                  ? setCurrentEvent({...currentEvent, name: e.target.value})
                  : handleInputChange(e)
              }
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <DateTimePicker
                label="Rozpoczęcie"
                value={currentEvent?.start || newEvent.start}
                onChange={(date) =>
                  currentEvent
                    ? setCurrentEvent({...currentEvent, start: date})
                    : handleDateChange('start', date)
                }
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              <DateTimePicker
                label="Zakończenie"
                value={currentEvent?.end || newEvent.end}
                onChange={(date) =>
                  currentEvent
                    ? setCurrentEvent({...currentEvent, end: date})
                    : handleDateChange('end', date)
                }
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Box>

            <TextField
              fullWidth
              label="Kolor (hex)"
              name="color"
              value={currentEvent?.color || newEvent.color}
              onChange={(e) =>
                currentEvent
                  ? setCurrentEvent({...currentEvent, color: e.target.value})
                  : handleInputChange(e)
              }
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Dodatkowe informacje"
              name="additional_info"
              value={currentEvent?.additional_info || newEvent.additional_info}
              onChange={(e) =>
                currentEvent
                  ? setCurrentEvent({...currentEvent, additional_info: e.target.value})
                  : handleInputChange(e)
              }
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={currentEvent?.recurrent || newEvent.recurrent}
                  onChange={(e) =>
                    currentEvent
                      ? setCurrentEvent({...currentEvent, recurrent: e.target.checked})
                      : setNewEvent({...newEvent, recurrent: e.target.checked})
                  }
                />
              }
              label="Wydarzenie cykliczne"
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          {currentEvent && (
            <Button
              onClick={() => handleDelete(currentEvent.id)}
              color="error"
            >
              Usuń
            </Button>
          )}
          <Button onClick={() => setOpenModal(false)}>Anuluj</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!newEvent.name && !currentEvent?.name}
          >
            Zapisz
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventsTab;