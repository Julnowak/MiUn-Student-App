import React, {useState, useEffect} from 'react';
import {
    Autocomplete,
    Box,
    Button,
    Checkbox,
    Chip,
    Fab,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Pagination,
    Select,
    TextField,
    Typography,
    Badge,
    DialogTitle,
    Dialog,
    DialogContentText,
    DialogContent,
    DialogActions,
    Snackbar,
    RadioGroup, FormLabel, Radio
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import LinkIcon from '@mui/icons-material/Link';
import client from "../../client";
import {API_BASE_URL} from "../../config";
import Alert from "@mui/material/Alert";

const Learning = () => {
    const [allResources, setAllResources] = useState([]);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        name: '',
        kierunek: '',
        przedmiot: '',
        tylkoMoje: false,
        zweryfikowane: true,
        sort: 'desc',
    });
    const token = localStorage.getItem("access");

    const fetchData = async () => {
        try {
            const response = await client.get(API_BASE_URL + "sources/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    name: filters.name,
                    kierunek: filters.kierunek,
                    przedmiot: filters.przedmiot,
                    tylko_moje: filters.tylkoMoje,
                    zweryfikowane: filters.zweryfikowane,
                    ordering: filters.sort === 'desc' ? '-created_at' : 'created_at',
                }
            });

            setAllResources(response.data);
            setPage(1); // reset strony
        } catch (error) {
            console.error("Błąd pobierania danych:", error);
        }
    };


    useEffect(() => {
        if (allResources.length < 1) {
            fetchData();
        }
    }, [allResources.length, fetchData]);

    const ITEMS_PER_PAGE = 5;
    const totalPages = Math.ceil(allResources.length / ITEMS_PER_PAGE);
    const paginatedData = allResources.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    const [open, setOpen] = React.useState(false);
    const [selectedResource, setSelectedResource] = useState(null);

    const handleClickOpen = (resource) => {
        setSelectedResource(resource);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedResource(null);
    };

    const handleProceed = () => {
        if (selectedResource?.type === "LINK") {
            window.open(selectedResource.link);
        } else {
            const link = document.createElement('a');
            link.href = selectedResource?.file?.slice(16);
            link.download = selectedResource?.file.slice(35); // Extract the file name from the URL
            link.click(); // Programmatically click the link to start the download
        }
        handleClose();
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({...prev, [field]: value}));
    };

    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        kierunek: '',
        przedmiot: '',
        type: 'PLIK',
        file: null,
        link: ''
    });
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const handleAddClick = () => setAddDialogOpen(true);
    const handleAddClose = () => {
        setAddDialogOpen(false);
        setFormData({
            title: '',
            description: '',
            kierunek: '',
            przedmiot: '',
            type: 'PLIK',
            file: null,
            link: ''
        });
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    const handleFormSubmit = async () => {
        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("field", formData.kierunek);
        data.append("subject", formData.przedmiot);
        data.append("type", formData.type);
        if (formData.type === "PLIK") {
            data.append("file", formData.file);
        } else {
            data.append("link", formData.link);
        }

        try {
            await client.post(API_BASE_URL + "sources/", data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                }
            });
            handleAddClose();
            setSnackbarOpen(true);
            fetchData(); // odśwież dane
        } catch (err) {
            console.error("Błąd przy dodawaniu zasobu:", err);
        }
    };

    return (
        <div className="container mt-4 p-4 rounded">

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{width: '100%'}}>
                    Zasób został dodany pomyślnie!
                </Alert>
            </Snackbar>


            <Typography sx={{mt: 4, mb: 2}} variant="h6">Dostępne zasoby</Typography>

            {/* Filters */}
            <Box sx={{flexGrow: 1, p: 2}}>
                <Grid container spacing={2} alignItems="center" mb={2}>
                    <Grid item xs={10}>
                        <TextField
                            fullWidth
                            label="Nazwa"
                            variant="standard"
                            value={filters.name}
                            onChange={(e) => handleFilterChange('name', e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <Button variant="contained" onClick={fetchData}>Wyszukaj</Button>
                    </Grid>
                </Grid>

                <Grid container spacing={2} alignItems="center" mb={2}>
                    <Grid item xs={3}>
                        <Autocomplete
                            disablePortal
                            options={["Informatyka", "Automatyka"]}
                            value={filters.kierunek}
                            onChange={(e, val) => handleFilterChange('kierunek', val || '')}
                            renderInput={(params) => <TextField {...params} label="Kierunek" variant="standard"/>}
                        />
                    </Grid>

                    <Grid item xs={3}>
                        <Autocomplete
                            disablePortal
                            options={["Matematyka", "Programowanie"]}
                            value={filters.przedmiot}
                            onChange={(e, val) => handleFilterChange('przedmiot', val || '')}
                            renderInput={(params) => <TextField {...params} label="Przedmiot" variant="standard"/>}
                        />
                    </Grid>

                    <Grid item xs={2}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={filters.tylkoMoje}
                                    onChange={(e) => handleFilterChange('tylkoMoje', e.target.checked)}
                                />
                            }
                            label="Tylko moje"
                        />
                    </Grid>

                    <Grid item xs={2}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={filters.zweryfikowane}
                                    onChange={(e) => handleFilterChange('zweryfikowane', e.target.checked)}
                                />
                            }
                            label="Zweryfikowane"
                        />
                    </Grid>
                </Grid>
            </Box>

            {/* Sort */}
            <Grid container spacing={2}>
                <Grid item xs={9}></Grid>
                <Grid item xs={3}>
                    <FormControl fullWidth variant="standard">
                        <InputLabel id="sort-label">Data dodania</InputLabel>
                        <Select
                            labelId="sort-label"
                            id="sort-select"
                            value={filters.sort}
                            onChange={(e) => handleFilterChange('sort', e.target.value)}
                        >
                            <MenuItem value="desc">Od najnowszych</MenuItem>
                            <MenuItem value="asc">Od najstarszych</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            {/* Resource list */}
            <List>
                {paginatedData.map((resource, idx) => (
                    <ListItem key={idx} secondaryAction={
                        resource.type === "LINK" ?
                            <IconButton onClick={resource.verified ? () => {
                                window.open(resource.link);
                            } : () => handleClickOpen(resource)} edge="end">
                                <LinkIcon/>
                            </IconButton>
                            :
                            <IconButton onClick={resource.verified ? () => {
                                const link = document.createElement('a');
                                link.href = resource.file?.slice(16);
                                link.download = resource.file.slice(35); // Extract the file name from the URL
                                link.click(); // Programmatically click the link to start the download
                            } : () => handleClickOpen(resource)} edge="end">
                                <ArrowCircleDownIcon/>
                            </IconButton>
                    }>
                        <ListItemIcon>
                            <Badge color={resource.verified ? "success" : "error"}
                                   badgeContent={resource.verified ? "✓" : "!"}>
                                <InsertDriveFileIcon/>
                            </Badge>
                        </ListItemIcon>
                        <ListItemText
                            primary={resource.title}
                            secondary={resource.description || "Brak opisu"}
                        />
                        <Chip label={resource.field}/>
                    </ListItem>
                ))}
            </List>

            {/* Dialog */}
            {selectedResource && (
                <Dialog
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {selectedResource.type === "LINK" ? "Niezweryfikowany link" : "Niezweryfikowany plik"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            {selectedResource.type === "LINK" ?
                                "Link do tego źródła nie został przez nas jeszcze zweryfikowany, co oznacza, że może być niebezpieczny! Przy przechodzeniu na stronę zachowaj ostrożność." :
                                "Plik nie został przez nas jeszcze zweryfikowany, co oznacza, że może być niebezpieczny! Przy pobieraniu nieznanych plików zachowaj ostrożność."
                            }
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} variant={"contained"}>Anuluj</Button>
                        <Button onClick={handleProceed} autoFocus>
                            {selectedResource.type === "LINK" ? "Przechodzę" : "Pobieram"}
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* Paginator */}
            <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                />
            </Box>

            <Fab color="secondary" aria-label="add" sx={{position: 'fixed', bottom: 20, right: 20}}
                 onClick={handleAddClick}>
                <AddIcon/>
            </Fab>

            <Dialog open={addDialogOpen} onClose={handleAddClose} ModalProps={{
                                        keepMounted: true,
                                        disableScrollLock: true,
                                    }} fullWidth maxWidth="sm">
                <DialogTitle>Dodaj nowy zasób</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <TextField
                            label="Tytuł"
                            fullWidth
                            value={formData.title}
                            onChange={(e) => handleFormChange('title', e.target.value)}
                        />
                        <TextField
                            label="Opis"
                            fullWidth
                            multiline
                            minRows={2}
                            value={formData.description}
                            onChange={(e) => handleFormChange('description', e.target.value)}
                        />
                        <Autocomplete
                            options={["Informatyka", "Automatyka"]}
                            value={formData.kierunek}
                            onChange={(e, val) => handleFormChange('kierunek', val || '')}
                            renderInput={(params) => <TextField {...params} label="Kierunek"/>}
                        />
                        <Autocomplete
                            options={["Matematyka", "Programowanie"]}
                            value={formData.przedmiot}
                            onChange={(e, val) => handleFormChange('przedmiot', val || '')}
                            renderInput={(params) => <TextField {...params} label="Przedmiot"/>}
                        />
                        <FormControl>
                            <FormLabel>Typ zasobu</FormLabel>
                            <RadioGroup row value={formData.type}
                                        onChange={(e) => handleFormChange('type', e.target.value)}>
                                <FormControlLabel value="PLIK" control={<Radio/>} label="Plik"/>
                                <FormControlLabel value="LINK" control={<Radio/>} label="Link"/>
                            </RadioGroup>
                        </FormControl>
                        {formData.type === "PLIK" ? (
                            <Button variant="contained" component="label">
                                Wybierz plik
                                <input type="file" hidden
                                       onChange={(e) => handleFormChange('file', e.target.files[0])}/>
                            </Button>
                        ) : (
                            <TextField
                                label="Link"
                                fullWidth
                                value={formData.link}
                                onChange={(e) => handleFormChange('link', e.target.value)}
                            />
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAddClose}>Anuluj</Button>
                    <Button onClick={handleFormSubmit} variant="contained">Dodaj</Button>
                </DialogActions>
            </Dialog>


        </div>
    );
};

export default Learning;
