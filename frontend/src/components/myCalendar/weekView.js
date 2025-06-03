import React, {useState, useRef, useEffect} from "react";
import {
    addDays, addWeeks, differenceInMinutes, eachDayOfInterval,
    endOfWeek, format, isAfter, isBefore, isSameDay, isWithinInterval,
    parseISO, startOfWeek, max, min
} from "date-fns";
import {Box, IconButton, Typography, useMediaQuery, useTheme} from "@mui/material";
import {ChevronLeft, ChevronRight} from "@mui/icons-material";
import {pl} from "date-fns/locale";
import {alpha} from "@mui/material/styles";

const HOUR_HEIGHT = 48; // px
const START_HOUR = 0;   // earliest hour shown
const END_HOUR = 24;    // latest hour shown

function expandRecurringEvents(events, rangeStart, rangeEnd) {
    let expanded = [];
    events.forEach(event => {
        if (!event.recurrent) {
            expanded.push(event);
        } else if (event.recurrency_details) {
            let start = parseISO(event.start);
            let end = parseISO(event.end);
            let current = new Date(start);

            while (isBefore(current, rangeEnd)) {
                if (isAfter(current, rangeStart) || isSameDay(current, rangeStart)) {
                    expanded.push({
                        ...event,
                        start: current.toISOString(),
                        end: addDays(current, differenceInMinutes(end, start) / 1440).toISOString()
                    });
                }
                current = addDays(current, 1);
            }
        }
    });
    return expanded;
}

const WeekView = ({events}) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const hoursContainerRef = useRef(null);
    const daysContainerRef = useRef(null);

    const [selectedDate, setSelectedDate] = useState(new Date());

    const onDateChange = (newDate) => {
        setSelectedDate(newDate);
    };

    const startof = startOfWeek(selectedDate, {weekStartsOn: 1});
    const endof = endOfWeek(selectedDate, {weekStartsOn: 1});
    const expandedEvents = expandRecurringEvents(events, startof, endof);

    const days = eachDayOfInterval({start: startof, end: endof});
    const hours = Array.from({length: END_HOUR - START_HOUR}, (_, i) => i + START_HOUR);
    const totalHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT;

    const navigateWeek = (direction) => {
        const newDate = addWeeks(selectedDate, direction);
        onDateChange(newDate);
    };

    // Synchronizacja przewijania godzin i dni
    useEffect(() => {
        const daysContainer = daysContainerRef.current;
        const hoursContainer = hoursContainerRef.current;

        const handleScroll = () => {
            if (daysContainer && hoursContainer) {
                hoursContainer.scrollTop = daysContainer.scrollTop;
            }
        };

        if (daysContainer) {
            daysContainer.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (daysContainer) {
                daysContainer.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden'}}>
            {/* Header with navigation */}
            <Box sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                p: 1, borderBottom: `1px solid ${theme.palette.divider}`
            }}>
                <IconButton onClick={() => navigateWeek(-1)}><ChevronLeft/></IconButton>
                <Typography variant="h6" sx={{textAlign: 'center'}}>
                    {format(startof, 'd MMM yyyy', {locale: pl})} - {format(endof, 'd MMM yyyy', {locale: pl})}
                </Typography>
                <IconButton onClick={() => navigateWeek(1)}><ChevronRight/></IconButton>
            </Box>

            {/* Days header + main content */}
            <Box sx={{display: 'flex', flex: 1, overflow: 'hidden'}}>
                {/* Left column with hours */}
                <Box sx={{
                    width: 60,
                    borderRight: `1px solid ${theme.palette.divider}`,
                    bgcolor: 'background.paper',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Empty space matching days header */}
                    <Box sx={{height: 60, borderBottom: `1px solid ${theme.palette.divider}`}}/>

                    {/* Hours container with scroll sync */}
                    <Box
                        ref={hoursContainerRef}
                        sx={{
                            overflowY: 'auto',
                            flex: 1,
                            '&::-webkit-scrollbar': { display: 'none' } // Hide scrollbar
                        }}
                    >
                        <Box sx={{height: `${totalHeight}px`}}>
                            {hours.map(hour => (
                                <Box key={hour} sx={{
                                    height: HOUR_HEIGHT,
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
                    </Box>
                </Box>

                {/* Right part with days */}
                <Box sx={{display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden'}}>
                    {/* Days header */}
                    <Box sx={{
                        display: 'flex',
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        bgcolor: 'background.paper',
                        height: 60
                    }}>
                        {days.map(day => (
                            <Box
                                key={day.toString()}
                                sx={{
                                    flex: 1,
                                    minWidth: 0,
                                    borderRight: `1px solid ${theme.palette.divider}`,
                                    p: 1,
                                    textAlign: 'center',
                                    bgcolor: isSameDay(day, selectedDate) ? alpha(theme.palette.primary.main, 0.1) : 'inherit',
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                }}
                                onClick={() => onDateChange(day)}
                            >
                                <Typography variant="subtitle2">
                                    {format(day, 'EEE', {locale: pl})}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: isSameDay(day, new Date()) ? 'bold' : 'normal',
                                        color: isSameDay(day, new Date()) ? theme.palette.primary.main : 'inherit'
                                    }}
                                >
                                    {format(day, 'd', {locale: pl})}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Days content with scroll sync */}
                    <Box
                        ref={daysContainerRef}
                        sx={{flex: 1, overflowY: 'auto'}}
                    >
                        <Box sx={{display: 'flex', height: `${totalHeight}px`}}>
                            {days.map(day => {
                                const dayEvents = expandedEvents.filter(event => {
                                    const start = parseISO(event.start);
                                    const end = parseISO(event.end);
                                    return isWithinInterval(day, {start, end});
                                });

                                return (
                                    <Box
                                        key={day.toString()}
                                        sx={{
                                            flex: 1,
                                            minWidth: 0,
                                            borderRight: `1px solid ${theme.palette.divider}`,
                                            position: 'relative',
                                            bgcolor: isSameDay(day, selectedDate) ? alpha(theme.palette.primary.main, 0.05) : 'inherit',
                                            cursor: 'pointer',
                                            userSelect: 'none'
                                        }}
                                        onClick={() => onDateChange(day)}
                                    >
                                        {dayEvents.map((event, idx) => {
                                            const eventStart = parseISO(event.start);
                                            const eventEnd = parseISO(event.end);

                                            // Check if event is all-day
                                            const isAllDayEvent = event.isAllDay ||
                                                (eventStart.getHours() === 0 &&
                                                 eventStart.getMinutes() === 0 &&
                                                 differenceInMinutes(eventEnd, eventStart) >= 1440);

                                            // For all-day events, show at the top
                                            if (isAllDayEvent) {
                                                return (
                                                    <Box
                                                        key={event.id}
                                                        sx={{
                                                            position: 'absolute',
                                                            left: 4,
                                                            right: 4,
                                                            top: 0,
                                                            height: '24px',
                                                            bgcolor: event.color || theme.palette.secondary.main,
                                                            color: 'white',
                                                            borderRadius: 1,
                                                            px: 1,
                                                            py: 0.25,
                                                            fontSize: 12,
                                                            zIndex: 3,
                                                            overflow: 'hidden',
                                                            whiteSpace: 'nowrap',
                                                            textOverflow: 'ellipsis',
                                                            boxShadow: 1,
                                                            cursor: 'pointer',
                                                        }}
                                                        title={`Całodniowe: ${event.name}`}
                                                    >
                                                        <Typography variant="caption" sx={{fontWeight: 'bold'}}>
                                                            {event.name}
                                                        </Typography>
                                                    </Box>
                                                );
                                            }

                                            // For timed events
                                            const dayStart = new Date(day);
                                            dayStart.setHours(START_HOUR, 0, 0, 0);
                                            const dayEnd = new Date(day);
                                            dayEnd.setHours(END_HOUR, 0, 0, 0);

                                            const start = max([eventStart, dayStart]);
                                            const end = min([eventEnd, dayEnd]);

                                            if (isAfter(start, end)) return null;

                                            const startMinutes = ((start.getHours() - START_HOUR) * 60 + start.getMinutes());
                                            const endMinutes = ((end.getHours() - START_HOUR) * 60 + end.getMinutes());
                                            const top = (startMinutes / 60) * HOUR_HEIGHT;
                                            const height = Math.max(((endMinutes - startMinutes) / 60) * HOUR_HEIGHT, 24);

                                            return (
                                                <Box
                                                    key={event.id}
                                                    sx={{
                                                        position: 'absolute',
                                                        left: 4,
                                                        right: 4,
                                                        top: `${top}px`,
                                                        height: `${height}px`,
                                                        bgcolor: event.color || theme.palette.secondary.main,
                                                        color: 'white',
                                                        borderRadius: 1,
                                                        px: 1,
                                                        py: 0.25,
                                                        fontSize: 12,
                                                        zIndex: 3,
                                                        overflow: 'hidden',
                                                        whiteSpace: 'nowrap',
                                                        textOverflow: 'ellipsis',
                                                        boxShadow: 1,
                                                        cursor: 'pointer',
                                                    }}
                                                    title={`${format(eventStart, 'HH:mm')} - ${format(eventEnd, 'HH:mm')}\n${event.name}`}
                                                >
                                                    <Typography variant="caption" sx={{fontWeight: 'bold'}}>
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
                </Box>
            </Box>
        </Box>
    );
};

export default WeekView;