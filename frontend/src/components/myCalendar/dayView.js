// Modernistyczny widok dzienny z dialogiem szczegółów wydarzenia

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  IconButton
} from '@mui/material';
import { format, isSameDay } from 'date-fns';
import CloseIcon from '@mui/icons-material/Close';

const hourHeight = 60;
const dayStartHour = 0;
const dayEndHour = 24;

const DayView = ({ events, date }) => {
  const hours = Array.from({ length: dayEndHour - dayStartHour }, (_, i) => i);

  const [selectedEvent, setSelectedEvent] = useState(null);

  const getTopPosition = (time) => {
    const minutesFromStart = time.getHours() * 60 + time.getMinutes();
    return (minutesFromStart / 60) * hourHeight;
  };

  const getHeight = (start, end) => {
    const diffInMinutes = (end - start) / 60000;
    return (diffInMinutes / 60) * hourHeight;
  };

  const today = new Date();
  const nowPosition = getTopPosition(today);

  const mockEvents = [
    {
      id: 1,
      name: 'Spotkanie zespołu',
      start: new Date().setHours(9, 0, 0, 0),
      end: new Date().setHours(10, 30, 0, 0),
      color: '#1976d2',
      additional_info: 'Omawiamy sprint.'
    },
    {
      id: 2,
      name: 'Lunch z klientem',
      start: new Date().setHours(12, 0, 0, 0),
      end: new Date().setHours(13, 0, 0, 0),
      color: '#388e3c',
      additional_info: 'Restauracja XYZ'
    },
    {
      id: 3,
      name: 'Prezentacja projektu',
      start: new Date().setHours(15, 15, 0, 0),
      end: new Date().setHours(16, 0, 0, 0),
      color: '#f57c00',
      additional_info: 'Sala konferencyjna B'
    }
  ];

  return (
    <Box p={2}>
      <Typography variant="h5" mb={3}>{format(date, 'EEEE, d MMMM yyyy')}</Typography>
      <Box display="flex" height="1440px" maxHeight="80vh" overflow="auto" borderRadius={2} boxShadow={3}>
        {/* Kolumna godzin */}
        <Box width={70} bgcolor="#f0f0f0" px={1} py={0.5}>
          {hours.map(hour => (
            <Box
              key={hour}
              height={hourHeight}
              borderBottom="1px solid #e0e0e0"
              fontSize={13}
              display="flex"
              alignItems="flex-start"
              pt={0.5}
              color="#555"
            >
              {hour.toString().padStart(2, '0')}:00
            </Box>
          ))}
        </Box>

        {/* Kolumna wydarzeń */}
        <Box flex={1} position="relative" bgcolor="#fff" height={hourHeight * (dayEndHour - dayStartHour)}>
          {mockEvents.map(event => {
            const start = new Date(event.start);
            const end = new Date(event.end);
            if (!isSameDay(start, date)) return null;

            const top = getTopPosition(start);
            const height = Math.max(getHeight(start, end), 20);

            return (
              <Box
                key={event.id}
                position="absolute"
                top={top}
                left={12}
                right={12}
                height={height}
                bgcolor={event.color || '#2196f3'}
                color="#fff"
                borderRadius={2}
                boxShadow={4}
                px={2}
                py={1}
                fontSize={13}
                sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { opacity: 0.9 } }}
                onClick={() => setSelectedEvent(event)}
              >
                <strong>{event.name}</strong><br />
                {format(start, 'HH:mm')} - {format(end, 'HH:mm')}
              </Box>
            );
          })}

          {/* Czerwona linia czasu */}
          {isSameDay(today, date) && (
            <Box position="absolute" top={nowPosition} left={0} right={0} height={2} bgcolor="red" zIndex={10}>
              <Box width={10} height={10} bgcolor="red" borderRadius="50%" position="absolute" left={-5} top={-4} />
            </Box>
          )}
        </Box>
      </Box>

      {/* Dialog wydarzenia */}
      {selectedEvent && (
        <Dialog open={true} onClose={() => setSelectedEvent(null)}>
          <DialogTitle>
            {selectedEvent.name}
            <IconButton
              aria-label="close"
              onClick={() => setSelectedEvent(null)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <DialogContentText>
              Godzina: {format(new Date(selectedEvent.start), 'HH:mm')} - {format(new Date(selectedEvent.end), 'HH:mm')}<br/>
              <br/>
              Informacje dodatkowe:<br/>
              {selectedEvent.additional_info || 'Brak'}
            </DialogContentText>
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};

export default DayView;
