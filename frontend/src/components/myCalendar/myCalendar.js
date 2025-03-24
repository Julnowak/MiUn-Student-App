import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./myCalendar.css";

// Localizer using date-fns
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

const MyCalendar = () => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: "", start: "", end: "" });
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [view, setView] = useState("month"); // Default view
  const [currentDate, setCurrentDate] = useState(new Date()); // Store current date

  // Handle adding new event
  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.start || !newEvent.end) {
      alert("Please fill in all fields");
      return;
    }

    const event = {
      title: newEvent.title,
      start: new Date(newEvent.start),
      end: new Date(newEvent.end),
    };

    // Add the event to the events list
    setEvents((prevEvents) => [...prevEvents, event]);

    // Reset event creation form
    setIsAddingEvent(false);
    setNewEvent({ title: "", start: "", end: "" });
  };

  // Handle change in view (Day, Week, Month)
  const handleViewChange = (view) => {
    setView(view);
  };

  // Handle navigation (Previous/Next)
  const handleNavigate = (date) => {
    setCurrentDate(date);
  };

  return (
    <div className="calendar-container">
      <h2 className="calendar-header">Mój kalendarz</h2>

      {isAddingEvent ? (
        <div className="form-container">
          <input
            type="text"
            placeholder="Event Title"
            value={newEvent.title}
            onChange={(e) =>
              setNewEvent({ ...newEvent, title: e.target.value })
            }
            className="input"
          />
          <input
            type="datetime-local"
            value={newEvent.start}
            onChange={(e) =>
              setNewEvent({ ...newEvent, start: e.target.value })
            }
            className="input"
          />
          <input
            type="datetime-local"
            value={newEvent.end}
            onChange={(e) =>
              setNewEvent({ ...newEvent, end: e.target.value })
            }
            className="input"
          />
          <div className="button-container">
            <button onClick={handleAddEvent} className="button">
              Add Event
            </button>
            <button
              onClick={() => setIsAddingEvent(false)}
              className="button-cancel"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsAddingEvent(true)} className="add-button">
          Create New Event
        </button>
      )}

      <div className="calendar-container-inner">
        <div className="toolbar">
          <button
            onClick={() => handleViewChange("day")}
            className="view-button"
          >
            Day
          </button>
          <button
            onClick={() => handleViewChange("week")}
            className="view-button"
          >
            Week
          </button>
          <button
            onClick={() => handleViewChange("month")}
            className="view-button"
          >
            Month
          </button>
        </div>

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "500px" }}
          views={["month", "week", "day"]} // Enable Day, Week, Month views
          view={view} // Set current view
          onView={handleViewChange} // Handle view change
          date={currentDate} // Pass current date to Calendar
          onNavigate={handleNavigate} // Handle navigation (prev/next)
        />
      </div>

      <div>
        <button className="btn btn-dark" style={{margin: 10}}>
          Wczytaj plik...
        </button>
      </div>
    </div>
  );
};

export default MyCalendar;