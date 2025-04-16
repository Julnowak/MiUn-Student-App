import React, {useState} from "react";
import {Calendar, dateFnsLocalizer} from "react-big-calendar";
import {format, parse, startOfWeek, getDay} from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
    Modal,
    Box,
    TextField,
    Button,
    Typography,
    MenuItem,
    styled, DialogTitle, DialogContent, DialogContentText, Dialog, DialogActions,
} from "@mui/material";
import "./myCalendar.css";

const locales = {
    "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
};


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

    const [view, setView] = useState("month");
    const [currentDate, setCurrentDate] = useState(new Date());

    const handleAddEvent = () => {
        setError("");

        if (!newEvent.title || !newEvent.start || !newEvent.end) {
            setError("Wszystkie pola są wymagane.");
            return;
        }

        const start = new Date(newEvent.start);
        const end = new Date(newEvent.end);

        if (isNaN(start) || isNaN(end)) {
            setError("Nieprawidłowe daty.");
            return;
        }

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

        setEvents((prev) => [...prev, event]);
        setNewEvent({title: "", start: "", end: "", color: "#3174ad"});
        setIsModalOpen(false);
    };

    const sampleEvents = [
        {
            title: "Spotkanie zespołu",
            start: new Date(2025, 3, 10, 10, 0),
            end: new Date(2025, 3, 10, 11, 0),
            color: "#f44336",
        },
        {
            title: "Prezentacja projektu",
            start: new Date(2025, 3, 11, 14, 0),
            end: new Date(2025, 3, 11, 15, 30),
            color: "#4caf50",
        },
        {
            title: "Warsztaty React",
            start: new Date(2025, 3, 12, 9, 30),
            end: new Date(2025, 3, 12, 12, 0),
            color: "#2196f3",
        },
    ];
    const localizer = dateFnsLocalizer({
        format,
        parse,
        startOfWeek,
        getDay,
        locales,
    });

    const modalStyle = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 400,
        bgcolor: "background.paper",
        borderRadius: 4,
        boxShadow: 24,
        p: 4,
    };

    const ModernButton = styled(Button)({
        borderRadius: "20px",
        textTransform: "none",
        fontWeight: 500,
        padding: "8px 20px",
        transition: "all 0.3s ease",
    });
    const handleLoadSampleEvents = () => {
        setEvents((prev) => [...prev, ...sampleEvents]);
    };
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Nowa funkcja do obsługi kliknięcia w wydarzenie
    const handleEventClick = (event) => {
        setSelectedEvent(event);
    };

    // Funkcja do formatowania daty
    const formatDate = (date) => {
        return format(new Date(date), "PPPPpp");
    };

    const handleViewChange = (view) => setView(view);
    const handleNavigate = (date) => setCurrentDate(date);

    return (
        <div className="calendar-container" style={{ margin: 20, paddingBottom: 1500}}>
            <Typography variant="h3" sx={{
                textAlign: "center",
                my: 4,
                fontWeight: 600,
                color: "primary.main",
                letterSpacing: "-0.5px"
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
                    sx={{
                        bgcolor: "primary.main",
                        "&:hover": {bgcolor: "primary.dark"}
                    }}
                >
                    Dodaj nowe wydarzenie
                </ModernButton>
                <ModernButton
                    variant="outlined"
                    color="secondary"
                    onClick={handleLoadSampleEvents}
                >
                    Odczyt z pliku
                </ModernButton>
            </Box>

            <Box sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                mb: 3,
                "& button": {
                    borderRadius: "12px",
                    px: 3,
                    py: 1
                }
            }}>
                <Button
                    variant={view === "day" ? "contained" : "outlined"}
                    onClick={() => handleViewChange("day")}
                >
                    Dzień
                </Button>
                <Button
                    variant={view === "week" ? "contained" : "outlined"}
                    onClick={() => handleViewChange("week")}
                >
                    Tydzień
                </Button>
                <Button
                    variant={view === "month" ? "contained" : "outlined"}
                    onClick={() => handleViewChange("month")}
                >
                    Miesiąc
                </Button>
            </Box>

            <Box sx={{
                p: 2,
                height: "calc(100vh - 240px)",
                width: "95%",
                margin: "0 auto",
                borderRadius: 4,
                bgcolor: "background.paper",
                boxShadow: 3
            }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{height: "100%"}}
                    views={["month", "week", "day"]}
                    view={view}
                    onView={handleViewChange}
                    date={currentDate}
                    onNavigate={handleNavigate}
                    eventPropGetter={(event) => ({
                        style: {
                            backgroundColor: event.color,
                            color: "white",
                            borderRadius: "8px",
                            padding: "2px 8px",
                            fontSize: "0.9em",
                            border: "none",
                            boxShadow: 2
                        },
                    })}
                    onSelectEvent={handleEventClick}
                />
            </Box>

            {/* Dialog z informacjami o wydarzeniu */}
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
                            borderTopLeftRadius: 4,
                            borderTopRightRadius: 4
                        }}>
                            {selectedEvent.title}
                        </DialogTitle>
                        <DialogContent sx={{py: 3}}>
                            <Box sx={{display: "flex", flexDirection: "column", gap: 2}}>
                                <DialogContentText>
                                    <strong>Start:</strong> {formatDate(selectedEvent.start)}
                                </DialogContentText>
                                <DialogContentText>
                                    <strong>Koniec:</strong> {formatDate(selectedEvent.end)}
                                </DialogContentText>
                                <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                                    <Box
                                        sx={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: 1,
                                            bgcolor: selectedEvent.color,
                                            border: "1px solid #ddd"
                                        }}
                                    />
                                    <DialogContentText>
                                        Kolor: {selectedEvent.color}
                                    </DialogContentText>
                                </Box>
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

            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" component="h2" mb={2}>
                        Dodaj nowe wydarzenie
                    </Typography>

                    <TextField
                        label="Tytuł"
                        fullWidth
                        margin="normal"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    />
                    <TextField
                        label="Data rozpoczęcia"
                        type="datetime-local"
                        fullWidth
                        margin="normal"
                        InputLabelProps={{shrink: true}}
                        value={newEvent.start}
                        onChange={(e) => setNewEvent({...newEvent, start: e.target.value})}
                    />
                    <TextField
                        label="Data zakończenia"
                        type="datetime-local"
                        fullWidth
                        margin="normal"
                        InputLabelProps={{shrink: true}}
                        value={newEvent.end}
                        onChange={(e) => setNewEvent({...newEvent, end: e.target.value})}
                    />
                    <TextField
                        label="Kolor"
                        type="color"
                        fullWidth
                        margin="normal"
                        value={newEvent.color}
                        onChange={(e) => setNewEvent({...newEvent, color: e.target.value})}
                    />

                    {error && (
                        <Typography color="error" variant="body2" mt={1}>
                            {error}
                        </Typography>
                    )}

                    <Box mt={3} display="flex" justifyContent="space-between">
                        <Button variant="contained" color="success" onClick={handleAddEvent}>
                            Dodaj
                        </Button>
                        <Button variant="outlined" onClick={() => setIsModalOpen(false)}>
                            Anuluj
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
};

export default MyCalendar;
