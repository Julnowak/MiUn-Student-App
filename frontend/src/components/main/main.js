import React, {useEffect, useState} from 'react';
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
import client from "../../client";
import {API_BASE_URL} from "../../config";

const Main = () => {

    const navigate = useNavigate()

    const [userGroups, setUserGroups] = useState([]);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const token = localStorage.getItem("access");
    const fetchData = async () => {
        try {
            const response = await client.get(API_BASE_URL + "groups/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUserGroups(response.data.myGroups)

             const resp = await client.get(API_BASE_URL + "event/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCalendarEvents(resp.data)
        } catch (error) {
            console.error("Błąd pobierania danych:", error);
        }
    };

    useEffect(() => {

        if (userGroups?.length < 1) {
            fetchData();
        }

    }, [fetchData, userGroups]);

    return (
        <Box sx={{flexGrow: 1, mb: 3}}>
            <Container maxWidth="lg" sx={{mt: 4}}>
                <Grid container spacing={3}>
                    {/* Sekcja grup */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                    <Group sx={{mr: 1}}/>
                                    <Typography variant="h6">Twoje grupy</Typography>
                                </Box>

                                <List>
                                    {userGroups.slice(0, 3).map((group) => (
                                        <ListItem key={group.id}>
                                            <ListItemText
                                                primary={group.name}
                                                secondary={`${Math.floor(Math.random() * 10)} nowych wiadomości • ${group.members.length} członków`}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                            <CardActions>
                                <Button size="small" onClick={() => navigate("/groups")} endIcon={<ArrowForward/>}>Zobacz
                                    więcej</Button>
                            </CardActions>
                        </Card>
                    </Grid>

                    {/* Sekcja kalendarza */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                    <CalendarToday sx={{mr: 1}}/>
                                    <Typography variant="h6">Nadchodzące wydarzenia</Typography>
                                </Box>

                                <List>
                                    {calendarEvents.slice(0, 3).map((event) => (
                                        <ListItem key={event.id}>
                                            <ListItemText
                                                primary={event.name}
                                                secondary={`${new Date(event.start).toLocaleDateString()}, ${new Date(event.start).toLocaleTimeString()} • ${new Date(event.end).toLocaleDateString()} , ${new Date(event.end).toLocaleTimeString() }`}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                            <CardActions>
                                <Button size="small" onClick={() => navigate("/calendar")} endIcon={<ArrowForward/>}>Zobacz
                                    więcej</Button>
                            </CardActions>
                        </Card>
                    </Grid>

                    {/* Szybki dostęp */}
                    <Grid item xs={12}>
                        <Card sx={{p: 2}}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Button fullWidth onClick={() => navigate("/schedule")} variant="contained" startIcon={<Schedule/>} sx={{p: 2}}>
                                        Plan zajęć
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Button fullWidth variant="contained" onClick={() => navigate("/grades")}
                                            startIcon={<Assignment/>} sx={{p: 2}}>
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