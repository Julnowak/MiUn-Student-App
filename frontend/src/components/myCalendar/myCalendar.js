import React, {useEffect, useState} from 'react';
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
  useTheme,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery
} from '@mui/material';
import {Add, Event, Upload, Close, ChevronLeft, ChevronRight, EventNote} from '@mui/icons-material';
import { format, parseISO, addMonths, addWeeks,  subMonths, isSameMonth, isSameDay } from 'date-fns';
import { pl } from 'date-fns/locale';
import { isWithinInterval, eachDayOfInterval, differenceInMinutes, differenceInHours, startOfWeek, endOfWeek} from 'date-fns';
import {alpha} from "@mui/material/styles";
import client from "../../client";
import {API_BASE_URL} from "../../config";

const colorOptions = [
  { value: colors.blue[500], label: 'Niebieski' },
  { value: colors.red[500], label: 'Czerwony' },
  { value: colors.green[500], label: 'Zielony' },
  { value: colors.orange[500], label: 'Pomarańczowy' },
  { value: colors.purple[500], label: 'Fioletowy' },
];

const WeekView = ({ events, selectedDate, onDateChange }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Oblicz zakres tygodnia (od poniedziałku do niedzieli)
  console.log(selectedDate)
  const startof = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const endof = endOfWeek(selectedDate, { weekStartsOn: 1 });

  // Generuj dni tygodnia
  const days = eachDayOfInterval({
    start: startof,
    end: endof
  });

  // Podziel dzień na przedziały godzinowe
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Funkcja do nawigacji między tygodniami
  const navigateWeek = (direction) => {
    const newDate = addWeeks(selectedDate, direction);
    onDateChange(newDate);
  };

  // Funkcja do sprawdzania czy wydarzenie jest w danym przedziale czasowym
  const isEventInSlot = (event, day, hour) => {
    const eventStart = parseISO(event.start);
    const eventEnd = parseISO(event.end);
    const slotStart = new Date(day);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(day);
    slotEnd.setHours(hour + 1, 0, 0, 0);

    return (eventStart < slotEnd && eventEnd > slotStart);
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* Nagłówek z nawigacją */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 1,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <IconButton onClick={() => navigateWeek(-1)}>
          <ChevronLeft />
        </IconButton>

        <Typography variant="h6" sx={{ textAlign: 'center' }}>
          {format(startof, 'd MMM yyyy', { locale: pl })} - {format(endof, 'd MMM yyyy', { locale: pl })}
        </Typography>

        <IconButton onClick={() => navigateWeek(1)}>
          <ChevronRight />
        </IconButton>
      </Box>

      {/* Kontener główny */}
      <Box sx={{
        display: 'flex',
        flex: 1,
        overflow: 'auto'
      }}>
        {/* Kolumna z godzinami */}
        <Box sx={{
          width: 60,
          borderRight: `1px solid ${theme.palette.divider}`,
          position: 'sticky',
          left: 0,
          zIndex: 2,
          bgcolor: 'background.paper'
        }}>
          {hours.map(hour => (
            <Box key={hour} sx={{
              height: 48,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-end',
              pr: 1,
              borderBottom: `1px solid ${theme.palette.divider}`,
              boxSizing: 'border-box'
            }}>
              <Typography variant="caption" color="text.secondary">
                {`${hour}:00`}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Kolumny dni tygodnia */}
        <Box sx={{ display: 'flex', flex: 1 }}>
          {days.map(day => {
            const dayEvents = events.filter(event =>
              isSameDay(parseISO(event.start), day)
            );

            return (
              <Box
                key={day.toString()}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  borderRight: `1px solid ${theme.palette.divider}`,
                  bgcolor: isSameDay(day, selectedDate) ?
                    alpha(theme.palette.primary.main, 0.05) :
                    'inherit'
                }}
                onClick={() => onDateChange(day)}
              >
                {/* Nagłówek dnia */}
                <Box sx={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  bgcolor: 'background.paper',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  p: 1,
                  textAlign: 'center'
                }}>
                  <Typography variant="subtitle2">
                    {format(day, 'EEE', { locale: pl })}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isSameDay(day, new Date()) ? 'bold' : 'normal',
                      color: isSameDay(day, new Date()) ?
                        theme.palette.primary.main :
                        'inherit'
                    }}
                  >
                    {format(day, 'd', { locale: pl })}
                  </Typography>
                </Box>

                {/* Komórki godzinowe */}
                <Box>
                  {hours.map(hour => {
                    const slotEvents = dayEvents.filter(event =>
                      isEventInSlot(event, day, hour)
                    );

                    return (
                      <Box
                        key={hour}
                        sx={{
                          height: 48,
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          position: 'relative',
                          '&:hover': {
                            bgcolor: theme.palette.action.hover
                          }
                        }}
                      >
                        {slotEvents.map((event, idx) => {
                          const eventStart = parseISO(event.start);
                          const eventEnd = parseISO(event.end);
                          const startHour = eventStart.getHours();
                          const startMinute = eventStart.getMinutes();
                          const durationHours = differenceInHours(eventEnd, eventStart);

                          return (
                            <Box
                              key={event.id}
                              sx={{
                                position: 'absolute',
                                top: `${(startMinute / 60) * 48}px`,
                                left: 4,
                                right: 4,
                                height: `${Math.max(durationHours * 48 + (startMinute / 60) * 48, 24)}px`,
                                bgcolor: event.color,
                                color: 'white',
                                borderRadius: 1,
                                p: 0.5,
                                overflow: 'hidden',
                                zIndex: 1,
                                cursor: 'pointer'
                              }}
                            >
                              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                {format(eventStart, 'HH:mm')} {event.name}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

const DayView = ({ events, date, onEventClick }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Generuj przedziały godzinowe (6:00 - 22:00)
  const hours = Array.from({ length: 17 }, (_, i) => i + 6);

  // Wydarzenia dla wybranego dnia
  const dayEvents = events.filter(event =>
    isSameDay(parseISO(event.start), date)
  ).sort((a, b) => new Date(a.start) - new Date(b.start));

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* Nagłówek z datą */}
      <Box sx={{
        p: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        position: 'sticky',
        top: 0,
        zIndex: 2
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {format(date, "EEEE, d MMMM yyyy", { locale: pl })}
        </Typography>
      </Box>

      {/* Kontener główny */}
      <Box sx={{
        flex: 1,
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Linie czasu */}
        {hours.map(hour => (
          <Box
            key={hour}
            sx={{
              display: 'flex',
              height: 48,
              borderBottom: `1px solid ${theme.palette.divider}`,
              position: 'relative'
            }}
          >
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                left: 8,
                top: -10,
                color: 'text.secondary',
                bgcolor: 'background.paper',
                px: 1
              }}
            >
              {`${hour}:00`}
            </Typography>
          </Box>
        ))}

        {/* Wydarzenia */}
        {dayEvents.map(event => {
          const start = parseISO(event.start);
          const end = parseISO(event.end);
          const startHour = start.getHours();
          const startMinute = start.getMinutes();
          const durationMinutes = differenceInMinutes(end, start);

          return (
            <Box
              key={event.id}
              onClick={() => onEventClick(event)}
              sx={{
                position: 'absolute',
                left: 60,
                right: 16,
                top: `${((startHour - 6) * 48) + (startMinute * 48 / 60)}px`,
                height: `${Math.max(durationMinutes * 48 / 60, 24)}px`,
                bgcolor: event.color,
                color: '#fff',
                borderRadius: 2,
                p: 1.5,
                boxShadow: theme.shadows[1],
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: theme.shadows[3]
                },
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {event.name}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {format(start, 'HH:mm')} - {format(end, 'HH:mm')}
              </Typography>
              {event.additional_info && (
                <Typography
                  variant="caption"
                  sx={{
                    mt: 0.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {event.additional_info}
                </Typography>
              )}
            </Box>
          );
        })}

        {/* Brak wydarzeń */}
        {dayEvents.length === 0 && (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'text.secondary'
          }}>
            <EventNote sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
            <Typography variant="h6">Brak wydarzeń</Typography>
            <Typography variant="body2">Dodaj nowe wydarzenie</Typography>
          </Box>
        )}
      </Box>

      {/* Aktualna godzina - wskaźnik */}
      {isSameDay(date, new Date()) && (
        <Box sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${((new Date().getHours() - 6) * 48) + (new Date().getMinutes() * 48 / 60)}px`,
          height: '2px',
          bgcolor: theme.palette.error.main,
          zIndex: 1,
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: -4,
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: theme.palette.error.main
          }
        }} />
      )}
    </Box>
  );
};

const MyCalendar = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [events, setEvents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
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

      const token = localStorage.getItem("access")
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await client.get(API_BASE_URL + "calendar/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setEvents(response.data);
            } catch (error) {
                console.log("Nie udało się zalogować");
            }
        };

        if (token) {
            fetchData();
        }
    }, [token]);

  const generateCalendarDays = () => {
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const days = [];
    const startDay = startDate.getDay() === 0 ? 6 : startDate.getDay() - 1;

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= endDate.getDate(); i++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }

    return days;
  };

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


  const [view, setView] = useState('month'); // 'month' | 'week' | 'day'

  const getEventsForDay = (day) => {
    if (!day) return [];
    return events?.filter(event => {
      const start = parseISO(event.start);
      const end = parseISO(event.end);
      return isWithinInterval(day, { start, end });
    });
  };

  const handleMonthChange = (direction) => {
    setCurrentMonth(direction === 'next'
      ? addMonths(currentMonth, 1)
      : subMonths(currentMonth, 1)
    );
  };

  const calendarDays = generateCalendarDays();
  const monthsPL = [
  "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
  "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
];
  const daysOfWeek = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];

  return (
    <Box sx={{ p: isSmallScreen ? 1 : 3, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{
        display: 'flex',
        flexDirection: isSmallScreen ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isSmallScreen ? 'flex-start' : 'center',
        gap: isSmallScreen ? 1 : 2,
        mb: 2
      }}>
        <Typography variant={isSmallScreen ? "h6" : "h4"} sx={{ display: 'flex', alignItems: 'center' }}>
          <Event color="primary" sx={{ mr: 1, fontSize: isSmallScreen ? '1.25rem' : '1.5rem' }} />
          Kalendarz
        </Typography>
        <Box sx={{
          display: 'flex',
          gap: 1,
          width: isSmallScreen ? '100%' : 'auto',
          '& .MuiButton-root': {
            fontSize: isSmallScreen ? '0.75rem' : '0.875rem',
            padding: isSmallScreen ? '6px 8px' : '8px 16px'
          }
        }}>

        </Box>

      </Box>

       <Button
            variant="contained"
            startIcon={<Upload sx={{ fontSize: isSmallScreen ? '1rem' : '1.25rem' }} />}
            component="label"
            sx={{ flex: isSmallScreen ? 1 : 0 , m:1}}

          >
            {isSmallScreen ? 'Import' : 'Importuj z pliku'}
            <input type="file" hidden accept=".csv,.xlsx,.xls" />
          </Button>
          <Button
            variant="contained"
            startIcon={<Add sx={{ fontSize: isSmallScreen ? '1rem' : '1.25rem' }} />}
            onClick={() => setOpenDialog(true)}
            sx={{ flex: isSmallScreen ? 1 : 0, m:1 }}
          >
            {isSmallScreen ? 'Dodaj' : 'Nowe wydarzenie'}
          </Button>



      <Box sx={{ mb: 2 }}>
        <Button onClick={() => setView('day')}>Dzień</Button>
        <Button onClick={() => setView('week')}>Tydzień</Button>
        <Button onClick={() => setView('month')}>Miesiąc</Button>
      </Box>

      {/* Kalendarz */}
      {view === 'month' && (
      <Paper elevation={3} sx={{ mb: 3, borderRadius: 2 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 1,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}>
          <IconButton onClick={() => handleMonthChange('prev')} size={isSmallScreen ? "small" : "medium"}>
            <ChevronLeft />
          </IconButton>
          <Typography variant={isSmallScreen ? "subtitle1" : "h6"}>
            {monthsPL[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Typography>
          <IconButton onClick={() => handleMonthChange('next')} size={isSmallScreen ? "small" : "medium"}>
            <ChevronRight />
          </IconButton>
        </Box>

        <TableContainer>
          <Table sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                {daysOfWeek.map(day => (
                  <TableCell
                    key={day}
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      p: 0.5,
                      fontSize: isSmallScreen ? '0.7rem' : '0.875rem'
                    }}
                  >
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(Math.ceil(calendarDays.length / 7)).keys()].map(week => (
                <TableRow key={week}>
                  {[...Array(7).keys()].map(day => {
                    const dayIndex = week * 7 + day;
                    const dayObj = calendarDays[dayIndex];
                    const dayEvents = getEventsForDay(dayObj);

                    return (
                      <TableCell
                        key={dayIndex}
                        align="center"
                        sx={{
                          height: isSmallScreen ? 60 : 80,
                          p: 0.5,
                          border: `1px solid ${theme.palette.divider}`,
                          bgcolor: dayObj && isSameDay(dayObj, selectedDate)
                            ? alpha(theme.palette.primary.main, 0.1)
                            : 'inherit',
                          cursor: dayObj ? 'pointer' : 'default',
                          overflow: 'hidden'
                        }}
                        onClick={() => dayObj && setSelectedDate(dayObj)}
                      >
                        {dayObj && (
                          <>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: isSameDay(dayObj, new Date()) ? 'bold' : 'normal',
                                color: !isSameMonth(dayObj, currentMonth)
                                  ? theme.palette.text.disabled
                                  : 'inherit',
                                fontSize: isSmallScreen ? '0.65rem' : '0.75rem'
                              }}
                            >
                              {dayObj.getDate()}
                            </Typography>
                            <Box sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 0.25,
                              mt: 0.25,
                              maxHeight: isSmallScreen ? 30 : 50,
                              overflow: 'hidden'
                            }}>
                              {dayEvents.slice(0, isSmallScreen ? 1 : 2).map((event, idx) => (
                                <Box
                                  key={idx}
                                  sx={{
                                    bgcolor: event.color,
                                    color: 'white',
                                    borderRadius: 0.5,
                                    p: '1px 2px',
                                    fontSize: isSmallScreen ? '0.55rem' : '0.65rem',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  {isSmallScreen ?
                                    format(parseISO(event.start), 'HH:mm') :
                                    `${format(parseISO(event.start), 'HH:mm')} ${event.name.substring(0, 3)}...`}
                                </Box>
                              ))}
                              {dayEvents.length > (isSmallScreen ? 1 : 2) && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontSize: isSmallScreen ? '0.5rem' : '0.6rem' }}
                                >
                                  +{dayEvents.length - (isSmallScreen ? 1 : 2)}
                                </Typography>
                              )}
                            </Box>
                          </>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>)}
{view === 'week' && (
  // Wyświetl tydzień zawierający selectedDate
  <WeekView
    events={events}
    selectedDate={selectedDate}
    daysOfWeek={daysOfWeek}
    getEventsForDay={getEventsForDay}
    // ...inne propsy
  />
)}
{view === 'day' && (
  // Wyświetl szczegóły dla wybranego dnia
  <DayView
    events={getEventsForDay(selectedDate)}
    date={selectedDate}
    // ...inne propsy
  />
)}

      {/* Dialog dodawania wydarzenia - responsywny */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        fullScreen={isSmallScreen}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: isSmallScreen ? 1 : 2,
          pb: isSmallScreen ? 0 : 1
        }}>
          <Typography variant={isSmallScreen ? "subtitle1" : "h6"}>Dodaj wydarzenie</Typography>
          <IconButton
            onClick={() => setOpenDialog(false)}
            size={isSmallScreen ? "small" : "medium"}
            sx={{ mr: -1 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: isSmallScreen ? 1 : 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nazwa"
              name="name"
              size={isSmallScreen ? "small" : "medium"}
              value={newEvent.name}
              onChange={handleInputChange}
              fullWidth
              required
            />

            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="Rozpoczęcie"
                type="datetime-local"
                name="start"
                size={isSmallScreen ? "small" : "medium"}
                value={newEvent.start}
                onChange={handleInputChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Zakończenie"
                type="datetime-local"
                name="end"
                size={isSmallScreen ? "small" : "medium"}
                value={newEvent.end}
                onChange={handleInputChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <FormControl fullWidth size={isSmallScreen ? "small" : "medium"}>
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
                      <Typography variant="body2">{color.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Notatki"
              name="additional_info"
              size={isSmallScreen ? "small" : "medium"}
              value={newEvent.additional_info}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={isSmallScreen ? 2 : 3}
            />

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 1 }}>Cykliczne:</Typography>
              <Button
                variant={newEvent.recurrent ? "contained" : "outlined"}
                size="small"
                onClick={() => setNewEvent(prev => ({ ...prev, recurrent: !prev.recurrent }))}
              >
                {newEvent.recurrent ? "Tak" : "Nie"}
              </Button>
            </Box>

            {newEvent.recurrent && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <TextField
                  label="Co"
                  type="number"
                  name="recurrency_num"
                  size="small"
                  value={newEvent.recurrency_details?.num || ''}
                  onChange={(e) => setNewEvent(prev => ({
                    ...prev,
                    recurrency_details: {
                      ...prev.recurrency_details,
                      num: parseInt(e.target.value) || 1
                    }
                  }))}
                  sx={{ width: 70 }}
                />
                <FormControl sx={{ minWidth: 90 }} size="small">
                  <InputLabel>Typ</InputLabel>
                  <Select
                    value={newEvent.recurrency_details?.type || 'days'}
                    onChange={(e) => setNewEvent(prev => ({
                      ...prev,
                      recurrency_details: {
                        ...prev.recurrency_details,
                        type: e.target.value
                      }
                    }))}
                    label="Typ"
                  >
                    <MenuItem value="days">Dni</MenuItem>
                    <MenuItem value="weeks">Tygodnie</MenuItem>
                    <MenuItem value="months">Miesiące</MenuItem>
                    <MenuItem value="years">Lata</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Do"
                  type="date"
                  name="recurrency_until"
                  size="small"
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
        <DialogActions sx={{ p: isSmallScreen ? 1 : 2 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            size={isSmallScreen ? "small" : "medium"}
          >
            Anuluj
          </Button>
          <Button
            variant="contained"
            onClick={handleAddEvent}
            disabled={!newEvent.name || !newEvent.start || !newEvent.end}
            size={isSmallScreen ? "small" : "medium"}
          >
            Zapisz
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lista wydarzeń - wersja mobilna */}
      <Box sx={{ mt: 2 }}>
        <Typography variant={isSmallScreen ? "subtitle1" : "h6"} sx={{ mb: 1 }}>
          {format(selectedDate, 'dd MMMM yyyy', { locale: pl })}
        </Typography>
        {getEventsForDay(selectedDate).length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {getEventsForDay(selectedDate)
              .sort((a, b) => new Date(a.start) - new Date(b.start))
              .map(event => (
                <Box
                  key={event.id}
                  sx={{
                    p: 1.5,
                    borderLeft: `3px solid ${event.color}`,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    boxShadow: theme.shadows[1]
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">{event.name}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {format(parseISO(event.start), 'HH:mm')} - {format(parseISO(event.end), 'HH:mm')}
                  </Typography>
                  {event.additional_info && (
                    <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                      {event.additional_info.substring(0, 50)}{event.additional_info.length > 50 ? '...' : ''}
                    </Typography>
                  )}
                  {event.recurrent && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
                      Cykliczne
                    </Typography>
                  )}
                </Box>
              ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Brak wydarzeń
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default MyCalendar;