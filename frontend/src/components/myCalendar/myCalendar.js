import React, {useState} from "react";
import {Calendar, momentLocalizer} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
    Box,
    TextField,
    Button,
    Typography,
    styled,
    DialogTitle,
    DialogContent,
    DialogContentText,
    Dialog,
    DialogActions,
} from "@mui/material";
import moment from 'moment';


// Polskie tłumaczenia
const messages = {
    date: 'Data',
    time: 'Czas',
    event: 'Wydarzenie',
    allDay: 'Cały dzień',
    week: 'Tydzień',
    work_week: 'Tydzień pracy',
    day: 'Dzień',
    month: 'Miesiąc',
    previous: 'Poprzedni',
    next: 'Następny',
    yesterday: 'Wczoraj',
    tomorrow: 'Jutro',
    today: 'Dziś',
    agenda: 'Agenda',
    noEventsInRange: 'Brak wydarzeń w tym okresie.',
    showMore: total => `+${total} więcej`,
};

// Polskie nazwy dni i miesięcy
const polishLocale = {
    weekdays: ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'],
    months: [
        'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
        'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
    ],
    formats: {
        dayHeader: (date, culture, localizer) =>
            `${polishLocale.weekdays[date.getDay()]} ${date.getDate()} ${polishLocale.months[date.getMonth()]}`,
        monthHeader: (date, culture, localizer) =>
            `${polishLocale.months[date.getMonth()]} ${date.getFullYear()}`,
    }
};


const localizer = momentLocalizer(moment);

const MyCalendar = () => {
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({
        title: "",
        start: "",
        end: "",
        color: "#3174ad",
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState("");
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [view, setView] = useState("month");
    const [currentDate, setCurrentDate] = useState(new Date());
    const [fileError, setFileError] = useState("");

    const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.type !== 'application/json') {
    setFileError("Tylko pliki JSON są obsługiwane");
    return;
  }

  try {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);

      // Walidacja struktury danych
      const isValid = data.every(event =>
        event.name &&
        event.start &&
        event.end &&
        event.color
      );

      if (!isValid) throw new Error("Nieprawidłowy format danych");

      const formattedEvents = data.map(event => ({
        title: event.name,
        start: new Date(event.start),
        end: new Date(event.end),
        color: event.color,
        additional_info: event.additional_info || '',
        recurrent: event.recurrent || false
      }));

      setEvents(formattedEvents);
      setFileError("");
    };
    reader.readAsText(file);
  } catch (error) {
    setFileError("Błąd przetwarzania pliku: " + error.message);
  }
};

    const handleAddEvent = () => {
        setError("");

        if (!newEvent.title || !newEvent.start || !newEvent.end) {
            setError("Wszystkie pola są wymagane.");
            return;
        }

        const start = new Date(newEvent.start);
        const end = new Date(newEvent.end);

        if (start >= end) {
            setError("Data rozpoczęcia musi być wcześniejsza niż data zakończenia.");
            return;
        }

        const event = {
            title: newEvent.title,
            start,
            end,
            color: newEvent.color,
        };

        setEvents([...events, event]);
        setNewEvent({title: "", start: "", end: "", color: "#3174ad"});
        setIsModalOpen(false);
    };

    const formatDateTime = (date) => {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('pl-PL', options);
    };

    const ModernButton = styled(Button)({
        borderRadius: "20px",
        textTransform: "none",
        fontWeight: 500,
        padding: "8px 20px",
        transition: "all 0.3s ease",
    });

    return (
        <div style={{
            padding: '16px',
            maxWidth: '100%',
            margin: '0 auto',
            overflowX: 'auto'
        }}>
            <Typography variant="h4" sx={{
                textAlign: "center",
                my: 2,
                fontWeight: 600,
                color: "primary.main",
            }}>
                Mój kalendarz
            </Typography>

            <Box sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                mb: 3,
                flexWrap: "wrap"
            }}>
                <ModernButton
                    variant="contained"
                    color="primary"
                    onClick={() => setIsModalOpen(true)}
                >
                    Dodaj wydarzenie
                </ModernButton>
            </Box>

            <Box sx={{
                height: '70vh',
                minHeight: '500px',
                width: '100%',
                margin: '0 auto',
                borderRadius: 2,
                bgcolor: "background.paper",
                boxShadow: 3,
                overflow: 'hidden',
                '& .rbc-toolbar': {
                    flexDirection: {xs: 'column', sm: 'row'},
                    gap: {xs: '8px', sm: '0'},
                    padding: {xs: '8px', sm: '0'}
                },
                '& .rbc-header': {
                    fontSize: {xs: '0.8rem', sm: '1rem'},
                    padding: {xs: '4px', sm: '8px'}
                },
                '& .rbc-event': {
                    fontSize: {xs: '0.7rem', sm: '0.8rem'}
                }
            }}>
                <Calendar
                    localizer={localizer}
                    culture="pl"
                    messages={messages}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    views={["month", "week", "day"]}
                    view={view}
                    onView={setView}
                    date={currentDate}
                    onNavigate={setCurrentDate}
                    eventPropGetter={(event) => ({
                        style: {
                            backgroundColor: event.color,
                            color: "white",
                            borderRadius: "4px",
                            padding: "2px 5px",
                            fontSize: "0.8em",
                            border: "none",
                        },
                    })}
                    onSelectEvent={setSelectedEvent}
                    components={{
                          toolbar: props => (
                            <div className="rbc-toolbar">
                              <span className="rbc-btn-group">
                                <button onClick={() => props.onView('month')}>Miesiąc</button>
                                <button onClick={() => props.onView('week')}>Tydzień</button>
                                <button onClick={() => props.onView('day')}>Dzień</button>
                              </span>
                              <span className="rbc-toolbar-label">{props.label}</span>
                              <span className="rbc-btn-group">
                                <button onClick={props.onNavigate.bind(null, 'PREV')}>‹</button>
                                <button onClick={props.onNavigate.bind(null, 'TODAY')}>Dziś</button>
                                <button onClick={props.onNavigate.bind(null, 'NEXT')}>›</button>
                              </span>
                            </div>
                          ),
                        month: {
                            header: ({date}) => (
                                <span>{polishLocale.months[date.getMonth()]} {date.getFullYear()}</span>
                            )
                        },
                        week: {
                            header: ({date}) => (
                                <span>{polishLocale.weekdays[date.getDay()]}, {date.getDate()} {polishLocale.months[date.getMonth()]}</span>
                            )
                        },
                        day: {
                            header: ({date}) => (
                                <span>{polishLocale.weekdays[date.getDay()]}, {date.getDate()} {polishLocale.months[date.getMonth()]} {date.getFullYear()}</span>
                            )
                        }
                    }}
                />
            </Box>

            <Box sx={{
  display: "flex",
  justifyContent: "center",
  gap: 2,
  mb: 3,
  flexWrap: "wrap"
}}>
  <ModernButton
    variant="contained"
    color="primary"
    onClick={() => setIsModalOpen(true)}
  >
    Dodaj wydarzenie
  </ModernButton>

  {/* Nowy przycisk do wczytywania pliku */}
  <input
    accept=".json"
    style={{ display: 'none' }}
    id="contained-button-file"
    type="file"
    onChange={handleFileUpload}
  />
  <label htmlFor="contained-button-file">
    <ModernButton
      variant="outlined"
      color="secondary"
      component="span"
    >
      Wczytaj z pliku
    </ModernButton>
  </label>
</Box>

{fileError && (
  <Typography color="error" variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
    {fileError}
  </Typography>
)}

            <Dialog
                open={!!selectedEvent}
                onClose={() => setSelectedEvent(null)}
                maxWidth="sm"
                fullWidth
            >
                {selectedEvent && (
                    <>
                        <DialogTitle sx={{
                            bgcolor: selectedEvent.color,
                            color: "white",
                            py: 2,
                        }}>
                            {selectedEvent.title}
                        </DialogTitle>
                        <DialogContent sx={{py: 3}}>
                            <Box sx={{display: "flex", flexDirection: "column", gap: 2}}>
                                <DialogContentText>
                                    <strong>Start:</strong> {formatDateTime(selectedEvent.start)}
                                </DialogContentText>
                                <DialogContentText>
                                    <strong>Koniec:</strong> {formatDateTime(selectedEvent.end)}
                                </DialogContentText>
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{px: 3, py: 2}}>
                            <ModernButton
                                onClick={() => setSelectedEvent(null)}
                                variant="contained"
                                color="primary"
                            >
                                Zamknij
                            </ModernButton>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Dodaj nowe wydarzenie</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        label="Nazwa wydarzenia"
                        fullWidth
                        margin="normal"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                        required
                    />

                    <Box sx={{display: 'flex', gap: 2, mt: 2, flexDirection: {xs: 'column', sm: 'row'}}}>
                        <TextField
                            label="Data rozpoczęcia"
                            type="datetime-local"
                            fullWidth
                            margin="normal"
                            InputLabelProps={{shrink: true}}
                            value={newEvent.start}
                            onChange={(e) => setNewEvent({...newEvent, start: e.target.value})}
                            required
                        />
                        <TextField
                            label="Data zakończenia"
                            type="datetime-local"
                            fullWidth
                            margin="normal"
                            InputLabelProps={{shrink: true}}
                            value={newEvent.end}
                            onChange={(e) => setNewEvent({...newEvent, end: e.target.value})}
                            required
                        />
                    </Box>

                    {error && (
                        <Typography color="error" variant="body2" mt={2}>
                            {error}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsModalOpen(false)}>Anuluj</Button>
                    <Button
                        variant="contained"
                        onClick={handleAddEvent}
                        disabled={!newEvent.title || !newEvent.start || !newEvent.end}
                    >
                        Dodaj wydarzenie
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default MyCalendar;