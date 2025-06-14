import React, {useEffect, useState} from "react";
import {
    Box,
    Chip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Pagination,
    TextField,
    Badge,
    IconButton,
    Typography,
    styled, Button
} from "@mui/material";
import {Delete, Mail, CircleNotifications, MessageOutlined} from "@mui/icons-material";
import client from "../../client";
import {API_BASE_URL} from "../../config";
import {useNavigate} from "react-router-dom";

const ModernListItem = styled(ListItem)(({theme, selected}) => ({
    borderRadius: "12px",
    margin: "8px 0",
    transition: "all 0.3s ease",
    boxShadow: selected ? theme.shadows[3] : theme.shadows[1],
    "&:hover": {
        transform: "translateX(4px)",
        boxShadow: theme.shadows[4]
    },
}));

const DetailPanel = styled(Box)(({theme}) => ({
    background: theme.palette.background.paper,
    borderRadius: "16px",
    padding: "24px",
    boxShadow: theme.shadows[2],
    height: "calc(100vh - 260px)",
    position: "sticky",
    top: "20px",
    display: "flex",
    flexDirection: "column"
}));

const OwlIcon = styled('img')(({theme}) => ({
    width: '120px',
    height: 'auto',
    margin: '0 auto',
    opacity: 0.7,
    filter: 'grayscale(30%)',
    [theme.breakpoints.down('sm')]: {
        width: '80px'
    }
}));

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);

    const token = localStorage.getItem("access")
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await client.get(API_BASE_URL + "notifications/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setNotifications(response.data.notifications);
            } catch (error) {
                console.log("Nie udało się zalogować");
            }
        };

        if (token) {
            fetchData();
        }
    }, [token]);

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [perPage] = useState(5);
    const [selectedNotification, setSelectedNotification] = useState(null);

    const markAsRead = async (id) => {
        setNotifications(notifications.map(notification =>
            notification.id === id ? {...notification, isRead: true} : notification
        ));

        try {
            const response = await client.patch(API_BASE_URL + `notifications/${id}/`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (error) {
            console.log("Nie udało się");
        }

    };

    const filteredNotifications = Object.values(notifications).filter((notification) =>
        notification.title?.toLowerCase().includes(search.toLowerCase()) ||
        notification.message?.toLowerCase().includes(search.toLowerCase())
    );

    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);
    const totalPages = Math.ceil(Math.max(filteredNotifications.length, 1) / perPage);
    const navigate = useNavigate()

    const handleDelete = async (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
        if (selectedNotification?.id === id) setSelectedNotification(null);
        try {
            const response = await client.delete(API_BASE_URL + `notifications/${id}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (error) {
            console.log("Nie udało się");
        }
    };

    const handleJoinGroup = async (group, type) => {
        try {
            console.log(group)
            const response = await client.post(API_BASE_URL + `group/${group}`,
                {
                    type: type,
                    notification: selectedNotification
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

            setSelectedNotification(prev => ({
              ...prev,
              isAnswered: true
            }));

        } catch (error) {
            console.error("Błąd pobierania danych:", error);
        }
    };

    return (
        <Box sx={{maxWidth: 1200, margin: "0 auto", p: 3}}>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 4,
                position: 'relative'
            }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: 1,
                    gap: 2
                }}>
                    <CircleNotifications fontSize="large" sx={{color: 'black'}}/>
                    <Typography variant="h4" sx={{color: "text.primary"}}>
                        Powiadomienia
                    </Typography>
                </Box>
            </Box>

            <TextField
                fullWidth
                variant="outlined"
                label="Wyszukaj powiadomienia..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{
                    mb: 4,
                    "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                    }
                }}
            />

            <Box display="flex" gap={4} sx={{flexDirection: {xs: 'column', lg: 'row'}}}>
                {/* Lista powiadomień */}
                <Box sx={{flex: 1, minWidth: {lg: 400}}}>
                    <List>
                        {paginatedNotifications.length > 0 ? (
                            paginatedNotifications.map((notification) => (
                                <ModernListItem
                                    key={notification.id}
                                    selected={selectedNotification?.id === notification.id}
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleDelete(notification.id)}
                                            sx={{color: "error.main"}}
                                        >
                                            <Delete/>
                                        </IconButton>
                                    }
                                    onClick={() => {
                                        if (!notification.isRead) markAsRead(notification.id);
                                        setSelectedNotification(notification);
                                    }}
                                    sx={{
                                        bgcolor: notification.isRead ? 'action.hover' : 'background.paper',
                                        borderLeft: selectedNotification?.id === notification.id ?
                                            "4px solid black" : "none"
                                    }}
                                >
                                    <ListItemIcon sx={{minWidth: "40px"}}>
                                        <Badge
                                            color="primary"
                                            variant="dot"
                                            invisible={notification.isRead}
                                        >
                                            <Mail sx={{color: "black"}}/>
                                        </Badge>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                {notification.title}
                                            </Typography>
                                        }
                                        secondary={<Box>

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden"
                                                }}
                                            >
                                                {notification.message ? notification.message.slice(0, 50) + "..." : "(Wiadomość pusta)"}
                                            </Typography>

                                        </Box>
                                        }
                                    />
                                    <Chip
                                        label={new Date(notification.time_triggered).toLocaleTimeString()?.slice(0, 5) + ", " + new Date(notification.time_triggered).toLocaleDateString()}
                                        size="small"
                                        sx={{
                                            ml: 2,
                                            borderRadius: "8px",
                                            bgcolor: "#000000",
                                            color: "primary.contrastText"
                                        }}
                                    />
                                </ModernListItem>
                            ))
                        ) : (
                            <Typography variant="body1" sx={{p: 2, textAlign: "center"}}>
                                Brak nowych powiadomień
                            </Typography>
                        )}
                    </List>

                    <Box display="flex" justifyContent="center" mt={3}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(e, value) => setPage(value)}
                            shape="rounded"
                            color="black"
                        />
                    </Box>
                </Box>

                {/* Panel szczegółów */}
                <DetailPanel sx={{flex: 1}}>
                    {selectedNotification ? (
                            <>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                <Typography variant="h5" fontWeight="600">
                                    {selectedNotification.title}
                                </Typography>
                                <Chip
                                    label={new Date(selectedNotification.time_triggered).toLocaleTimeString()?.slice(0, 5) + ", " + new Date(selectedNotification.time_triggered).toLocaleDateString()}
                                    color="black"
                                />
                            </Box>
                            <Box>
                            <Typography variant="body1" paragraph sx={{lineHeight: 1.7}}>
                                {selectedNotification.message}
                            </Typography>
                            {selectedNotification.type === "GROUP INVITATION" && !selectedNotification.isAnswered && (
                                <Box sx={{textAlign: "center"}}>
                                    <Button  variant={"outlined"} color={"success"} sx={{m:2}}
                                    onClick={() => handleJoinGroup(selectedNotification.group, "notification")}>
                                        Dołącz
                                    </Button>
                                    <Button variant={"outlined"} color={"error"} sx={{m:2}}
                                    onClick={() => handleJoinGroup(selectedNotification.group, "notification_refused")}>
                                        Odrzuć
                                    </Button>
                                </Box>
                            )}

                                {selectedNotification.type === "GROUP INVITATION" && selectedNotification.isAnswered && (
                                    <Typography sx={{textAlign: "center", color: "gray"}}>
                                        Już przesłano swoją odpowiedź
                                    </Typography>
                                )}
                            </Box>
                        </>
                        ) : (
                        <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        height="100%"
                        textAlign="center"
                        >
                        <Mail fontSize={"large"}/>
                        <Typography variant="h6" color="text.secondary" sx={{mt: 2}}>
                    Wybierz powiadomienie, aby zobaczyć szczegóły
                </Typography>
            </Box>
            )}
        </DetailPanel>
</Box>
</Box>
)
    ;
};

export default Notifications;