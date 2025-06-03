import React, {useState, useEffect, useMemo} from 'react';
import axios from 'axios';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Pagination,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Grid,
    CircularProgress,
    Divider,
    Autocomplete,
    FormControlLabel,
    Checkbox,
    ListItemIcon,
    Badge,
    Chip,
    DialogContentText, FormLabel, RadioGroup, Radio
} from '@mui/material';
import {
    Add,
    InsertDriveFile,
    Image,
    VideoFile,
    Audiotrack,
    PictureAsPdf, Cloud
} from '@mui/icons-material';
import client from "../../client";
import {API_BASE_URL} from "../../config";
import LinkIcon from "@mui/icons-material/Link";
import ArrowCircleDownIcon from "@mui/icons-material/ArrowCircleDown";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";


const MediaTab = ({groupId}) => {
    // Stany
    const [fileModalOpen, setFileModalOpen] = useState(false);
    const [fileName, setFileName] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [mediaFiles, setMediaFiles] = useState([]);
    const [filterName, setFilterName] = useState('');
    const [sortBy, setSortBy] = useState('-uploaded_at');
    const [page, setPage] = useState(1);
    const [currentGroupId] = useState(1); // Zastąp prawdziwym ID grupy
    const itemsPerPage = 5;
    const token = localStorage.getItem("access");
    const [allResources, setAllResources] = useState([]);
    const [fields, setFields] = useState([]);
    const [courses, setCourses] = useState([]);

    const [filters, setFilters] = useState({
        name: '',
        kierunek: '',
        przedmiot: '',
        zweryfikowane: false,
        sort: 'desc',
    });

    const [appliedFilters, setAppliedFilters] = useState({});
    const [loading, setLoading] = useState(false);


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
            const response = await client.get(API_BASE_URL + `groupsources/${groupId}`, {
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
    const fetchMediaFiles = async () => {
        try {
            const response = await client.get(API_BASE_URL + "sources/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },

            });

            setMediaFiles(response.data);
            setPage(1); // reset strony

        } catch (error) {
            console.error("Błąd pobierania danych:", error);
        }
    };


    useEffect(() => {
        fetchMediaFiles();
    },);

    // Filtrowanie i sortowanie
    const filteredFiles = useMemo(() => {
        let result = [...mediaFiles];

        if (filterName) {
            result = result.filter(file =>
                file.name.toLowerCase().includes(filterName.toLowerCase())
            );
        }

        result.sort((a, b) => {
            if (sortBy === '-uploaded_at') return new Date(b.uploaded_at) - new Date(a.uploaded_at);
            if (sortBy === 'uploaded_at') return new Date(a.uploaded_at) - new Date(b.uploaded_at);
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === '-name') return b.name.localeCompare(a.name);
            return 0;
        });

        return result;
    }, [mediaFiles, filterName, sortBy]);

    // Reset paginacji przy zmianie filtra/sortowania
    useEffect(() => {
        setPage(1);
    }, [filterName, sortBy]);

    // Obsługa plików
    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        if (!fileName.trim()) {
            setFileName(event.target.files[0].name.split('.')[0]);
        }
    };

    const handleFileUpload = async () => {
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('name', fileName);
            formData.append('group', currentGroupId);

            const response = await axios.post('/api/media/upload/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMediaFiles([response.data, ...mediaFiles]);
            setFileModalOpen(false);
            setFileName('');
            setSelectedFile(null);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleDownloadFile = (file) => {
        window.open(file.url, '_blank');
    };

    const getFileIcon = (fileType) => {
        if (!fileType) return <InsertDriveFile/>;

        const type = fileType.split('/')[0];
        switch (type) {
            case 'image':
                return <Image/>;
            case 'video':
                return <VideoFile/>;
            case 'audio':
                return <Audiotrack/>;
            case 'application':
                return <PictureAsPdf/>;
            default:
                return <InsertDriveFile/>;
        }
    };

    return (
        <div>
            {/* Przycisk dodawania pliku i modal */}
            <CardContent>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                }}>
                    <Typography variant="h6">
                        Media
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={handleAddClick}
                    >
                        <Add/>
                    </Button>
                </div>

                <Typography color="textSecondary">
                    Tu znajdziesz pliki dodawane przez członków Twojej grupy.
                </Typography>
            </CardContent>
            <Box sx={{
                p: 3,
                borderRadius: 2,
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

                    <Grid item xs={6} sm={4} md={3}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={filters.zweryfikowane}
                                    onChange={(e) => setFilters({...filters, zweryfikowane: e.target.checked})}
                                    color="primary"
                                />
                            }
                            label="Zweryfikowane"
                        />
                    </Grid>

                    <Grid item xs={6} sm={4} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Sortuj</InputLabel>
                            <Select
                                value={filters.sort}
                                onChange={(e) => setFilters({...filters, sort: e.target.value})}
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
                    <List>
                        {paginatedData.length > 0 ? paginatedData.map((resource, idx) => (
                            <ListItem
                                key={idx}
                                sx={{
                                    mb: 1,
                                    borderRadius: 1,
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
                                                Data
                                                dodania: {new Date(resource.date_added).toLocaleTimeString()}, {new Date(resource.date_added).toLocaleDateString()}
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
                                p: 2,
                                borderRadius: 2,
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

                    {totalPages > 0 ? (
                        <CardContent>
                            {/* Paginacja */}
                            <div style={{display: 'flex', justifyContent: 'center', marginTop: '16px'}}>
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={(_, value) => setPage(value)}
                                    color="primary"
                                    showFirstButton
                                    showLastButton
                                />
                            </div>
                        </CardContent>
                    ) : (
                        <CardContent>
                            <Typography color="textSecondary" align="center">
                                {filterName ? 'Brak plików pasujących do wyszukiwania' : 'Brak plików. Dodaj pierwszy plik!'}
                            </Typography>
                        </CardContent>
                    )}
                </>
            )}


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

        </div>
    );
};

export default MediaTab;