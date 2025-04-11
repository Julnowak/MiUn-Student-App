import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";

import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
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
    setNewEvent({ title: "", start: "", end: "", color: "#3174ad" });
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

const handleLoadSampleEvents = () => {
  setEvents((prev) => [...prev, ...sampleEvents]);
};

  const handleViewChange = (view) => setView(view);
  const handleNavigate = (date) => setCurrentDate(date);

  return (
    <div className="calendar-container">
      <h2 className="calendar-header text-center my-4">Mój kalendarz</h2>

      <div className="text-center mb-3 d-flex justify-content-center gap-2">
        <Button variant="contained" color="primary" onClick={() => setIsModalOpen(true)}>
          Dodaj nowe wydarzenie
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleLoadSampleEvents}>
          Odczyt z pliku
        </Button>
      </div>

      <div className="d-flex justify-content-center gap-2 mb-3">
        <button onClick={() => handleViewChange("day")} className="btn btn-outline-primary">
          Dzień
        </button>
        <button onClick={() => handleViewChange("week")} className="btn btn-outline-primary">
          Tydzień
        </button>
        <button onClick={() => handleViewChange("month")} className="btn btn-outline-primary">
          Miesiąc
        </button>
      </div>
      <Box sx={{ p: 2, maxWidth: "95%", margin: "0 auto" }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "600px", margin: "0 auto", maxWidth: "95%" }}
          views={["month", "week", "day"]}
          view={view}
          onView={handleViewChange}
          date={currentDate}
          onNavigate={handleNavigate}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.color,
              color: "white",
            },
          })}
        />
      </Box>



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
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          />
          <TextField
            label="Data rozpoczęcia"
            type="datetime-local"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={newEvent.start}
            onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
          />
          <TextField
            label="Data zakończenia"
            type="datetime-local"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={newEvent.end}
            onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
          />
          <TextField
            label="Kolor"
            type="color"
            fullWidth
            margin="normal"
            value={newEvent.color}
            onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
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
