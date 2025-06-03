import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Badge,
    Container,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    List,
    ListItem,
    ListItemText,
    Divider,
    Box,
    Avatar, Menu, MenuItem
} from '@mui/material';
import {
  Notifications,
  CalendarToday,
  Group,
  ArrowForward,
  Schedule,
  Message,
  Assignment
} from '@mui/icons-material';
import {useNavigate} from "react-router-dom";

const Main = () => {
  const [notifications] = useState([
    { id: 1, text: 'Nowe zadanie w grupie React' },
    { id: 2, text: 'Ocena z projektu została dodana' },
    { id: 3, text: 'Zmiana terminu konsultacji' }
  ]);

  const [userGroups] = useState([
    { id: 1, name: 'Grupa React', lastActivity: 'Nowe zadanie: Komponent Main', members: 15 },
    { id: 2, name: 'Projekt zespołowy', lastActivity: 'Deadline za 3 dni', members: 8 },
    { id: 3, name: 'Seminarum dyplomowe', lastActivity: 'Nowy materiał do przeglądu', members: 12 }
  ]);

  const [calendarEvents] = useState([
    { id: 1, date: '2023-10-15', title: 'Wykład z SI', time: '10:00-11:30' },
    { id: 2, date: '2023-10-16', title: 'Spotkanie projektowe', time: '14:00-15:30' },
    { id: 3, date: '2023-10-17', title: 'Kolokwium z Bazy Danych', time: '09:00-10:30' }
  ]);

  const navigate = useNavigate()

  return (
    <Box sx={{ flexGrow: 1, mb: 3 }}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {/* Sekcja grup */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Group sx={{ mr: 1 }} />
                  <Typography variant="h6">Twoje grupy</Typography>
                </Box>

                <List>
                  {userGroups.slice(0, 3).map((group) => (
                    <ListItem key={group.id}>
                      <ListItemText
                        primary={group.name}
                        secondary={`${group.lastActivity} • ${group.members} członków`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate("/groups")} endIcon={<ArrowForward />}>Zobacz więcej</Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Sekcja kalendarza */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarToday sx={{ mr: 1 }} />
                  <Typography variant="h6">Nadchodzące wydarzenia</Typography>
                </Box>

                <List>
                  {calendarEvents.slice(0, 3).map((event) => (
                    <ListItem key={event.id}>
                      <ListItemText
                        primary={event.title}
                        secondary={`${event.date} • ${event.time}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate("/calendar")} endIcon={<ArrowForward />}>Zobacz więcej</Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Szybki dostęp */}
          <Grid item xs={12}>
            <Card sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button fullWidth variant="contained" startIcon={<Schedule />} sx={{ p: 2 }}>
                    Plan zajęć
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button fullWidth variant="contained" startIcon={<Assignment />} sx={{ p: 2 }}>
                    Oceny
                  </Button>
                </Grid>
              </Grid>
            </Card>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
};

export default Main;