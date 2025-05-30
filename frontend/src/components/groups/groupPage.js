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
    Poll, Edit, Check, Add, ThumbUpAlt, ThumbDownAlt, Comment, Delete, Group, CloudUpload, PhotoCamera, Close
} from '@mui/icons-material';
import {useTheme} from '@mui/material/styles';
import client from "../../client";
import {API_BASE_URL} from "../../config";
import AddIcon from "@mui/icons-material/Add";
import MediaTab from "./mediaTab";
import {textAlign} from "@mui/system";


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
    const [posts, setPosts] = useState([]);
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');

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


    if (!group) {
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
    const handleUpdateGroupSettings = async (newSettings) => {
        const formData = new FormData();

        // Append all non-file fields
        formData.append('code', newSettings.code);
        formData.append('name', newSettings.name);
        formData.append('isPublic', newSettings.isPublic ? 'true' : 'false');
        formData.append('isArchived', newSettings.isArchived ? 'true' : 'false');
        formData.append('description', newSettings.description);
        formData.append('limit', newSettings.limit);

        // Append files only if they exist and are File objects
        if (newSettings.avatar instanceof File) {
            formData.append('avatar', newSettings.avatar);
        }

        if (newSettings.coverImage instanceof File) {
            formData.append('coverImage', newSettings.coverImage);
        }
        await client.put(`/group/${group.id}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            }
        });
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

    const handleDeleteComment = (commentId) => {
        // W rzeczywistej aplikacji - wywołanie API
        console.log('Usunięto członka:');
    };

    const handleEditComment = (commentId) => {
        // W rzeczywistej aplikacji - wywołanie API
        console.log('Usunięto członka:');
    };

    const handleDeletePost = (postId) => {
        // W rzeczywistej aplikacji - wywołanie API
        console.log('Usunięto członka:');
    };

    const handleEditPost = (postId) => {
        // W rzeczywistej aplikacji - wywołanie API
        console.log('Usunięto członka:');
    };

    // Funkcje
    const fetchPosts = async () => {
        try {
            const response = await client.get('/api/posts/');
            setPosts(response.data.map(post => ({
                ...post,
                showComments: false,
                newComment: '',
                user_like: post.likes.find(l => l.user.id === currentUser.id)?.value ?? null
            })));
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const handleAddPost = async () => {
        try {
            const response = await client.post('/api/posts/', {
                title: newPostTitle,
                content: newPostContent,
                user: currentUser.id,
                group: group.id // Musisz mieć tę zmienną
            });
            setPosts([response.data, ...posts]);
            setNewPostTitle('');
            setNewPostContent('');
        } catch (error) {
            console.error('Error adding post:', error);
        }
    };

    const toggleComments = (postId) => {
        setPosts(posts.map(post =>
            post.id === postId
                ? {...post, showComments: !post.showComments}
                : post
        ));
    };

    const handlePostLike = async (postId, value) => {
        try {
            await client.post('/api/posts/like/', {
                post_id: postId,
                value: value
            });
            fetchPosts(); // Odśwież posty
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleCommentChange = async (commentId) => {
        return false
    };

    const handleCommentLike = async (commentId) => {
        return false
    };

    const handleAddComment = async => {
        return false
    };


    const handleRulesEdit = async () => {
        if (isEditing) {
            await client.put(`/group/${group.id}`, {
                rules: editedRules
            });
        }
        setIsEditing(!isEditing)
    };


    // Widok admina/moderatora
    if (isAdmin) {
        return (
            <Box>
                {/* Nagłówek grupy */}
                <Box sx={{position: 'relative', mb: 5}}>
                    <Box
                        sx={{
                            height: 200,
                            backgroundImage: `url(${group.coverImage?.toString().slice(15) || URL.createObjectURL(group.coverImage)})`,
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
                        gap: 2,
                    }}>
                        <Avatar sx={{
                            width: 80,
                            height: 80,
                            fontSize: 32,
                            border: '3px solid white',
                            bgcolor: theme.palette.primary.main
                        }}
                                src={group.avatar?.toString().slice(15) || URL.createObjectURL(group.avatar)}
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
                                <div>
                                    {/* Formularz dodawania nowego posta */}
                                    <Card sx={{mb: 3}}>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                Dodaj nowy post
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                label="Tytuł posta"
                                                variant="outlined"
                                                sx={{mb: 2}}
                                                value={newPostTitle}
                                                onChange={(e) => setNewPostTitle(e.target.value)}
                                            />
                                            <TextField
                                                fullWidth
                                                label="Treść posta"
                                                variant="outlined"
                                                multiline
                                                rows={4}
                                                sx={{mb: 2}}
                                                value={newPostContent}
                                                onChange={(e) => setNewPostContent(e.target.value)}
                                            />
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleAddPost}
                                                disabled={!newPostTitle.trim()}
                                            >
                                                Opublikuj
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    {/* Lista postów */}
                                    <Typography variant="h6" gutterBottom sx={{mb: 2}}>
                                        Najnowsze dyskusje
                                    </Typography>

                                    {posts.length === 0 ? (
                                        <Card sx={{mb: 3}}>
                                            <CardContent>
                                                <Typography color="textSecondary">
                                                    Brak dyskusji. Bądź pierwszy który rozpocznie nowy wątek!
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <div style={{maxHeight: '600px', overflowY: 'auto'}}>
                                            {posts.map((post) => (
                                                <Card key={post.id} sx={{mb: 3}}>
                                                    <CardContent>
                                                        {/* Nagłówek posta */}
                                                        <div style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center'
                                                        }}>
                                                            <Typography variant="h6">{post.title}</Typography>
                                                            <Typography color="textSecondary" variant="body2">
                                                                {new Date(post.created_at).toLocaleString()}
                                                            </Typography>
                                                        </div>

                                                        {/* Autor posta */}
                                                        <Typography color="textSecondary" variant="subtitle2"
                                                                    gutterBottom>
                                                            Autor: {post.user.username}
                                                        </Typography>

                                                        {/* Treść posta */}
                                                        <Typography variant="body1" paragraph sx={{mt: 2}}>
                                                            {post.content}
                                                        </Typography>

                                                        {/* Like/Dislike i komentarze */}
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '16px',
                                                            marginTop: '8px'
                                                        }}>
                                                            <div style={{display: 'flex', alignItems: 'center'}}>
                                                                <IconButton
                                                                    onClick={() => handlePostLike(post.id, true)}
                                                                    color={post.user_like === true ? 'primary' : 'default'}
                                                                >
                                                                    <ThumbUpAlt/>
                                                                </IconButton>
                                                                <Typography>{post.likes.filter(l => l.value === true).length}</Typography>
                                                            </div>

                                                            <div style={{display: 'flex', alignItems: 'center'}}>
                                                                <IconButton
                                                                    onClick={() => handlePostLike(post.id, false)}
                                                                    color={post.user_like === false ? 'error' : 'default'}
                                                                >
                                                                    <ThumbDownAlt/>
                                                                </IconButton>
                                                                <Typography>{post.likes.filter(l => l.value === false).length}</Typography>
                                                            </div>

                                                            <Button
                                                                startIcon={<Comment/>}
                                                                onClick={() => toggleComments(post.id)}
                                                            >
                                                                {post.showComments ? 'Ukryj komentarze' : `Pokaż komentarze (${post.comments.length})`}
                                                            </Button>

                                                            {post.user.id === currentUser.id && (
                                                                <>
                                                                    <IconButton onClick={() => handleEditPost(post)}>
                                                                        <Edit/>
                                                                    </IconButton>
                                                                    <IconButton
                                                                        onClick={() => handleDeletePost(post.id)}>
                                                                        <Delete/>
                                                                    </IconButton>
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Sekcja komentarzy */}
                                                        {post.showComments && (
                                                            <div style={{marginTop: '16px'}}>
                                                                {/* Lista komentarzy */}
                                                                {post.comments.map((comment) => (
                                                                    <Card key={comment.id} sx={{
                                                                        mb: 2,
                                                                        ml: 4,
                                                                        backgroundColor: 'action.hover'
                                                                    }}>
                                                                        <CardContent>
                                                                            <div style={{
                                                                                display: 'flex',
                                                                                justifyContent: 'space-between'
                                                                            }}>
                                                                                <Typography variant="subtitle2">
                                                                                    {comment.user.username}
                                                                                </Typography>
                                                                                <Typography color="textSecondary"
                                                                                            variant="body2">
                                                                                    {new Date(comment.created_at).toLocaleString()}
                                                                                </Typography>
                                                                            </div>

                                                                            <Typography variant="body2" paragraph>
                                                                                {comment.content}
                                                                            </Typography>

                                                                            <div style={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: '8px'
                                                                            }}>
                                                                                <IconButton
                                                                                    size="small"
                                                                                    onClick={() => handleCommentLike(comment.id, true)}
                                                                                    color={comment.user_like === true ? 'primary' : 'default'}
                                                                                >
                                                                                    <ThumbUpAlt fontSize="small"/>
                                                                                </IconButton>
                                                                                <Typography variant="body2">
                                                                                    {comment.likes.filter(l => l.value === true).length}
                                                                                </Typography>

                                                                                <IconButton
                                                                                    size="small"
                                                                                    onClick={() => handleCommentLike(comment.id, false)}
                                                                                    color={comment.user_like === false ? 'error' : 'default'}
                                                                                >
                                                                                    <ThumbDownAlt fontSize="small"/>
                                                                                </IconButton>
                                                                                <Typography variant="body2">
                                                                                    {comment.likes.filter(l => l.value === false).length}
                                                                                </Typography>

                                                                                {comment.user.id === currentUser.id && (
                                                                                    <>
                                                                                        <IconButton size="small"
                                                                                                    onClick={() => handleEditComment(comment)}>
                                                                                            <Edit fontSize="small"/>
                                                                                        </IconButton>
                                                                                        <IconButton size="small"
                                                                                                    onClick={() => handleDeleteComment(comment.id)}>
                                                                                            <Delete fontSize="small"/>
                                                                                        </IconButton>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                ))}

                                                                {/* Formularz dodawania nowego komentarza */}
                                                                <div style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    marginTop: '8px'
                                                                }}>
                                                                    <TextField
                                                                        fullWidth
                                                                        variant="outlined"
                                                                        size="small"
                                                                        placeholder="Dodaj komentarz..."
                                                                        value={post.newComment || ''}
                                                                        onChange={(e) => handleCommentChange(post.id, e.target.value)}
                                                                    />
                                                                    <Button
                                                                        variant="contained"
                                                                        size="small"
                                                                        onClick={() => handleAddComment(post.id)}
                                                                        disabled={!post.newComment?.trim()}
                                                                    >
                                                                        Wyślij
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
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

                            <Box sx={{pt: 3}}>
                                {activeTab === 'rules' && (
                                    <Card>
                                        <CardContent sx={{textAlign: "left"}}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Typography variant="h6" gutterBottom component="div">
                                                    Zasady grupy
                                                </Typography>
                                                {isEditable && isAdmin && (
                                                    <Button
                                                        size="small"
                                                        onClick={handleRulesEdit}
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
                                                    {editedRules || "Brak zasad grupy"}
                                                </Typography>
                                            )}


                                        </CardContent>
                                    </Card>
                                )}
                            </Box>

                            <Box sx={{pt: 1}}>
                                {activeTab === 'media' && (
                                    <Card sx={{mb: 3}}>
                                        <MediaTab/>
                                    </Card>
                                )}
                            </Box>
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
                    </Box>
                </Box>

                {/* Dialog ustawień grupy */}
                <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Ustawienia grupy</DialogTitle>
                    <DialogContent dividers>
                        {/* Sekcja zdjęć */}
                        <Box sx={{mb: 3}}>

                            {/* Cover Image */}
                            <Box sx={{mb: 3}}>
                                <Typography sx={{mb: 2}} variant="body2" gutterBottom>
                                    Zdjęcie w tle (cover)
                                </Typography>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                    {group.coverImage ? (
                                        typeof group.coverImage === 'string' ? (
                                            // Jeśli coverImage to URL string (istniejące zdjęcie)
                                            <img
                                                src={group.coverImage?.toString().slice(15)}
                                                alt="Cover"
                                                style={{width: 100, height: 60, objectFit: 'cover', borderRadius: 4}}
                                            />
                                        ) : (
                                            // Jeśli to nowy plik
                                            <img
                                                src={URL.createObjectURL(group.coverImage)}
                                                alt="Cover"
                                                style={{width: 100, height: 60, objectFit: 'cover', borderRadius: 4}}
                                                onLoad={() => URL.revokeObjectURL(group.coverImage)} // Zwolnienie pamięci
                                            />
                                        )
                                    ) : (
                                        <Avatar variant="rounded" sx={{width: 100, height: 60, bgcolor: 'grey.300'}}>
                                            <PhotoCamera/>
                                        </Avatar>
                                    )}
                                    <Box>
                                        <input
                                            accept="image/*"
                                            style={{display: 'none'}}
                                            id="cover-image-upload"
                                            type="file"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files.length > 0) {
                                                    const file = e.target.files[0];
                                                    if (file.type.startsWith('image/')) {
                                                        setGroup({...group, coverImage: file});
                                                    } else {
                                                        alert('Proszę wybrać plik obrazu');
                                                    }
                                                }
                                            }}
                                        />
                                        <label>
                                            <label htmlFor="cover-image-upload">
                                            <Button
                                                variant="outlined"
                                                component="span"
                                                startIcon={<CloudUpload/>}
                                                size="small"
                                            >
                                                Wybierz plik
                                            </Button>
                                            </label>

                                            {group.coverImage && (
                                                <Button
                                                    color="error"
                                                    size="small"
                                                    onClick={() => setGroup({...group, coverImage: null})}
                                                >
                                                    <Close/>
                                                </Button>
                                            )}
                                        </label>
                                        {group.coverImage && (
                                            <Typography variant="caption" display="block" sx={{mt: 1}}>
                                                {typeof group.coverImage === 'string'
                                                    ? 'Istniejące zdjęcie'
                                                    : group.coverImage.name}
                                            </Typography>
                                        )}
                                    </Box>

                                </Box>
                            </Box>

                            {/* Avatar */}
                            <Box>
                                <Typography sx={{mb: 2}} variant="body2" gutterBottom>
                                    Awatar grupy
                                </Typography>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                    {group.avatar ? (
                                        typeof group.avatar === 'string' ? (
                                            // Jeśli avatar to URL string
                                            <Avatar
                                                src={group.avatar?.toString().slice(15)}
                                                sx={{width: 64, height: 64}}
                                            />
                                        ) : (
                                            // Jeśli to nowy plik
                                            <Avatar
                                                src={URL.createObjectURL(group.avatar)}
                                                sx={{width: 64, height: 64}}
                                                onLoad={() => URL.revokeObjectURL(group.avatar)}
                                            />
                                        )
                                    ) : (
                                        <Avatar sx={{width: 64, height: 64, bgcolor: 'grey.300'}}>
                                            <Group/>
                                        </Avatar>
                                    )}
                                    <Box>
                                        <input
                                            accept="image/*"
                                            style={{display: 'none'}}
                                            id="avatar-upload"
                                            type="file"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files.length > 0) {
                                                    const file = e.target.files[0];
                                                    if (file.type.startsWith('image/')) {
                                                        setGroup({...group, avatar: file});
                                                    } else {
                                                        alert('Proszę wybrać plik obrazu');
                                                    }
                                                }
                                            }}
                                        />
                                        <label>
                                        <label htmlFor="avatar-upload">
                                            <Button
                                                variant="outlined"
                                                component="span"
                                                startIcon={<CloudUpload/>}
                                                size="small"
                                            >
                                                Wybierz plik
                                            </Button>
                                        </label>
                                                                                {group.avatar && (
                                        <Button
                                                color="error"
                                                size="small"
                                                onClick={() => setGroup({...group, avatar: null})}
                                            >
                                                <Close/>
                                            </Button>
                                        )}
                                        </label>
                                        {group.avatar && (
                                            <Typography variant="caption" display="block" sx={{mt: 1}}>
                                                {typeof group.avatar === 'string'
                                                    ? 'Istniejące zdjęcie'
                                                    : group.avatar.name}
                                            </Typography>
                                        )}
                                    </Box>

                                </Box>
                            </Box>
                        </Box>

                        <Box sx={{mb: 3}}>
                            <Typography variant="subtitle1" gutterBottom>
                                Podstawowe informacje
                            </Typography>
                            <TextField
                                fullWidth
                                label="Nazwa grupy"
                                value={group.name}
                                onChange={(e) => setGroup({...group, name: e.target.value})}
                                sx={{mb: 2, mt: 1}}
                            />
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Opis"
                                value={group.description}
                                onChange={(e) => setGroup({...group, description: e.target.value})}
                            />
                            <TextField
                                fullWidth
                                rows={3}
                                label="Kod dostępu"
                                value={group.code}
                                sx={{mt: 2}}
                                onChange={(e) => setGroup({...group, code: e.target.value})}
                            />

                            <TextField
                                id="outlined-number"
                                label="Maksymalna liczba członków"
                                type="number"
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    },
                                }}
                                value={group.limit}
                                sx={{mt: 2}}
                                onChange={(e) => setGroup({...group, maxMembers: e.target.value})}
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
                            {group.isArchived && (
                                <Typography sx={{textAlign: "justify"}}>
                                    Uwaga!
                                    <br/>
                                    Archiwizacja grupy oznacza, że dodawanie postów, mediów, wydarzeń
                                    i nowych członków stanie się niemożliwe. Jest to równoznaczne z uśpieniem grupy.
                                </Typography>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowSettings(false)}>Anuluj</Button>
                        <Button
                            variant="contained"
                            onClick={() => handleUpdateGroupSettings(group)}
                            disabled={!group.name.trim()}
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
};

export default GroupPage;