import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  colors,
  IconButton,
  useTheme
} from '@mui/material';
import { Add, Event, Upload, Close } from '@mui/icons-material';
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { pl } from 'date-fns/locale';
import { format, parseISO } from 'date-fns';

const colorOptions = [
  { value: colors.blue[500], label: 'Niebieski' },
  { value: colors.red[500], label: 'Czerwony' },
  { value: colors.green[500], label: 'Zielony' },
  { value: colors.orange[500], label: 'Pomarańczowy' },
  { value: colors.purple[500], label: 'Fioletowy' },
];

const MyCalendar = () => {
  const theme = useTheme();
  const [events, setEvents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newEvent, setNewEvent] = useState({
    name: '',
    start: '',
    end: '',
    color: colors.blue[500],
    additional_info: '',
    recurrent: false,
    recurrency_details: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEvent = () => {
    const event = {
      ...newEvent,
      id: Date.now(),
      user: "current_user_id"
    };
    setEvents([...events, event]);
    setOpenDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setNewEvent({
      name: '',
      start: '',
      end: '',
      color: colors.blue[500],
      additional_info: '',
      recurrent: false,
      recurrency_details: null
    });
  };

  const handleFileUpload = (e) => {
    // Symulacja importu z pliku
    const fakeImportedEvents = [
      {
        id: Date.now() + 1,
        name: 'Spotkanie z klientem',
        start: '2023-12-15T10:00:00',
        end: '2023-12-15T11:30:00',
        color: colors.blue[500],
        additional_info: 'Prezentacja nowego produktu',
        recurrent: false,
        user: "current_user_id"
      },
      {
        id: Date.now() + 2,
        name: 'Przegląd projektu',
        start: '2023-12-16T14:00:00',
        end: '2023-12-16T15:00:00',
        color: colors.green[500],
        additional_info: '',
        recurrent: true,
        recurrency_details: { num: 1, type: "weeks", until: '2024-01-16' },
        user: "current_user_id"
      }
    ];

    setEvents([...events, ...fakeImportedEvents]);
    alert('Zaimportowano 2 wydarzenia z pliku (symulacja)');
  };

  const renderDay = (day, _selectedDays, pickersDayProps) => {
    const dayEvents = events.filter(event => {
      const eventDate = parseISO(event.start);
      return eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear();
    });

    return (
      <Box sx={{ position: 'relative', height: '100%' }}>
        <Box {...pickersDayProps} />
        {dayEvents.length > 0 && (
          <Box sx={{
            position: 'absolute',
            bottom: 4,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: 0.5
          }}>
            {dayEvents.slice(0, 3).map((event, index) => (
              <Box key={index} sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: event.color
              }} />
            ))}
            {dayEvents.length > 3 && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                +{dayEvents.length - 3}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
          <Event color="primary" sx={{ mr: 1 }} /> Kalendarz
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Upload />}
            component="label"
          >
            Importuj z pliku
            <input
              type="file"
              hidden
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
            />
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            Nowe wydarzenie
          </Button>
        </Box>
      </Box>

      <Box sx={{
        bgcolor: 'background.paper',
        borderRadius: 4,
        p: 3,
        boxShadow: theme.shadows[2]
      }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
          <DateCalendar
            value={selectedDate}
            onChange={(newDate) => setSelectedDate(newDate)}
            slots={{ day: renderDay }}
            sx={{
              '& .MuiPickersDay-root': {
                height: 48,
                width: 48,
                fontSize: '0.875rem',
              },
              '& .Mui-selected': {
                backgroundColor: `${theme.palette.primary.main} !important`,
                color: theme.palette.primary.contrastText,
              }
            }}
          />
        </LocalizationProvider>
      </Box>

      {/* Dialog dodawania wydarzenia */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Dodaj nowe wydarzenie</Typography>
          <IconButton onClick={() => setOpenDialog(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Nazwa wydarzenia"
              name="name"
              value={newEvent.name}
              onChange={handleInputChange}
              fullWidth
              required
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Data i czas rozpoczęcia"
                type="datetime-local"
                name="start"
                value={newEvent.start}
                onChange={handleInputChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Data i czas zakończenia"
                type="datetime-local"
                name="end"
                value={newEvent.end}
                onChange={handleInputChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <FormControl fullWidth>
              <InputLabel>Kolor</InputLabel>
              <Select
                name="color"
                value={newEvent.color}
                onChange={handleInputChange}
                label="Kolor"
              >
                {colorOptions.map((color) => (
                  <MenuItem key={color.value} value={color.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{
                        width: 16,
                        height: 16,
                        bgcolor: color.value,
                        borderRadius: '50%',
                        mr: 1.5
                      }} />
                      {color.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Dodatkowe informacje"
              name="additional_info"
              value={newEvent.additional_info}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
            />

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ mr: 2 }}>Cykliczne:</Typography>
              <Button
                variant={newEvent.recurrent ? "contained" : "outlined"}
                onClick={() => setNewEvent(prev => ({ ...prev, recurrent: !prev.recurrent }))}
              >
                {newEvent.recurrent ? "Tak" : "Nie"}
              </Button>
            </Box>

            {newEvent.recurrent && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Co ile"
                  type="number"
                  name="recurrency_num"
                  value={newEvent.recurrency_details?.num || ''}
                  onChange={(e) => setNewEvent(prev => ({
                    ...prev,
                    recurrency_details: {
                      ...prev.recurrency_details,
                      num: parseInt(e.target.value) || 1
                    }
                  }))}
                  sx={{ width: 100 }}
                />
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Typ cyklu</InputLabel>
                  <Select
                    value={newEvent.recurrency_details?.type || 'days'}
                    onChange={(e) => setNewEvent(prev => ({
                      ...prev,
                      recurrency_details: {
                        ...prev.recurrency_details,
                        type: e.target.value
                      }
                    }))}
                    label="Typ cyklu"
                  >
                    <MenuItem value="days">Dni</MenuItem>
                    <MenuItem value="weeks">Tygodnie</MenuItem>
                    <MenuItem value="months">Miesiące</MenuItem>
                    <MenuItem value="years">Lata</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Data końcowa"
                  type="date"
                  name="recurrency_until"
                  value={newEvent.recurrency_details?.until || ''}
                  onChange={(e) => setNewEvent(prev => ({
                    ...prev,
                    recurrency_details: {
                      ...prev.recurrency_details,
                      until: e.target.value
                    }
                  }))}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flexGrow: 1 }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>Anuluj</Button>
          <Button
            variant="contained"
            onClick={handleAddEvent}
            disabled={!newEvent.name || !newEvent.start || !newEvent.end}
          >
            Dodaj wydarzenie
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lista wydarzeń */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Nadchodzące wydarzenia ({format(selectedDate, 'dd MMMM yyyy', { locale: pl })})
        </Typography>
        {events.filter(event => {
          const eventDate = parseISO(event.start);
          return eventDate.getDate() === selectedDate.getDate() &&
            eventDate.getMonth() === selectedDate.getMonth() &&
            eventDate.getFullYear() === selectedDate.getFullYear();
        }).length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {events
              .filter(event => {
                const eventDate = parseISO(event.start);
                return eventDate.getDate() === selectedDate.getDate() &&
                  eventDate.getMonth() === selectedDate.getMonth() &&
                  eventDate.getFullYear() === selectedDate.getFullYear();
              })
              .sort((a, b) => new Date(a.start) - new Date(b.start))
              .map(event => (
                <Box
                  key={event.id}
                  sx={{
                    p: 2,
                    borderLeft: `4px solid ${event.color}`,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    boxShadow: theme.shadows[1]
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">{event.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {format(parseISO(event.start), 'HH:mm')} - {format(parseISO(event.end), 'HH:mm')}
                  </Typography>
                  {event.additional_info && (
                    <Typography variant="body2" sx={{ mt: 1 }}>{event.additional_info}</Typography>
                  )}
                  {event.recurrent && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                      Wydarzenie cykliczne
                    </Typography>
                  )}
                </Box>
              ))}
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary">
            Brak wydarzeń w wybranym dniu
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default MyCalendar;