import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {
    Box,
    Typography,
    Chip,
    Avatar,
    Button,
    Card,
    CardContent,
    IconButton,
    Divider,
    useMediaQuery,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
    Badge,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Switch,
    TextField,
    InputAdornment, FormControlLabel, Link, Checkbox
} from '@mui/material';
import {
    People,
    Lock,
    Public,
    Verified,
    Settings,
    PersonRemove,
    Search,
    Notifications,
    NotificationsOff,
    Share,
    GroupAdd,
    AdminPanelSettings,
    Event,
    Poll, Edit, Check, Add
} from '@mui/icons-material';
import {useTheme} from '@mui/material/styles';
import client from "../../client";
import {API_BASE_URL} from "../../config";
import AddIcon from "@mui/icons-material/Add";


const GroupPage = () => {
    const params = useParams();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [group, setGroup] = useState(null);
    const [numActive, setNumActive] = useState(0);
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTab, setActiveTab] = useState('discussions');
    const [showMemberList, setShowMemberList] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const token = localStorage.getItem("access");

    const [isEditing, setIsEditing] = useState(false);
    const [editedRules, setEditedRules] = useState("");
    const [showPollDialog, setShowPollDialog] = useState(false);
    const [pollType, setPollType] = useState('local');
    const [newPollQuestion, setNewPollQuestion] = useState('');
    const [newPollOptions, setNewPollOptions] = useState('');
    const [formsLink, setFormsLink] = useState('');
    const [polls, setPolls] = useState([]); // Przechowuje wszystkie ankiety



    // Funkcja do zapisywania zmian
    const handleSaveRules = async () => {
        try {
            // Tutaj dodaj kod do zapisu zasad na backendzie
            // np. await updateGroupRules(group.id, editedRules);
            setIsEditing(false);
            // Możesz też zaktualizować group.rules w stanie rodzicielskim
        } catch (error) {
            console.error("Błąd podczas zapisywania zasad:", error);
        }
    };

    useEffect(() => {
        const fetchGroupData = async () => {
            try {
                const response = await client.get(API_BASE_URL + `group/${params.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setGroup(response.data.group_data);
                // setGroup(mockGroup);
                setCurrentUser(response.data.user_data);
                setNumActive(response.data.user_active);
                setEditedRules(response.data.group_data.rules)
                console.log(response.data)
            } catch (error) {
                console.log("Nie udało się pobrać lokalizacji");
            }
        };

        if (!group) {
            fetchGroupData();
        }
    }, [token]);


    if (!group || !currentUser) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', pt: 4}}>
                <Typography>Ładowanie grupy...</Typography>
            </Box>
        );
    }


    const isAdmin = currentUser.id === group.admin.id;
    const isModerator = group.moderators?.some(m => m.id === currentUser.id);
    const isMember = group.members.some(m => m.id === currentUser.id);
    const isEditable = true; // Tutaj należy dodać logikę sprawdzającą uprawnienia użytkownika


    const handleAddPoll = () => {
        const newPoll = pollType === 'local'
            ? {
                id: Date.now(),
                type: 'local',
                question: newPollQuestion,
                options: newPollOptions.split(',').map(opt => opt.trim()),
                votes: {},
                createdAt: new Date().toISOString()
            }
            : {
                id: Date.now(),
                type: 'external',
                provider: 'microsoft-forms',
                url: formsLink,
                createdAt: new Date().toISOString()
            };

        setPolls([...polls, newPoll]);
        setShowPollDialog(false);
        setNewPollQuestion('');
        setNewPollOptions('');
        setFormsLink('');
    };

    const PollItem = ({poll}) => {
        if (poll.type === 'external') {
            return (
                <ListItem sx={{mb: 2}}>
                    <ListItemText
                        primary={<Typography
                            fontWeight="bold">{poll.provider === 'microsoft-forms' ? 'Microsoft Forms' : 'Ankieta zewnętrzna'}</Typography>}
                        secondary={
                            <Link href={poll.url} target="_blank" rel="noopener">
                                Przejdź do ankiety
                            </Link>
                        }
                    />
                </ListItem>
            );
        }

        return (
            <ListItem sx={{mb: 2}}>
                <ListItemText
                    primary={<Typography fontWeight="bold">{poll.question}</Typography>}
                    secondary={
                        <Box>
                            {poll.options.map((option, index) => (
                                <Box key={index} display="flex" alignItems="center" mb={1}>
                                    <Checkbox size="small"/>
                                    <Typography>{option}</Typography>
                                </Box>
                            ))}
                        </Box>
                    }
                />
            </ListItem>
        );
    };

    // Funkcje administracyjne
    const handleUpdateGroupSettings = (newSettings) => {
        setGroup(prev => ({...prev, ...newSettings}));
        setShowSettings(false);
    };

    const handleToggleArchive = () => {
        setGroup(prev => ({...prev, isArchived: !prev.isArchived}));
    };

    const handleAddMember = (userId) => {
        // W rzeczywistej aplikacji - wywołanie API
        console.log('Dodano członka:', userId);
    };

    const handleRemoveMember = (userId) => {
        // W rzeczywistej aplikacji - wywołanie API
        console.log('Usunięto członka:', userId);
    };

    // Widok admina/moderatora
    if (isAdmin || isModerator) {
        return (
            <Box>
                {/* Nagłówek grupy */}
                <Box sx={{position: 'relative', mb: 5}}>
                    <Box
                        sx={{
                            height: 200,
                            backgroundImage: `url(${group.coverImage?.toString().slice(15)})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            [theme.breakpoints.up('md')]: {
                                height: 300
                            }
                        }}
                    />

                    <Box sx={{
                        position: 'absolute',
                        bottom: -40,
                        left: 16,
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: 2
                    }}>
                        <Avatar sx={{
                            width: 80,
                            height: 80,
                            fontSize: 32,
                            border: '3px solid white',
                            bgcolor: theme.palette.primary.main
                        }}
                                src={group.avatar?.toString().slice(15)}
                        />

                        <Box sx={{mb: 1}}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                <Typography variant="h4" sx={{color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.8)'}}>
                                    {group.name}
                                </Typography>
                                {group.isOfficial && (
                                    <Tooltip title="Oficjalna grupa">
                                        <Verified color="primary" fontSize="large"/>
                                    </Tooltip>
                                )}
                            </Box>

                            <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1}}>
                                <Chip
                                    icon={<People/>}
                                    label={`${group.members.length} członków`}
                                    size="small"
                                    sx={{backgroundColor: 'rgba(255,255,255,0.9)'}}
                                />
                                <Chip
                                    icon={group.isPublic ? <Public/> : <Lock/>}
                                    label={group.isPublic ? 'Publiczna' : 'Prywatna'}
                                    size="small"
                                    sx={{backgroundColor: 'rgba(255,255,255,0.9)'}}
                                />
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        display: 'flex',
                        gap: 1
                    }}>
                        <Tooltip title="Ustawienia grupy">
                            <IconButton
                                onClick={() => setShowSettings(true)}
                                sx={{backgroundColor: 'rgba(255,255,255,0.8)'}}
                            >
                                <Settings/>
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Zarządzaj członkami">
                            <IconButton
                                onClick={() => setShowMemberList(true)}
                                sx={{backgroundColor: 'rgba(255,255,255,0.8)'}}
                            >
                                <People/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* Główne kontent */}
                <Box sx={{
                    maxWidth: 1200,
                    mx: 'auto',
                    px: 2,
                    [theme.breakpoints.up('md')]: {
                        display: 'flex',
                        gap: 3
                    }
                }}>
                    {/* Lewa kolumna */}
                    <Box sx={{
                        width: '100%',
                        [theme.breakpoints.up('md')]: {
                            width: '70%'
                        }
                    }}>
                        {/* Pasek zakładek */}
                        <Box sx={{
                            borderBottom: 1,
                            borderColor: 'divider',
                            position: 'sticky',
                            top: 0,
                            zIndex: 10,
                            backgroundColor: theme.palette.background.default,
                            pt: 6
                        }}>
                            <Tabs
                                value={activeTab}
                                onChange={(e, newValue) => setActiveTab(newValue)}
                                variant="scrollable"
                                scrollButtons="auto"
                            >
                                <Tab label="Dyskusje" value="discussions"/>
                                <Tab label="Wydarzenia" value="events"/>
                                <Tab label="Ankiety" value="polls"/>
                                <Tab label="Media" value="media"/>
                                <Tab label="Zasady" value="rules"/>
                            </Tabs>
                        </Box>

                        {/* Treść zakładek */}
                        <Box sx={{pt: 3}}>
                            {activeTab === 'discussions' && (
                                <Card sx={{mb: 3}}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Najnowsze dyskusje
                                        </Typography>
                                        <Typography color="textSecondary">
                                            Tutaj pojawią się wątki dyskusyjne
                                        </Typography>
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === 'polls' && (
                                <Box>
                                    <Card sx={{mb: 3}}>
                                        <CardContent>
                                            <Box display="flex" justifyContent="space-between" alignItems="center"
                                                 mb={2}>
                                                <Typography variant="h6" gutterBottom>
                                                    Najnowsze ankiety
                                                </Typography>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    startIcon={<Add/>}
                                                    onClick={() => setShowPollDialog(true)}
                                                >
                                                    Dodaj ankietę
                                                </Button>
                                            </Box>

                                            {polls.length === 0 ? (
                                                <Typography color="textSecondary">
                                                    Brak ankiet. Dodaj pierwszą ankietę!
                                                </Typography>
                                            ) : (
                                                <List>
                                                    {polls.map((poll) => (
                                                        <PollItem key={poll.id} poll={poll}/>
                                                    ))}
                                                </List>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Dialog do dodawania nowej ankiety */}
                                    <Dialog open={showPollDialog} onClose={() => setShowPollDialog(false)}>
                                        <DialogTitle>Dodaj nową ankietę</DialogTitle>
                                        <DialogContent>
                                            <Tabs value={pollType} onChange={(e, newValue) => setPollType(newValue)}>
                                                <Tab label="Lokalna ankieta" value="local"/>
                                                <Tab label="Microsoft Forms" value="forms"/>
                                            </Tabs>

                                            <Box mt={2}>
                                                {pollType === 'local' ? (
                                                    <Box>
                                                        <TextField
                                                            fullWidth
                                                            label="Pytanie"
                                                            variant="outlined"
                                                            value={newPollQuestion}
                                                            onChange={(e) => setNewPollQuestion(e.target.value)}
                                                            sx={{mb: 2}}
                                                        />
                                                        <TextField
                                                            fullWidth
                                                            label="Opcje (oddzielone przecinkami)"
                                                            variant="outlined"
                                                            value={newPollOptions}
                                                            onChange={(e) => setNewPollOptions(e.target.value)}
                                                            placeholder="Opcja 1, Opcja 2, Opcja 3"
                                                        />
                                                    </Box>
                                                ) : (
                                                    <TextField
                                                        fullWidth
                                                        label="Link do Microsoft Forms"
                                                        variant="outlined"
                                                        value={formsLink}
                                                        onChange={(e) => setFormsLink(e.target.value)}
                                                        placeholder="https://forms.office.com/..."
                                                    />
                                                )}
                                            </Box>
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={() => setShowPollDialog(false)}>Anuluj</Button>
                                            <Button
                                                onClick={handleAddPoll}
                                                color="primary"
                                                variant="contained"
                                                disabled={pollType === 'local' ? !newPollQuestion || !newPollOptions : !formsLink}
                                            >
                                                Dodaj
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </Box>
                            )}

                            {activeTab === 'rules' && (
                                <Card>
                                    <CardContent sx={{textAlign: "left"}}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography variant="h6" gutterBottom component="div">
                                                Zasady grupy
                                            </Typography>
                                            {isEditable && (
                                                <Button
                                                    size="small"
                                                    onClick={() => setIsEditing(!isEditing)}
                                                    startIcon={isEditing ? <Check/> : <Edit/>}
                                                >
                                                    {isEditing ? "Zapisz" : "Edytuj"}
                                                </Button>
                                            )}
                                        </Box>

                                        {isEditing ? (
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={6}
                                                variant="outlined"
                                                value={editedRules}
                                                onChange={(e) => setEditedRules(e.target.value)}
                                                sx={{marginTop: 2}}
                                            />
                                        ) : (
                                            <Typography component="div" whiteSpace="pre-line">
                                                {group?.rules || "Brak zasad grupy"}
                                            </Typography>
                                        )}


                                    </CardContent>
                                </Card>
                            )}
                        </Box>
                    </Box>

                    {/* Prawa kolumna */}
                    <Box sx={{
                        width: '100%',
                        [theme.breakpoints.up('md')]: {
                            width: '30%',
                            position: 'sticky',
                            top: 80,
                            alignSelf: 'flex-start'
                        }
                    }}>
                        {/* Informacje o grupie */}
                        <Card sx={{mb: 2}}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Informacje
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    {group.description}
                                </Typography>

                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
                                    <Public fontSize="small" color="action"/>
                                    <Typography variant="body2">
                                        {group.isPublic ? 'Grupa publiczna' : 'Grupa prywatna'}
                                    </Typography>
                                </Box>

                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
                                    <Event fontSize="small" color="action"/>
                                    <Typography variant="body2">
                                        Założona {new Date(group.date_created).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Administratorzy */}
                        <Card sx={{mb: 2}}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Administratorzy
                                </Typography>
                                <List dense>
                                    <ListItem>
                                        <ListItemAvatar>
                                            <Avatar src={group.admin.profile_picture?.toString().slice(15)}/>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={group.admin.username}
                                            secondary="Założyciel grupy"
                                            secondaryTypographyProps={{sx: {display: 'flex', alignItems: 'center'}}}
                                        />
                                        <AdminPanelSettings color="black"/>
                                    </ListItem>

                                    {group.moderators?.map(mod => (
                                        <ListItem key={mod.id}>
                                            <ListItemAvatar>
                                                <Avatar>{mod.profile_picture?.toString().slice(15)}</Avatar>
                                            </ListItemAvatar>
                                            <ListItemText primary={mod.username} secondary="Moderator"/>
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>

                        {/* Ostatnia aktywność */}
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Ostatnia aktywność
                                </Typography>
                                <List dense>
                                    {group.recentActivity.length > 0 ? group.recentActivity.map(activity => (
                                            <ListItem key={activity.id}>
                                                <ListItemAvatar>
                                                    <Avatar sx={{bgcolor: theme.palette.primary.main}}>
                                                        {activity.type === 'event' ? <Event/> : <Poll/>}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={activity.title}
                                                    secondary={`${activity.author.name}, ${new Date(activity.date).toLocaleDateString()}`}
                                                />
                                            </ListItem>
                                        )) :
                                        <Typography color={"gray"}>
                                            Brak ostatnich wydarzeń
                                        </Typography>}
                                </List>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>

                {/* Dialog ustawień grupy */}
                <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Ustawienia grupy</DialogTitle>
                    <DialogContent dividers>
                        <Box sx={{mb: 3}}>
                            <Typography variant="subtitle1" gutterBottom>
                                Podstawowe informacje
                            </Typography>
                            <TextField
                                fullWidth
                                label="Nazwa grupy"
                                value={group.name}
                                onChange={(e) => setGroup({...group, name: e.target.value})}
                                sx={{mb: 2}}
                            />
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Opis"
                                value={group.description}
                                onChange={(e) => setGroup({...group, description: e.target.value})}
                            />
                        </Box>

                        <Box sx={{mb: 3}}>
                            <Typography variant="subtitle1" gutterBottom>
                                Dostęp
                            </Typography>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={group.isPublic}
                                        onChange={(e) => setGroup({...group, isPublic: e.target.checked})}
                                    />
                                }
                                label="Grupa publiczna"
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={group.isArchived}
                                        onChange={handleToggleArchive}
                                    />
                                }
                                label="Archiwizuj grupę"
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowSettings(false)}>Anuluj</Button>
                        <Button
                            variant="contained"
                            onClick={() => handleUpdateGroupSettings(group)}
                        >
                            Zapisz zmiany
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog członków */}
                <Dialog open={showMemberList} onClose={() => setShowMemberList(false)} maxWidth="md" fullWidth>
                    <DialogTitle>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                            <People/>
                            Członkowie grupy ({group.members.length})
                            <TextField
                                size="small"
                                placeholder="Szukaj członków..."
                                sx={{ml: 'auto', width: 250}}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search/>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Box>
                    </DialogTitle>
                    <DialogContent dividers>
                        <List sx={{maxHeight: 400, overflow: 'auto'}}>
                            {group.members.map(member => (
                                <ListItem
                                    key={member.id}
                                    secondaryAction={
                                        member.id !== group.admin.id && (
                                            <IconButton
                                                edge="end"
                                                onClick={() => handleRemoveMember(member.id)}
                                                color="error"
                                            >
                                                <PersonRemove/>
                                            </IconButton>
                                        )
                                    }
                                >
                                    <ListItemAvatar>
                                        <Badge
                                            overlap="circular"
                                            anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                                            variant="dot"
                                            color="success"
                                            invisible={!member.isOnline}
                                        >
                                            <Avatar>{member.avatar}</Avatar>
                                        </Badge>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={member.name}
                                        secondary={`Dołączył ${new Date(member.joinedAt).toLocaleDateString()}`}
                                    />
                                    {member.id === group.admin.id && (
                                        <Chip label="Admin" size="small" color="primary" sx={{ml: 2}}/>
                                    )}
                                </ListItem>
                            ))}
                        </List>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            startIcon={<GroupAdd/>}
                            onClick={() => handleAddMember(123)} // W rzeczywistej aplikacji - wybór użytkownika
                        >
                            Dodaj członka
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        );
    }

    // Widok dla zwykłego członka
    return (
        <Box sx={{pb: 4}}>
            {/* Nagłówek grupy */}
            <Box sx={{position: 'relative', mb: 2}}>
                <Box
                    sx={{
                        height: 200,
                        backgroundImage: `${group.coverImage?.toString().slice(15)}`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        [theme.breakpoints.up('md')]: {
                            height: 300
                        }
                    }}
                />

                <Box sx={{
                    position: 'absolute',
                    bottom: -40,
                    left: 16,
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 2
                }}>
                    <Avatar sx={{
                        width: 80,
                        height: 80,
                        fontSize: 32,
                        border: '3px solid white',
                        bgcolor: theme.palette.primary.main
                    }}>
                        {group.avatar?.toString().slice(20)}
                    </Avatar>


                    <Box sx={{mb: 1}}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <Typography variant="h4" sx={{color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.8)'}}>
                                {group.name}
                            </Typography>
                            {group.isOfficial && (
                                <Tooltip title="Oficjalna grupa">
                                    <Verified color="primary" fontSize="large"/>
                                </Tooltip>
                            )}
                        </Box>

                        <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1}}>
                            <Chip
                                icon={<People/>}
                                label={`${group.memberCount} członków`}
                                size="small"
                                sx={{backgroundColor: 'rgba(255,255,255,0.9)'}}
                            />
                            <Chip
                                icon={group.isPublic ? <Public/> : <Lock/>}
                                label={group.isPublic ? 'Publiczna' : 'Prywatna'}
                                size="small"
                                sx={{backgroundColor: 'rgba(255,255,255,0.9)'}}
                            />
                        </Box>
                    </Box>
                </Box>

                <Box sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    display: 'flex',
                    gap: 1
                }}>
                    <Tooltip title={notificationsEnabled ? "Wyłącz powiadomienia" : "Włącz powiadomienia"}>
                        <IconButton
                            onClick={() => setShowNotificationsDialog(true)}
                            sx={{backgroundColor: 'rgba(255,255,255,0.8)'}}
                        >
                            {notificationsEnabled ? <Notifications/> : <NotificationsOff/>}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Udostępnij grupę">
                        <IconButton
                            sx={{backgroundColor: 'rgba(255,255,255,0.8)'}}
                        >
                            <Share/>
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Główne kontent */}
            <Box sx={{
                maxWidth: 1200,
                mx: 'auto',
                px: 2,
                [theme.breakpoints.up('md')]: {
                    display: 'flex',
                    gap: 3
                }
            }}>
                {/* Lewa kolumna */}
                <Box sx={{
                    width: '100%',
                    [theme.breakpoints.up('md')]: {
                        width: '70%'
                    }
                }}>
                    {/* Pasek zakładek */}
                    <Box sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        backgroundColor: theme.palette.background.default,
                        pt: 6
                    }}>
                        <Tabs
                            value={activeTab}
                            onChange={(e, newValue) => setActiveTab(newValue)}
                            variant="scrollable"
                            scrollButtons="auto"
                        >
                            <Tab label="Dyskusje" value="discussions"/>
                            <Tab label="Wydarzenia" value="events"/>
                            <Tab label="Ankiety" value="polls"/>
                            <Tab label="Media" value="media"/>
                            <Tab label="Zasady" value="rules"/>
                        </Tabs>
                    </Box>

                    {/* Treść zakładek */}
                    <Box sx={{pt: 3}}>
                        {activeTab === 'discussions' && (
                            <Card sx={{mb: 3}}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Najnowsze dyskusje
                                    </Typography>

                                    <Typography color="textSecondary">
                                        Tutaj pojawią się wątki dyskusyjne
                                    </Typography>
                                </CardContent>
                            </Card>
                        )}
                    </Box>
                </Box>

                {/* Prawa kolumna */}
                <Box sx={{
                    width: '100%',
                    [theme.breakpoints.up('md')]: {
                        width: '30%',
                        position: 'sticky',
                        top: 80,
                        alignSelf: 'flex-start'
                    }
                }}>
                    {/* Informacje o grupie */}
                    <Card sx={{mb: 2}}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Informacje
                            </Typography>
                            <Typography variant="body2" paragraph>
                                {group.description}
                            </Typography>

                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
                                <Public fontSize="small" color="action"/>
                                <Typography variant="body2">
                                    {group.isPublic ? 'Grupa publiczna' : 'Grupa prywatna'}
                                </Typography>
                            </Box>

                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
                                <Event fontSize="small" color="action"/>
                                <Typography variant="body2">
                                    Założona {new Date(group.date_created).toLocaleDateString()}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Administratorzy */}
                    <Card sx={{mb: 2}}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Administratorzy
                            </Typography>
                            <List dense>
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar>{group.admin.avatar}</Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={group.admin.name}
                                        secondary="Założyciel grupy"
                                    />
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>

                    {/* Ostatnia aktywność */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Ostatnia aktywność
                            </Typography>
                            <List dense>
                                {group.recentActivity.slice(0, 3).map(activity => (
                                    <ListItem key={activity.id}>
                                        <ListItemAvatar>
                                            <Avatar sx={{bgcolor: theme.palette.primary.main}}>
                                                {activity.type === 'event' ? <Event/> : <Poll/>}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={activity.title}
                                            secondary={`${new Date(activity.date).toLocaleDateString()}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {/* Dialog powiadomień */}
            <Dialog open={showNotificationsDialog} onClose={() => setShowNotificationsDialog(false)}>
                <DialogTitle>Ustawienia powiadomień</DialogTitle>
                <DialogContent>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={notificationsEnabled}
                                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                            />
                        }
                        label="Powiadomienia o nowych postach"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowNotificationsDialog(false)}>Zamknij</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default GroupPage;