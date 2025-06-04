import React, {useState, useEffect} from 'react';
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
    Chip,
    Avatar,
    Stack
} from '@mui/material';
import {
    Add,
    Event,
    Close,
    ChevronLeft,
    ChevronRight,
    Edit,
    Delete,
    MoreVert
} from '@mui/icons-material';
import {
    format,
    parseISO,
    addMonths,
    subMonths,
    isSameMonth,
    isSameDay,
    startOfDay,
    endOfDay,
    isWithinInterval,
    isBefore,
    isAfter, getDay
} from 'date-fns';
import {pl} from 'date-fns/locale';
import client from "../../client";
import {API_BASE_URL} from "../../config";
import {differenceInDays, differenceInWeeks, differenceInMonths} from 'date-fns';
import {DateTimePicker} from "@mui/x-date-pickers";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";


const isRecurringOnDay = (event, day) => {
    if (!event.recurrent || !event.recurrency_details) return false;

    const eventStart = parseISO(event.start);
    const until = event.recurrency_details.until ? parseISO(event.recurrency_details.until) : null;
    const num = event.recurrency_details.num || 1;
    const type = event.recurrency_details.type; // "days", "weeks", "months"

    if (until && isAfter(day, until)) return false;
    if (isBefore(day, startOfDay(eventStart))) return false;

    if (type === "days") {
        const diff = differenceInDays(startOfDay(day), startOfDay(eventStart));
        return diff % num === 0;
    }

    if (type === "weeks") {
        // Sprawdź dzień tygodnia (0 = niedziela, 1 = poniedziałek, ..., 6 = sobota)
        if (getDay(day) !== getDay(eventStart)) return false;

        const diff = differenceInWeeks(startOfDay(day), startOfDay(eventStart));
        return diff % num === 0;
    }

    if (type === "months") {
        const diff = differenceInMonths(startOfDay(day), startOfDay(eventStart));
        return diff % num === 0;
    }

    return false;
};


const colorOptions = [
    {value: colors.blue[500], label: 'Niebieski'},
    {value: colors.red[500], label: 'Czerwony'},
    {value: colors.green[500], label: 'Zielony'},
    {value: colors.orange[500], label: 'Pomarańczowy'},
    {value: colors.purple[500], label: 'Fioletowy'},
];

const monthsPL = [
    "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
    "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
];

const daysOfWeek = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];


const MyCalendar = () => {
    const theme = useTheme();
    const [events, setEvents] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [eventForm, setEventForm] = useState({
        name: '',
        start: '',
        end: '',
        color: colors.blue[500],
        additional_info: '',
        recurrent: false,
        recurrency_details: null
    });

    const token = localStorage.getItem("access");

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await client.get(API_BASE_URL + "calendar/", {
                    headers: {Authorization: `Bearer ${token}`},
                });
                // setEvents(response.data);
                setEvents(response.data);
            } catch (error) {
                console.error("Błąd pobierania wydarzeń:", error);
            }
        };

        if (token) fetchEvents();
    }, [token]);


    const generateCalendarDays = () => {
        const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        const days = [];
        const startDay = startDate.getDay() === 0 ? 6 : startDate.getDay() - 1;

        for (let i = 0; i < startDay; i++) days.push(null);
        for (let i = 1; i <= endDate.getDate(); i++) {
            days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
        }

        return days;
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setEventForm(prev => ({...prev, [name]: value}));
    };

    const handleOpenDialog = (event = null) => {
        if (event) {
            setSelectedEvent(event);
            setEventForm({
                name: event.name,
                start: event.start,
                end: event.end,
                color: event.color,
                additional_info: event.additional_info,
                recurrent: event.recurrent,
                recurrency_details: event.recurrency_details
            });
            setEditMode(true);
        } else {
            setEventForm({
                name: '',
                start: format(selectedDate, "yyyy-MM-dd'T'HH:mm"),
                end: format(selectedDate, "yyyy-MM-dd'T'HH:mm"),
                color: colors.blue[500],
                additional_info: '',
                recurrent: false,
                recurrency_details: null
            });
            setEditMode(false);
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedEvent(null);
    };

    const handleSaveEvent = async () => {
        try {
            if (editMode) {
                const response = await client.put(`event/${selectedEvent.id}/`, {
                    event: eventForm
                });
                setEvents(events.map(e => e.id === selectedEvent.id ? response.data : e));
            } else {
                const response = await client.post(`event/`, {
                    event: eventForm
                });
                setEvents([...events, response.data]);
            }
            handleCloseDialog();
        } catch (error) {
            console.error('Błąd zapisywania wydarzenia:', error);
        }
    };

    const handleDeleteEvent = async () => {
        try {
            await client.delete(`event/${selectedEvent.id}/`);
            setEvents(events.filter(e => e.id !== selectedEvent.id));
            handleCloseDialog();
        } catch (error) {
            console.error('Błąd usuwania wydarzenia:', error);
        }
    };

    const handleMonthChange = (direction) => {
        setCurrentMonth(direction === 'next'
            ? addMonths(currentMonth, 1)
            : subMonths(currentMonth, 1)
        );
    };

    const getEventsForDay = (day) => {
        if (!day) return [];
        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);

        return events.filter(event => {
            const eventStart = parseISO(event.start);
            const eventEnd = parseISO(event.end);

            if (event.recurrent) {
                return isRecurringOnDay(event, day);
            }

            // Wydarzenia niecykliczne
            return (
                isWithinInterval(eventStart, {start: dayStart, end: dayEnd}) ||
                isWithinInterval(eventEnd, {start: dayStart, end: dayEnd}) ||
                (isBefore(eventStart, dayStart) && isAfter(eventEnd, dayEnd))
            );
        });
    };

    const calendarDays = generateCalendarDays();
    const handleDateChange = (field, value) => {
        setEventForm((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Box sx={{p: 4, maxWidth: 1200, mx: 'auto'}}>
            {/* Nagłówek i przyciski */}
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                <Typography variant="h4" sx={{display: 'flex', alignItems: 'center'}}>
                    <Event color="primary" sx={{mr: 2, fontSize: '2rem'}}/>
                    Kalendarz
                </Typography>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        onClick={() => handleOpenDialog()}
                        sx={{height: 40}}
                    >
                        <Add/>
                    </Button>
                </Stack>
            </Box>

            {/* Kontrolki kalendarza */}
            <Paper elevation={3} sx={{mb: 3, borderRadius: 2}}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    borderBottom: `1px solid ${theme.palette.divider}`
                }}>
                    <IconButton onClick={() => handleMonthChange('prev')}>
                        <ChevronLeft/>
                    </IconButton>
                    <Typography variant="h5">
                        {monthsPL[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </Typography>
                    <IconButton onClick={() => handleMonthChange('next')}>
                        <ChevronRight/>
                    </IconButton>
                </Box>

                {/* Widok miesiąca */}
                <TableContainer>
                    <Table sx={{tableLayout: 'fixed'}}>
                        <TableHead>
                            <TableRow>
                                {daysOfWeek.map(day => (
                                    <TableCell
                                        key={day}
                                        align="center"
                                        sx={{fontWeight: 'bold', p: 1}}
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
                                                    height: 100,
                                                    p: 0.5,
                                                    border: `1px solid ${theme.palette.divider}`,
                                                    bgcolor: dayObj && isSameDay(dayObj, selectedDate)
                                                        ? theme.palette.action.selected
                                                        : 'inherit',
                                                    cursor: dayObj ? 'pointer' : 'default',
                                                    overflow: 'hidden'
                                                }}
                                                onClick={() => dayObj && setSelectedDate(dayObj)}
                                            >
                                                {dayObj && (
                                                    <>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontWeight: isSameDay(dayObj, new Date()) ? 'bold' : 'normal',
                                                                color: !isSameMonth(dayObj, currentMonth)
                                                                    ? theme.palette.text.disabled
                                                                    : 'inherit',
                                                            }}
                                                        >
                                                            {dayObj.getDate()}
                                                        </Typography>
                                                        <Box sx={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: 0.5,
                                                            mt: 0.5,
                                                            maxHeight: 70,
                                                            overflow: 'auto'
                                                        }}>
                                                            {dayEvents.length > 0 && (
                                                                <>
                                                                    {/* Pierwszy event */}
                                                                    <Chip
                                                                        key={0}
                                                                        label={`${format(parseISO(dayEvents[0].start), 'HH:mm')} ${dayEvents[0].name}`}
                                                                        size="small"
                                                                        sx={{
                                                                            bgcolor: dayEvents[0].color,
                                                                            color: 'white',
                                                                            maxWidth: '100%',
                                                                            justifyContent: 'flex-start',
                                                                            '& .MuiChip-label': {
                                                                                overflow: 'hidden',
                                                                                textOverflow: 'ellipsis'
                                                                            }
                                                                        }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleOpenDialog(dayEvents[0]);
                                                                        }}
                                                                    />

                                                                    {/* Informacja o dodatkowych eventach, jeśli istnieją */}
                                                                    {dayEvents.length > 1 && (
                                                                        <Chip
                                                                            label={`+ ${dayEvents.length - 1} więcej`}
                                                                            size="small"
                                                                            sx={{
                                                                                bgcolor: theme.palette.grey[300],
                                                                                color: theme.palette.text.secondary,
                                                                                maxWidth: '100%',
                                                                                justifyContent: 'flex-start',
                                                                                fontStyle: 'italic',
                                                                                '& .MuiChip-label': {
                                                                                    overflow: 'hidden',
                                                                                    textOverflow: 'ellipsis'
                                                                                }
                                                                            }}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                // Możesz dodać obsługę kliknięcia, np. otwarcie listy wszystkich eventów
                                                                            }}
                                                                        />
                                                                    )}
                                                                </>
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
            </Paper>

            {/* Szczegóły dnia */}
            <Paper elevation={3} sx={{p: 3, borderRadius: 2}}>
                <Typography variant="h5" sx={{mb: 2}}>
                    {format(selectedDate, 'EEEE, d MMMM yyyy', {locale: pl})}
                </Typography>

                {getEventsForDay(selectedDate).length > 0 ? (
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                        {getEventsForDay(selectedDate)
                            .sort((a, b) => new Date(a.start) - new Date(b.start))
                            .map(event => (
                                <Paper
                                    key={event.id}
                                    elevation={2}
                                    sx={{
                                        p: 2,
                                        borderLeft: `4px solid ${event.color}`,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Box>
                                        <Typography variant="h6">{event.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {format(parseISO(event.start), 'yyyy-MM-dd HH:mm')} - {format(parseISO(event.end), 'yyyy-MM-dd HH:mm')}
                                        </Typography>
                                        {event.additional_info && (
                                            <Typography variant="body2" sx={{mt: 1}}>
                                                {event.additional_info}
                                            </Typography>
                                        )}
                                        {event.recurrent && (
                                            <Chip
                                                label="Cykliczne"
                                                size="small"
                                                sx={{mt: 1}}
                                            />
                                        )}
                                        {event.group && (
                                            <Chip
                                                label={`Grupowe - ${event.group.name}`}
                                                size="small"
                                                sx={{mt: 1}}
                                            />
                                        )}
                                    </Box>
                                    <IconButton onClick={() => handleOpenDialog(event)}>
                                        <MoreVert/>
                                    </IconButton>
                                </Paper>
                            ))}
                    </Box>
                ) : (
                    <Typography variant="body1" color="text.secondary" sx={{textAlign: 'center', py: 4}}>
                        Brak wydarzeń w wybranym dniu
                    </Typography>
                )}
            </Paper>

            {/* Dialog wydarzenia */}
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    {editMode ? 'Edytuj wydarzenie' : 'Dodaj wydarzenie'}
                    <IconButton onClick={handleCloseDialog}>
                        <Close/>
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{p: 3}}>
                    <Box sx={{mt: 1, display: 'flex', flexDirection: 'column', gap: 3}}>
                        <TextField
                            label="Nazwa wydarzenia"
                            name="name"
                            value={eventForm.name}
                            onChange={handleInputChange}
                            fullWidth
                            required
                        />

                        <Box sx={{display: 'flex', gap: 2}}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
                                <DateTimePicker
                                    label="Rozpoczęcie"
                                    value={eventForm.start}
                                    onChange={(newValue) => handleDateChange('start', newValue)}
                                    renderInput={(params) => <TextField {...params} fullWidth/>}
                                />

                                <DateTimePicker
                                    label="Zakończenie"
                                    value={eventForm.end}
                                    onChange={(newValue) => handleDateChange('end', newValue)}
                                    renderInput={(params) => <TextField {...params} fullWidth/>}
                                />
                            </LocalizationProvider>
                        </Box>

                        <FormControl fullWidth>
                            <InputLabel>Kolor</InputLabel>
                            <Select
                                name="color"
                                value={eventForm.color}
                                onChange={handleInputChange}
                                label="Kolor"
                            >
                                {colorOptions.map((color) => (
                                    <MenuItem key={color.value} value={color.value}>
                                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                                            <Box sx={{
                                                width: 16,
                                                height: 16,
                                                bgcolor: color.value,
                                                borderRadius: '50%',
                                                mr: 1.5
                                            }}/>
                                            {color.label}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Opis"
                            name="additional_info"
                            value={eventForm.additional_info}
                            onChange={handleInputChange}
                            fullWidth
                            multiline
                            rows={4}
                        />

                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                            <Typography variant="body1" sx={{mr: 2}}>Wydarzenie cykliczne:</Typography>
                            <Button
                                variant={eventForm.recurrent ? "contained" : "outlined"}
                                onClick={() => setEventForm(prev => ({...prev, recurrent: !prev.recurrent}))}
                            >
                                {eventForm.recurrent ? "Tak" : "Nie"}
                            </Button>
                        </Box>

                        {eventForm.recurrent && (
                            <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>
                                <TextField
                                    label="Co"
                                    type="number"
                                    name="recurrency_num"
                                    size="small"
                                    value={eventForm.recurrency_details?.num || 1}
                                    onChange={(e) => setEventForm(prev => ({
                                        ...prev,
                                        recurrency_details: {
                                            ...prev.recurrency_details,
                                            num: parseInt(e.target.value) || 1
                                        }
                                    }))}
                                    sx={{width: 100}}
                                />
                                <FormControl sx={{minWidth: 120}} size="small">
                                    <InputLabel>Typ</InputLabel>
                                    <Select
                                        value={eventForm.recurrency_details?.type || 'days'}
                                        onChange={(e) => setEventForm(prev => ({
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
                                    label="Data końcowa"
                                    type="date"
                                    name="recurrency_until"
                                    size="small"
                                    value={eventForm.recurrency_details?.until || ''}
                                    onChange={(e) => setEventForm(prev => ({
                                        ...prev,
                                        recurrency_details: {
                                            ...prev.recurrency_details,
                                            until: e.target.value
                                        }
                                    }))}
                                    InputLabelProps={{shrink: true}}
                                    sx={{flexGrow: 1}}
                                />
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{p: 2}}>
                    {editMode && (
                        <Button
                            onClick={handleDeleteEvent}
                            color="error"
                            startIcon={<Delete/>}
                            sx={{mr: 'auto'}}
                        >
                            Usuń
                        </Button>
                    )}
                    <Button onClick={handleCloseDialog}>Anuluj</Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveEvent}
                        disabled={!eventForm.name || !eventForm.start || !eventForm.end}
                        startIcon={editMode ? <Edit/> : <Add/>}
                    >
                        {editMode ? 'Zapisz zmiany' : 'Dodaj wydarzenie'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MyCalendar;