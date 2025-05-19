import React, {useState, useEffect, useMemo} from 'react';
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
    RadioGroup,
    FormLabel,
    Radio,
    Divider,
    CircularProgress
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import LinkIcon from '@mui/icons-material/Link';
import client from "../../client";
import {API_BASE_URL} from "../../config";
import Alert from "@mui/material/Alert";
import {Cloud} from "@mui/icons-material";

const Learning = () => {
    const [allResources, setAllResources] = useState([]);
    const [fields, setFields] = useState([]);
    const [courses, setCourses] = useState([]);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        name: '',
        kierunek: '',
        przedmiot: '',
        tylkoMoje: false,
        zweryfikowane: false,
        sort: 'desc',
    });

    const [appliedFilters, setAppliedFilters] = useState({});
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("access");

    // Filtruj przedmioty na podstawie wybranego kierunku
    const filteredCourses = useMemo(() => {
        if (!filters.kierunek) return [];
        const field = fields.find(f => f.id === filters.kierunek);
        console.log(field)
        if (!field) return [];
        return courses.filter(course => course.field[0] === field.id);

    }, [filters.kierunek, fields, courses]);


    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await client.get(API_BASE_URL + "sources/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },

            });

            setAllResources(response.data);
            setPage(1); // reset strony

            // Pobierz kierunki tylko jeśli jeszcze ich nie mamy
            if (fields.length === 0) {
                const resp = await client.get(API_BASE_URL + "fields/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                setFields(resp.data);
            }

        } catch (error) {
            console.error("Błąd pobierania danych:", error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = async () => {
        setAppliedFilters({...filters});
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
                ordering: filters.sort === 'desc' ? '-date_added' : 'date_added',
            }
        });

        setAllResources(response.data)
    };

    // courses - > ogranicznik ze względu na złożoność

    const fetchCourses = async () => {
        if (courses.length === 0) {
            const respo = await client.get(API_BASE_URL + "courses/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setCourses(respo.data);
        }
    }

    useEffect(() => {
        fetchData();
        fetchCourses()
    }, []);


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
            link.download = selectedResource?.file.slice(35);
            link.click();
        }
        handleClose();
    };

    const handleFilterChange = (field, value) => {
        // Jeśli zmieniamy kierunek, resetujemy przedmiot
        if (field === 'kierunek') {
            setFilters(prev => ({
                ...prev,
                [field]: value,
                przedmiot: ''
            }));
        } else {
            setFilters(prev => ({...prev, [field]: value}));
        }
    };

    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        kierunek: '',
        przedmiot: '',
        type: 'PLIK',
        file: null,
        link: '',
        availability: 'PUBLIC'
    });
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const filteredAddCourses = useMemo(() => {
        if (!formData.kierunek) return [];
        const field = fields.find(f => f.id === formData.kierunek);
        console.log(field)
        if (!field) return [];
        return courses.filter(course => course.field[0] === field.id);

    }, [formData.kierunek, fields, courses]);


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
        console.log("ddeed")
        // Jeśli zmieniamy kierunek, resetujemy przedmiot
        if (field === 'kierunek') {
            setFormData(prev => ({
                ...prev,
                [field]: value,
                przedmiot: ''
            }));
        } else {
            setFormData(prev => ({...prev, [field]: value}));
        }
    };

    const handleFormSubmit = async () => {
        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("field", formData.kierunek);
        data.append("subject", formData.przedmiot);
        data.append("type", formData.type);
        data.append("availability", formData.availability);
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
            fetchData();
        } catch (err) {
            console.error("Błąd przy dodawaniu zasobu:", err);
        }
    };

    return (
        <Box sx={{
            p: {xs: 2, md: 4},
            maxWidth: 1200,
            mx: 'auto'
        }}>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
            >
                <Alert severity="success" sx={{width: '100%'}}>
                    Zasób został dodany pomyślnie!
                </Alert>
            </Snackbar>

            <Typography variant="h4" sx={{
                mb: 3,
                fontWeight: 600,
                color: 'text.primary'
            }}>
                Dostępne zasoby
            </Typography>

            {/* Filters */}
            <Box sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                backgroundColor: 'background.paper',
                boxShadow: 1
            }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                        <TextField
                            fullWidth
                            label="Wyszukaj po nazwie"
                            variant="outlined"
                            value={filters.name}
                            onChange={(e) => handleFilterChange('name', e.target.value)}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={applyFilters}
                            disabled={loading}
                            sx={{height: 40}}
                        >
                            {loading ? <CircularProgress size={24}/> : 'Wyszukaj'}
                        </Button>
                    </Grid>
                </Grid>

                <Divider sx={{my: 3}}/>

                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Autocomplete
                            options={fields}
                            getOptionLabel={(option) =>
                                `${option.name} (${option.type})`}
                            value={fields.find(f => f.id === filters.kierunek) || null}
                            onChange={(e, val) => handleFilterChange('kierunek', val?.id || '')}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Kierunek"
                                    variant="outlined"
                                    size="small"
                                />
                            )}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Autocomplete
                            options={filteredCourses}
                            getOptionLabel={(option) => option.name}
                            value={courses.find(c => c.id === filters.przedmiot) || null}
                            onChange={(e, val) => handleFilterChange('przedmiot', val?.id || '')}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Przedmiot"
                                    variant="outlined"
                                    size="small"
                                    disabled={!filters.kierunek}
                                />
                            )}
                            fullWidth
                            disabled={!filters.kierunek}
                        />
                    </Grid>

                    <Grid item xs={6} sm={3}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={filters.tylkoMoje}
                                    onChange={(e) => handleFilterChange('tylkoMoje', e.target.checked)}
                                    color="primary"
                                />
                            }
                            label="Tylko moje"
                        />
                    </Grid>

                    <Grid item xs={6} sm={3}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={filters.zweryfikowane}
                                    onChange={(e) => handleFilterChange('zweryfikowane', e.target.checked)}
                                    color="primary"
                                />
                            }
                            label="Zweryfikowane"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3} lg={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Sortuj</InputLabel>
                            <Select
                                value={filters.sort}
                                onChange={(e) => handleFilterChange('sort', e.target.value)}
                                label="Sortuj"
                            >
                                <MenuItem value="desc">Od najnowszych</MenuItem>
                                <MenuItem value="asc">Od najstarszych</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>

            {/* Resource list */}
            {loading ? (
                <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}>
                    <CircularProgress/>
                </Box>
            ) : (
                <>
                    <List sx={{mb: 2}}>
                        {paginatedData.length > 0 ? paginatedData.map((resource, idx) => (
                            <ListItem
                                key={idx}
                                sx={{
                                    backgroundColor: 'background.paper',
                                    mb: 1,
                                    borderRadius: 1,
                                    boxShadow: 1
                                }}
                                secondaryAction={
                                <>
                                    {resource.type === "LINK" ?
                                        <IconButton
                                            onClick={resource.verified ? () => {
                                                window.open(resource.link);
                                            } : () => handleClickOpen(resource)}
                                            edge="end"
                                            color="primary"
                                        >
                                            <LinkIcon/>
                                        </IconButton>
                                        :
                                        <IconButton
                                            onClick={resource.verified ? () => {
                                                const link = document.createElement('a');
                                                link.href = resource.file?.slice(16);
                                                link.download = resource.file.slice(35);
                                                link.click();
                                            } : () => handleClickOpen(resource)}
                                            edge="end"
                                            color="primary"
                                        >
                                            <ArrowCircleDownIcon/>
                                        </IconButton>}
                                </>
                                }
                            >
                                <ListItemIcon>
                                    <Badge
                                        color={resource.verified ? "success" : "error"}
                                        badgeContent={resource.verified ? "✓" : "!"}
                                        anchorOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'right',
                                        }}
                                    >
                                        <InsertDriveFileIcon color="action"/>
                                    </Badge>
                                </ListItemIcon>
                                <ListItemText 
                                    primary={
                                        <Typography variant="subtitle1" sx={{fontWeight: 500}}>
                                            {resource.title}
                                        </Typography>
                                    }
                                    secondary={
                                        <>
                                            <Typography variant="body2" color="text.secondary">
                                                Dodano przez: {resource.added_by.username}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Data dodania: {new Date(resource.date_added).toLocaleTimeString()}, {new Date(resource.date_added).toLocaleDateString()}
                                            </Typography>
                                            <Chip
                                                label={resource.field.name}
                                                size="small"
                                                sx={{
                                                    backgroundColor: 'black',
                                                    color: 'primary.contrastText',
                                                    m: 1,
                                                    ml: 0
                                                }}
                                            />
                                            {resource.course && (
                                                <Chip
                                                    label={resource.course.name}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: 'secondary.dark',
                                                        color: 'secondary.contrastText',
                                                    }}
                                                />
                                            )}


                                        </>

                                    }
                                    sx={{mr: 2}}
                                />

                            </ListItem>
                        )) : (
                            <Box sx={{
                                textAlign: 'center',
                                p: 4,
                                backgroundColor: 'background.paper',
                                borderRadius: 2,
                                boxShadow: 1
                            }}>
                                <Typography variant="h6" color="text.secondary">
                                    Brak wyników wyszukiwania
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                                    Spróbuj zmienić kryteria wyszukiwania
                                </Typography>
                            </Box>
                        )}
                    </List>

                    {/* Paginator */}
                    {totalPages > 1 && (
                        <Box display="flex" justifyContent="center" mt={3}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(e, value) => setPage(value)}
                                color="primary"
                            />
                        </Box>
                    )}
                </>
            )}

            {/* Add resource FAB */}
            <Fab
                color="primary"
                aria-label="add"
                sx={{
                    position: 'fixed',
                    bottom: {xs: 16, md: 24},
                    right: {xs: 16, md: 24},
                    zIndex: 1000
                }}
                onClick={handleAddClick}
            >
                <AddIcon/>
            </Fab>

            {/* Resource warning dialog */}
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title" sx={{fontWeight: 600}}>
                    {selectedResource?.type === "LINK" ? "Niezweryfikowany link" : "Niezweryfikowany plik"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description" sx={{mt: 2}}>
                        {selectedResource?.type === "LINK" ?
                            "Link do tego źródła nie został przez nas jeszcze zweryfikowany, co oznacza, że może być niebezpieczny! Przy przechodzeniu na stronę zachowaj ostrożność." :
                            "Plik nie został przez nas jeszcze zweryfikowany, co oznacza, że może być niebezpieczny! Przy pobieraniu nieznanych plików zachowaj ostrożność."
                        }
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{p: 2}}>
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                        sx={{mr: 2}}
                    >
                        Anuluj
                    </Button>
                    <Button
                        onClick={handleProceed}
                        autoFocus
                        variant="contained"
                        color="primary"
                    >
                        {selectedResource?.type === "LINK" ? "Przejdź" : "Pobierz"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add resource dialog */}
            <Dialog
                open={addDialogOpen}
                onClose={handleAddClose}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{
                    backgroundColor: "primary.main",
                    color: "primary.contrastText",
                    py: 2,
                    fontWeight: 600
                }}>
                    Dodaj nowy zasób
                </DialogTitle>
                <DialogContent sx={{pt: 3}}>
                    <Box display="flex" flexDirection="column" gap={3} mt={2}>
                        <TextField
                            label="Tytuł *"
                            fullWidth
                            variant="outlined"
                            size="small"
                            value={formData.title}
                            onChange={(e) => handleFormChange('title', e.target.value)}
                        />

                        <TextField
                            label="Opis"
                            fullWidth
                            multiline
                            minRows={3}
                            variant="outlined"
                            size="small"
                            value={formData.description}
                            onChange={(e) => handleFormChange('description', e.target.value)}
                        />

                        <FormControl component="fieldset">
                            <FormLabel component="legend">Dostępność</FormLabel>
                            <RadioGroup
                                row
                                value={formData.availability || 'PUBLIC'}
                                onChange={(e) => handleFormChange('availability', e.target.value)}
                                sx={{mt: 1}}
                            >
                                <FormControlLabel
                                    value='PUBLIC'
                                    control={<Radio color="primary"/>}
                                    label="Publiczne"
                                    sx={{ml: 1}}
                                />
                                <FormControlLabel
                                    value='RESTRICTED'
                                    control={<Radio color="primary"/>}
                                    label="Tylko ja i moje grupy"
                                    sx={{ml: 1}}
                                />

                                <FormControlLabel
                                    value='PRIVATE'
                                    control={<Radio color="primary"/>}
                                    label="Prywatne"
                                    sx={{ml: 1}}
                                />
                            </RadioGroup>
                        </FormControl>

                        <Autocomplete
                            options={fields}
                            getOptionLabel={(option) => `${option.name} (${option.type})`}
                            value={fields.find(f => f.id === formData.kierunek) || null}
                            onChange={(e, val) => handleFormChange('kierunek', val?.id || '')}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Kierunek *"
                                    variant="outlined"
                                    size="small"
                                />
                            )}
                        />

                        <Autocomplete
                            options={filteredAddCourses}
                            getOptionLabel={(option) => option.name}
                            value={courses.find(c => c.id === formData.przedmiot) || null}
                            onChange={(e, val) => handleFormChange('przedmiot', val?.id || '')}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Przedmiot"
                                    variant="outlined"
                                    size="small"
                                    disabled={!formData.kierunek}
                                />
                            )}
                            disabled={!formData.kierunek}
                        />


                        <FormControl component="fieldset">
                            <FormLabel component="legend">Typ zasobu *</FormLabel>
                            <RadioGroup
                                row
                                value={formData.type}
                                onChange={(e) => handleFormChange('type', e.target.value)}
                                sx={{mt: 1}}
                            >
                                <FormControlLabel
                                    value="PLIK"
                                    control={<Radio color="primary"/>}
                                    label="Plik"
                                    sx={{ml: 1}}
                                />
                                <FormControlLabel
                                    value="LINK"
                                    control={<Radio color="primary"/>}
                                    label="Link"
                                    sx={{ml: 3}}
                                />
                            </RadioGroup>
                        </FormControl>

                        {formData.type === "PLIK" ? (
                            <Box>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    color="primary"
                                    startIcon={<Cloud/>}
                                    size="small"
                                    sx={{mb: 1}}
                                >
                                    {formData.file ? "Zmień plik" : "Wybierz plik *"}
                                    <input
                                        type="file"
                                        hidden
                                        onChange={(e) => handleFormChange('file', e.target.files?.[0])}
                                    />
                                </Button>
                                {formData.file && (
                                    <Typography variant="body2" sx={{ml: 1, display: "inline"}}>
                                        <b>Wybrany
                                            plik:</b> {formData.file.name.length > 40 ? formData.file.name.slice(0, 40) + "..." : formData.file.name}
                                    </Typography>
                                )}
                            </Box>
                        ) : (
                            <TextField
                                label="Link *"
                                fullWidth
                                variant="outlined"
                                size="small"
                                value={formData.link}
                                onChange={(e) => handleFormChange('link', e.target.value)}
                            />
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{px: 3, py: 2}}>
                    <Button
                        onClick={handleAddClose}
                        variant="outlined"
                        color="primary"
                        sx={{width: 120}}
                    >
                        Anuluj
                    </Button>
                    <Button
                        onClick={handleFormSubmit}
                        variant="contained"
                        color="primary"
                        sx={{width: 120}}
                        disabled={!formData.title || !formData.kierunek ||
                            (formData.type === "PLIK" && !formData.file) ||
                            (formData.type === "LINK" && !formData.link)}
                    >
                        Dodaj
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Learning;