import React, {useState, useEffect} from 'react';
import {
    Tabs,
    Tab,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    Chip,
    IconButton,
    Divider,
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Avatar,
    Grid,
    FormControlLabel,
    Switch,
    Snackbar,
    InputAdornment, Tooltip, Pagination, Checkbox
} from '@mui/material';
import {
    Search,
    FilterList,
    Lock,
    LockOpen,
    Description,
    GroupAdd,
    Public,
    VisibilityOff,
    Visibility, PeopleAlt, Verified, NoEncryptionGmailerrorred
} from '@mui/icons-material';

import client from "../../client";
import {API_BASE_URL} from "../../config";
import {useNavigate} from "react-router-dom";


const mockFieldByYears = [
    {id: 1, year: 2023, fieldName: 'Informatyka'},
    {id: 2, year: 2023, fieldName: 'Matematyka'},
    {id: 3, year: 2022, fieldName: 'Fizyka'},
];

const Groups = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [search, setSearch] = useState({
        name: '',
        isPublic: null, // 'public' lub 'private'
        isOfficial: null // null = wszystkie, true/false = tylko oficjalne/nieoficjalne
    });

    const [selectedGroup, setSelectedGroup] = useState(null);
    const [password, setPassword] = useState('');
    const [groups, setGroups] = useState([]);
    const [fieldByYears, setFieldByYears] = useState([]);
    const [userGroups, setUserGroups] = useState([]);
    const userId = 1;
    const [showPassword, setShowPassword] = useState(false);

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };
    const [page, setPage] = useState(0);
    const rowsPerPage = 6;

    const [newGroup, setNewGroup] = useState({
        name: '',
        fieldByYear: '',
        description: '',
        isPublic: true,
        password: '',
        capacity: 30
    });
    const [createdGroupCode, setCreatedGroupCode] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const handleCreateGroup = () => {
        const generatedCode = Math.random().toString(36).substr(2, 8).toUpperCase();


        try {
            const response = client.post(API_BASE_URL + "groups/", {
                name: newGroup.name,
                description: newGroup.description,
                code: newGroup.password,
                limit: newGroup.capacity,
                isPublic: newGroup.isPublic,
                fieldByYear: newGroup.fieldByYear
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // setUser(response.data);
            setGroups(response.data.groups)
            setUserGroups(response.data.userGroups)
        } catch (error) {
            console.log("Nie udało się zalogować");
        }

        setCreatedGroupCode(generatedCode);
        setShowSuccess(true);
        setNewGroup({
            name: '',
            fieldByYear: '',
            description: '',
            isPublic: true,
            password: '',
            capacity: 30
        });

        setActiveTab(0)
        window.location.reload();
    };


    const navigate = useNavigate()
    const [userGroupsPage, setUserGroupsPage] = useState(0);
    const token = localStorage.getItem("access");
    const fetchData = async () => {
        try {
            const response = await client.get(API_BASE_URL + "groups/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setGroups(response.data.allGroups)
            setUserGroups(response.data.myGroups)

            const resp = await client.get(API_BASE_URL + "fieldByYear/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setFieldByYears(resp.data)

        } catch (error) {
            console.error("Błąd pobierania danych:", error);
        }
    };


    useEffect(() => {

        if (groups?.length < 1) {
            fetchData();
        }

    }, [fetchData, groups, userId]);

    const handleJoinGroup = async () => {
        if (!selectedGroup) return;

        console.log(password)
        try {
            const response = await client.post(API_BASE_URL + `group/${selectedGroup.id}`,
                {
                    code: password
                },
                {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            navigate(`/group/${selectedGroup.id}`)

        } catch (error) {
            alert('Nieprawidłowe hasło!');
            console.error("Błąd pobierania danych:", error);
        }



        setSelectedGroup(null);
        setPassword('');
    };

    const filteredGroups = groups?.filter(g => {
        // Filter by name (case insensitive)
        const matchesName = search.name
            ? g.name.toLowerCase().includes(search.name.toLowerCase())
            : true;

        // Filter by official status
        const matchesOfficial = search.isOfficial === null
            ? true
            : g.isOfficial === search.isOfficial;

        // Filter by public/private status
        const matchesPublic = search.isPublic === null
            ? true
            : g.isPublic === search.isPublic;

        return matchesName && matchesOfficial && matchesPublic;
    });


    return (
        <Box sx={{p: 2, maxWidth: 1000, margin: "auto"}}>
            <Tabs value={activeTab} onChange={(e, newVal) => setActiveTab(newVal)}>
                <Tab label="Moje grupy"/>
                <Tab label="Odkrywaj"/>
                <Tab label="Twórz"/>
            </Tabs>

            {activeTab === 0 ? (
                <Box sx={{mt: 2}}>
                    <List sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        {userGroups?.length > 0 ? (
                            <>
                                {userGroups
                                    ?.slice(userGroupsPage * rowsPerPage, userGroupsPage * rowsPerPage + rowsPerPage)
                                    .map(g => (
                                        <ListItem onClick={() => {
                                            navigate(`/group/${g.id}`)
                                        }} key={g.id} sx={{ cursor: "pointer", width: '100%', maxWidth: 400}}>
                                            <ListItemText
                                                primary={<Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                    {g.isOfficial ?
                                                        <>
                                                            {g.name}
                                                            <Verified sx={{color: 'primary', fontSize: '1rem'}}/></>
                                                        : g.name}
                                                    {userGroups.some(group => group.id === g.id) && (
                                                        <Chip
                                                            label="Dołączono"
                                                            size="small"  // Built-in small size
                                                            sx={{
                                                                fontSize: '0.7rem',    // Smaller text
                                                                height: '24px',        // Reduced height
                                                                padding: '0 8px',      // Tighter padding
                                                                '& .MuiChip-label': {  // Target the label specifically
                                                                    padding: '0 4px'     // Less horizontal space
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                </Box>}
                                                secondary={`Admin: ${g.admin.username} • Utworzono: ${new Date(g.date_created).toLocaleDateString()} ${g.limit ? `• Członkowie: ${g.members.length}/${g.limit}` : ""}`}
                                            />
                                            {g.archived ? <Tooltip title="Archiwalna"><NoEncryptionGmailerrorred
                                                sx={{color: "lightgray"}}/></Tooltip> : (g.isPublic ?
                                                <Tooltip title="Publiczna"><LockOpen color="blacky"/></Tooltip> :
                                                <Tooltip title="Prywatna"><Lock color="black"/></Tooltip>)}
                                        </ListItem>
                                    ))}
                                <Box sx={{display: 'flex', justifyContent: 'center', mt: 2}}>
                                    <Pagination
                                        count={Math.ceil(userGroups.length / rowsPerPage)}
                                        page={userGroupsPage + 1}
                                        onChange={(event, value) => setUserGroupsPage(value - 1)}
                                        color="black"
                                    />
                                </Box>
                            </>
                        ) : (
                            <Box sx={{textAlign: 'center', mt: 6}}>
                                <img
                                    src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png"
                                    alt="Brak grup"
                                    style={{width: 100, height: 100, opacity: 0.6}}
                                />
                                <Typography variant="subtitle1" color="textSecondary" sx={{mt: 2}}>
                                    Nie dołączono jeszcze do żadnej grupy.
                                </Typography>
                            </Box>
                        )}
                    </List>
                </Box>
            ) : activeTab === 1 ? (
                <Box sx={{mt: 2}}>
                    <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 2,
                        mb: 3,
                        alignItems: 'flex-end'
                    }}>
                        {/* Pole wyszukiwania po nazwie */}
                        <TextField
                            label="Szukaj po nazwie"
                            value={search.name}
                            onChange={e => setSearch({...search, name: e.target.value})}
                            InputProps={{startAdornment: <Search/>}}
                            sx={{flexGrow: 1, minWidth: 200}}
                        />

                        {/* Filtrowanie po typie grupy */}
                        <FormControl sx={{minWidth: 180}}>
                            <InputLabel>Typ grupy</InputLabel>
                            <Select
                                value={search.isPublic}
                                onChange={e => setSearch({...search, isPublic: e.target.value})}
                                label="Typ grupy"
                            >
                                <MenuItem value={null}>Wszystkie</MenuItem>
                                <MenuItem value={true}>Publiczne</MenuItem>
                                <MenuItem value={false}>Prywatne</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Filtrowanie po statusie oficjalnym */}
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={search.isOfficial || false}
                                    onChange={e => setSearch({...search, isOfficial: e.target.checked})}
                                    indeterminate={search.isOfficial === null}
                                />
                            }
                            label="Oficjalne"
                            sx={{whiteSpace: 'nowrap'}}
                        />
                    </Box>

                    <Divider sx={{my: 2}}/>

                    <List>
                        {filteredGroups
                            ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map(g => (
                                <ListItem
                                    key={g.id}
                                    button
                                    onClick={() => userGroups.some(group => group.id === g.id) ? navigate(`/group/${g.id}`) : (g.archived ? null : setSelectedGroup(g))}
                                    disabled={g.members.includes(userId)}
                                    sx={g.archived && !userGroups.some(group => group.id === g.id) ? null : {cursor: "pointer"}}
                                >
                                    <ListItemText
                                        primary={<Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                            {g.isOfficial ?
                                                <>
                                                    {g.name}
                                                    <Verified sx={{color: 'primary', fontSize: '1rem'}}/></>
                                                : g.name}
                                            {userGroups.some(group => group.id === g.id) && (
                                                <Chip
                                                    label="Dołączono"
                                                    size="small"  // Built-in small size
                                                    sx={{
                                                        fontSize: '0.7rem',    // Smaller text
                                                        height: '24px',        // Reduced height
                                                        padding: '0 8px',      // Tighter padding
                                                        '& .MuiChip-label': {  // Target the label specifically
                                                            padding: '0 4px'     // Less horizontal space
                                                        }
                                                    }}
                                                />
                                            )}
                                        </Box>}
                                        secondary={`Admin: ${g.admin.username} • Utworzono: ${new Date(g.date_created).toLocaleDateString()} ${g.limit ? `• Członkowie: ${g.members.length}/${g.limit}` : ""}`}
                                    />
                                    {g.archived ? <Tooltip title="Archiwalna"><NoEncryptionGmailerrorred
                                        sx={{color: "lightgray"}}/></Tooltip> : (g.isPublic ?
                                        <Tooltip title="Publiczna"><LockOpen color="blacky"/></Tooltip> :
                                        <Tooltip title="Prywatna"><Lock color="black"/></Tooltip>)}

                                </ListItem>
                            ))}
                    </List>

                    {filteredGroups?.length > 0 && (
                        <Box sx={{display: 'flex', justifyContent: 'center', mt: 2}}>
                            <Pagination
                                count={Math.ceil(filteredGroups.length / rowsPerPage)}
                                page={page + 1}
                                onChange={(event, value) => setPage(value - 1)}
                                color="black"
                            />
                        </Box>
                    )}

                </Box>
            ) : activeTab === 2 ? (
                <Box sx={{mt: 4, maxWidth: 800, mx: 'auto'}}>
                    <Box sx={{textAlign: 'center', mb: 4}}>
                        <Avatar sx={{
                            bgcolor: 'black',
                            width: 80,
                            height: 80,
                            mx: 'auto',
                            mb: 2
                        }}>
                            <GroupAdd sx={{backgroundColor: "black"}} fontSize="large"/>
                        </Avatar>
                        <Typography variant="h4" gutterBottom>
                            Utwórz nową grupę
                        </Typography>
                        <Typography color="textSecondary">
                            Stwórz przestrzeń do współpracy i wymiany wiedzy
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Box sx={{p: 3, bgcolor: 'background.paper', borderRadius: 2}}>
                                <Typography variant="h6" gutterBottom sx={{mb: 3}}>
                                    <Description sx={{mr: 1, verticalAlign: 'middle'}}/>
                                    Podstawowe informacje
                                </Typography>

                                <TextField
                                    label="Nazwa grupy"
                                    fullWidth
                                    value={newGroup.name}
                                    onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                                    required
                                    sx={{mb: 3}}
                                />

                                <TextField
                                    label="Opis grupy"
                                    multiline
                                    rows={4}
                                    fullWidth
                                    required
                                    value={newGroup.description.slice(0, 600)}
                                    onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                                    helperText={`${newGroup.description.length}/600`}
                                    sx={{
                                        '& .MuiFormHelperText-root': {
                                            textAlign: 'right',  // Aligns helper text to right
                                            mx: 0,               // Removes default margin
                                        }
                                    }}
                                />

                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box sx={{p: 3, bgcolor: 'background.paper', borderRadius: 2}}>
                                <Typography variant="h6" gutterBottom sx={{mb: 3}}>
                                    <PeopleAlt sx={{mr: 1, verticalAlign: 'middle'}}/>
                                    Ustawienia dostępu
                                </Typography>

                                <Grid container spacing={2} pb={3} alignItems="center">
                                    <Grid item xs={11} md={10}>
                                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                                            {newGroup.isPublic ? <Public/> : <Lock/>}
                                            <Box sx={{ml: 3}}>
                                                <Typography sx={{textAlign: "left"}}>
                                                    {newGroup.isPublic ? 'Grupa publiczna' : 'Grupa prywatna'}
                                                </Typography>
                                                <Typography sx={{textAlign: "left"}} variant="body2"
                                                            color="textSecondary">
                                                    {newGroup.isPublic
                                                        ? 'Każdy może dołączyć'
                                                        : 'Wymagane hasło do dołączenia'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={1} md={2} pb={3}>
                                        <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={newGroup.isPublic}
                                                        onChange={(e) => setNewGroup({
                                                            ...newGroup,
                                                            isPublic: e.target.checked
                                                        })}
                                                        color="primary"
                                                    />
                                                }
                                            />
                                        </Box>
                                    </Grid>
                                </Grid>


                                {!newGroup.isPublic && (
                                    <TextField
                                        label="Hasło dostępu"
                                        type={showPassword ? 'text' : 'password'}
                                        fullWidth
                                        value={newGroup.password}
                                        onChange={(e) => setNewGroup({...newGroup, password: e.target.value})}
                                        sx={{mb: 3}}
                                        helperText="Pozostaw puste, aby automatycznie ustawić kod dstępu."
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <VisibilityOff/> : <Visibility/>}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                )}

                                <TextField
                                    label="Maksymalna liczba członków"
                                    type="number"
                                    fullWidth
                                    value={newGroup.capacity}
                                    onChange={(e) => setNewGroup({...newGroup, capacity: e.target.value})}
                                    inputProps={{min: 2, max: 100}}
                                    helperText="Pozostaw puste, aby utworzyć grupę bez limitu członków."
                                    sx={{mb: 3}}
                                />

                                <Divider sx={{my: 3}}/>

                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    onClick={handleCreateGroup}
                                    disabled={!newGroup.name || !newGroup.description}
                                    startIcon={<GroupAdd/>}
                                >
                                    Utwórz grupę
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>) : null}

            <Dialog open={!!selectedGroup} onClose={() => setSelectedGroup(null)} maxWidth="sm" fullWidth>
  <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    {selectedGroup?.isOfficial && <Verified color="primary" />}
    Dołącz do {selectedGroup?.name}
  </DialogTitle>

  <DialogContent dividers>
    {/* Sekcja informacyjna */}
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {selectedGroup?.isPublic ? <Public color="primary" /> : <Lock color="secondary" />}
          {selectedGroup?.isPublic ? 'Grupa publiczna' : 'Grupa prywatna'}
        </Box>
      </Typography>

      {selectedGroup?.description && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Opis grupy:
          </Typography>
          <Typography variant="body1" sx={{
            p: 2,
            bgcolor: 'action.hover',
            borderRadius: 1,
            whiteSpace: 'pre-wrap'
          }}>
            {selectedGroup.description.slice(0,400)}
          </Typography>
        </>
      )}
    </Box>

    {/* Statystyki grupy */}
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={6}>
        <Typography variant="body2" color="text.secondary">
          Członkowie:
        </Typography>
        <Typography variant="body1">
          {selectedGroup?.members?.length || 0}{selectedGroup?.limit ? `/${selectedGroup.limit}` : ''}
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body2" color="text.secondary">
          Data utworzenia:
        </Typography>
        <Typography variant="body1">
          {selectedGroup?.date_created ? new Date(selectedGroup.date_created).toLocaleDateString() : 'Nieznana'}
        </Typography>
      </Grid>
    </Grid>

    {/* Pole hasła dla grup prywatnych */}
    {!selectedGroup?.isPublic && (
      <TextField
        autoFocus
        margin="dense"
        label="Hasło dostępu"
        type="password"
        fullWidth
        value={password}
        onChange={e => setPassword(e.target.value)}
        sx={{ mt: 2 }}
      />
    )}
  </DialogContent>

  <DialogActions sx={{ p: 2 }}>
    <Button onClick={() => setSelectedGroup(null)} sx={{ mr: 1 }}>
      Anuluj
    </Button>
    <Button
      onClick={handleJoinGroup}
      variant="contained"
      disabled={!selectedGroup?.isPublic && !password}
    >
      Dołącz
    </Button>
  </DialogActions>
</Dialog>
        </Box>
    );
};

export default Groups;