import React, {useEffect, useState} from 'react';
import {
    Autocomplete,
    Box,
    Button,
    Container,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Tab,
    Tabs,
    TextField,
    Typography,
    Paper,
    Stack, Grid, FormHelperText, Stepper, Step, StepLabel, CircularProgress,
} from '@mui/material';

import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import {Line} from 'react-chartjs-2';
import {
    useTheme,
    IconButton,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import client from "../../client";
import {API_BASE_URL} from "../../config";
import {Delete} from "@mui/icons-material";
import ResultsStep from "./resultStep";
import SendIcon from "@mui/icons-material/Send";

ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
    Filler,
    zoomPlugin
);


const ProgiPunktowe = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [trybWszystkie, setTrybWszystkie] = useState(false);
    const [selectedKierunek, setSelectedKierunek] = useState(null);
    const [g1, setG1] = useState('');
    const [g2, setG2] = useState('');
    const [g1Score, setG1Score] = useState(0);
    const [g2Score, setG2Score] = useState(0);
    const [mScore, setMScore] = useState(0);
    const [val, setVal] = useState(0);
    const [results, setResults] = useState([]);
    const [resultsAll, setResultsAll] = useState([]);
    const [fields, setFields] = useState([]);
    const [allSubjects, setAllSubjects] = useState([]);
    const [allMenuSubjects, setAllMenuSubjects] = useState([]);
    const [allBasicSubjects, setAllBasicSubjects] = useState([]);
    const [allScores, setAllScores] = useState([]);
    const [rounds, setRounds] = useState([]);

    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState("");
    const [GeminiResults, setGeminiResults] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setResponse("");
        setError("");

        try {
            const res = await client.post(
                API_BASE_URL + "ask-gemini/",
                {
                    prompt: prompt,
                    results: resultsAll
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            setResponse(res.data.response);
            setGeminiResults(res.data.results);
        } catch (err) {
            console.log(err)
            setError("Network error.");
        } finally {
            setLoading(false);
        }
    };


    const handleTabChange = (_, newValue) => setSelectedTab(newValue);

    const handleCalculate = async () => {
        if (trybWszystkie) {

            const response = await client.post(API_BASE_URL + "calculation/", {
                    "tryb": "many",
                    "przedmioty": allBasicSubjects,
                    "wyniki": allScores
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

            setResultsAll(response.data)
            setSelectedTab(1);
        } else {

            try {
                const response = await client.post(API_BASE_URL + "calculation/", {
                        "tryb": "one",
                        "G1": g1Score,
                        "G2": g2Score,
                        "M": mScore,
                        "field": selectedKierunek
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                setVal(response.data.score)
                setRounds(response.data.rounds)
            } catch (error) {
                console.error("Błąd pobierania danych:", error);
            }

            if (selectedKierunek) {
                const score = parseInt(g1Score) + parseInt(g2Score);
                setResults([{kierunek: selectedKierunek.label, score}]);
                setSelectedTab(0);
            }
        }
    };

    const token = localStorage.getItem("access");
    const fetchData = async () => {
        try {
            const response = await client.get(API_BASE_URL + "fields/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setFields(response.data);
        } catch (error) {
            console.error("Błąd pobierania danych:", error);
        }

        try {
            const response = await client.get(API_BASE_URL + "maturasubjects/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAllSubjects(response.data);
            setAllBasicSubjects(response.data.filter(sub => sub.name === "Matematyka"));
            setAllMenuSubjects(response.data.filter(sub => sub.name !== "Matematyka"));
        } catch (error) {
            console.error("Błąd pobierania danych:", error);
        }
    };


    useEffect(() => {
        if (fields.length < 1) {
            fetchData();
        }
    }, [fields.length, fetchData]);

    const theme = useTheme();
    const chartRef = React.useRef(null);
    const [activeStep, setActiveStep] = useState(0);

    const processRecruitmentData = (toursData, userValue) => {
        // 1. Grupowanie danych po turze i roku
        const tours = {};
        const yearsSet = new Set();

        toursData.forEach(tour => {
            const year = tour.year.split('/')[0]; // np. "2021/2022" → "2021"
            const tourName = tour.name.replace(' TURA', '').trim(); // "I TURA" → "I"

            if (!tours[tourName]) {
                tours[tourName] = {};
            }
            tours[tourName][year] = tour.min_threshold;
            yearsSet.add(year);
        });

        // 2. Dodanie dodatkowego roku (ostatni rok + 1)
        const sortedYears = Array.from(yearsSet).sort();
        const lastYear = parseInt(sortedYears[sortedYears.length - 1]);
        const extendedYears = [...sortedYears, String(lastYear + 1)];
        const labels = extendedYears;

        // 3. Kolory dla różnych tur (możesz dostosować)
        const tourColors = {
            'I': {
                border: theme.palette.primary.main,
                background: 'rgba(63, 81, 181, 0.2)', // półprzezroczysty primary
            },
            'II': {
                border: theme.palette.success.main,
                background: 'rgba(76, 175, 80, 0.2)', // półprzezroczysty success
            },
            'III': {
                border: theme.palette.warning.main,
                background: 'rgba(255, 152, 0, 0.2)', // półprzezroczysty warning
            },
        };

        // 4. Tworzenie datasetów dla każdej tury (z wypełnieniem)
        const datasets = Object.keys(tours).map(tourName => {
            const data = extendedYears.map(year => tours[tourName][year] || null);

            return {
                label: `Tura ${tourName}`,
                data,
                borderColor: tourColors[tourName]?.border,
                backgroundColor: tourColors[tourName]?.background,
                pointRadius: 4,
                tension: 0.4,
                fill: true, // wypełnienie pod linią
            };
        });

        // 5. Dodanie wartości użytkownika (tylko ostatni rok)
        if (userValue !== undefined) {
            const userData = extendedYears.map(() => null);
            userData[extendedYears.length - 2] = userValue; // przedostatni rok (bo ostatni to dodany)

            datasets.push({
                label: 'Twój wynik',
                data: userData,
                borderColor: theme.palette.error.dark,
                backgroundColor: theme.palette.error.dark,
                pointRadius: 7,
                type: 'line',
                showLine: false,
            });
        }

        return {labels, datasets};
    };

    const data = processRecruitmentData(rounds, val);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                enabled: true,
            },
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'x',
                },
                zoom: {
                    wheel: {enabled: true},
                    pinch: {enabled: true},
                    mode: 'x',
                },
            },
        },
        scales: {
            y: {
                beginAtZero: false,
                title: {
                    display: true,
                    text: 'Punkty',
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Rok',
                },
            },
        },
    };

    const resetZoom = () => {
        if (chartRef.current) {
            chartRef.current.resetZoom();
        }
    };


// Filtruj przedmioty G2, aby wykluczyć wybrany w G1
    const availableG2Subjects = selectedKierunek?.G2_subject?.filter(
        subject => subject.id !== g1
    ) || [];

// Filtruj przedmioty G1, aby wykluczyć wybrany w G2
    const availableG1Subjects = selectedKierunek?.G1_subject?.filter(
        subject => subject.id !== g2
    ) || [];

    const handleG1Change = (e) => {
        setG1(e.target.value);
        // Jeśli nowo wybrany przedmiot w G1 był wybrany w G2, wyczyść G2
        if (e.target.value === g2) {
            setG2('');
        }
    };

    const handleG2Change = (e) => {
        setG2(e.target.value);
        // Jeśli nowo wybrany przedmiot w G2 był wybrany w G1, wyczyść G1
        if (e.target.value === g1) {
            setG1('');
        }
    };

    return (
        <Container sx={{mt: 4}}>
            <Typography variant="h4" gutterBottom align="center">Rekrutacja</Typography>

            <Tabs mb={2} value={selectedTab} onChange={handleTabChange}>
                <Tab variant={trybWszystkie ? 'outlined' : 'contained'} onClick={() => setTrybWszystkie(false)}
                     sx={{mr: 2}}
                     label="Wybrany kierunek"/>
                Wybrany kierunek
                <Tab onClick={() => setTrybWszystkie(true)}
                     label="Wszystkie kierunki"/>
            </Tabs>

            {trybWszystkie ? (
                <Box sx={{margin: 3}}>
                    <Stepper activeStep={activeStep} alternativeLabel sx={{mb: 4}}>
                        {['Przedmioty', 'Zainteresowania', 'Wynik'].map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {activeStep === 0 && (
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom sx={{fontWeight: 600, color: 'primary.main'}}>
                                    Wprowadź swoje wyniki maturalne
                                </Typography>
                            </Grid>

                            {['PD', 'ROZ'].map((level) => {
                                // Lista dostępnych przedmiotów dla danego poziomu
                                return (
                                    <Grid item xs={12} md={6} key={level}>
                                        <Paper sx={{p: 3, borderRadius: 4, boxShadow: 3}}>
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                mb: 2
                                            }}>
                                                <Typography variant="subtitle1" sx={{color: 'text.secondary'}}>
                                                    Poziom {level === 'PD' ? 'podstawowy' : 'rozszerzony'}
                                                </Typography>

                                                <Box sx={{display: 'flex', gap: 1}}>
                                                    <FormControl size="small" sx={{minWidth: 180}}>
                                                        <Select
                                                            value=""
                                                            onChange={(e) => {
                                                                const selectedSubject = allMenuSubjects.find(
                                                                    subject => subject.id === e.target.value
                                                                );
                                                                if (selectedSubject) {
                                                                    setAllBasicSubjects([...allBasicSubjects, selectedSubject]);
                                                                    setAllMenuSubjects(allMenuSubjects.filter(
                                                                        subject => subject.id !== selectedSubject.id
                                                                    ));
                                                                }
                                                            }}
                                                            displayEmpty
                                                            disabled={allMenuSubjects.filter(subject => subject.level === level).length === 0}
                                                            MenuProps={{
                                                                PaperProps: {
                                                                    style: {
                                                                        maxHeight: 250,  // Maksymalna wysokość przed pojawieniem się scrollbara
                                                                        overflow: 'auto', // Wymusza pojawienie się scrollbara
                                                                    },
                                                                },
                                                            }}
                                                        >
                                                            <MenuItem value="" disabled>
                                                                {allMenuSubjects.filter(subject => subject.level === level).length === 0
                                                                    ? 'Brak przedmiotów'
                                                                    : 'Wybierz przedmiot'}
                                                            </MenuItem>
                                                            {allMenuSubjects
                                                                .filter(subject => subject.level === level)
                                                                .map((subject) => (
                                                                    <MenuItem key={subject.id} value={subject.id}>
                                                                        {subject.name}
                                                                    </MenuItem>
                                                                ))}
                                                        </Select>
                                                    </FormControl>
                                                </Box>
                                            </Box>

                                            {/* Wyświetlanie dodanych przedmiotów */}
                                            {allBasicSubjects.filter(sub => sub.level === level)
                                                .map((subject) => (
                                                    <Box key={subject.id} sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        mb: 2,
                                                        p: 2,
                                                        borderRadius: 2,
                                                        bgcolor: 'background.paper',
                                                        '&:hover': {bgcolor: 'action.hover'}
                                                    }}>
                                                        <Typography sx={{flexGrow: 1, mr: 2}}>
                                                            {subject.name}
                                                        </Typography>
                                                        <TextField
                                                            type="number"
                                                            variant="outlined"
                                                            size="small"
                                                            value={allScores[subject.id] || 0}
                                                            onChange={(e) => setAllScores({
                                                                ...allScores,
                                                                [subject.id]: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                                                            })}
                                                            inputProps={{
                                                                min: 0,
                                                                max: 100,
                                                                style: {textAlign: 'center'}
                                                            }}
                                                            sx={{width: 100}}
                                                        />
                                                        <IconButton
                                                            onClick={() => {
                                                                const filteredSubjects = allBasicSubjects.filter(s => s.id !== subject.id);
                                                                setAllMenuSubjects([...allMenuSubjects, subject])
                                                                setAllBasicSubjects(filteredSubjects);

                                                                const newScores = {...allScores};
                                                                delete newScores[subject.id];
                                                                setAllScores(newScores);
                                                            }}
                                                            sx={{ml: 1}}
                                                        >
                                                            <Delete fontSize="small"/>
                                                        </IconButton>
                                                    </Box>
                                                ))}
                                        </Paper>
                                    </Grid>
                                );
                            })}


                        </Grid>
                    )}

                    {activeStep === 1 && (
                        <Box sx={{
                            textAlign: 'center',
                            p: 4,
                            border: '2px dashed',
                            borderColor: 'divider',
                            borderRadius: 4
                        }}>
                            <Container maxWidth="sm" sx={{mt: 6}}>
                                    <Typography variant="h5" sx={{textAlign: "left"}} gutterBottom>
                                        Cześć!
                                    </Typography>
                                    <Typography variant="body2" sx={{textAlign: "left", pb: 2}} gutterBottom>
                                        Wpisz swoje zainteresowania i preferencje odnośnie kierunku, a MiUn postara się
                                        wybrać dla Ciebie najodpowiedniejsze kierunki.
                                    </Typography>
                                    <TextField
                                        label="Opowiedz nam coś o sobie!"
                                        multiline
                                        rows={4}
                                        fullWidth
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        variant="outlined"
                                        sx={{mb: 2}}
                                    />
                            </Container>
                        </Box>
                    )}

                    {activeStep === 2 && (
                        <ResultsStep results={GeminiResults} response={response} setActiveStep={setActiveStep}/>
                    )}

                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mt: 4,
                        gap: 2
                    }}>

                        {activeStep < 2 ? (
                            <>
                                <Button
                                    variant="outlined"
                                    disabled={activeStep === 0}
                                    onClick={() => setActiveStep(s => s - 1)}
                                >
                                    Wstecz
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={async () => {
                                        if (activeStep === 0) {
                                            await handleCalculate();
                                        }
                                        if (activeStep === 1) {
                                            await handleSubmit();

                                        }
                                        setActiveStep(s => s + 1);
                                    }}
                                >
                                    {activeStep === 1 ? (loading ?
                                        <CircularProgress size={24} color="inherit"/> : "Dalej") : 'Dalej'}
                                </Button>
                            </>

                        ) : null}
                    </Box>
                </Box>
            ) : (
                <Box margin={2}>
                    <Autocomplete
                        options={fields}
                        getOptionLabel={(option) => option.name + " (" + option.type + ")" || ''}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        getOptionKey={(option) => option.id}  // Explicitly specify unique key
                        onChange={(_, value) => {
                            setSelectedKierunek(value);
                            setG1('');
                            setG2('');
                        }}
                        renderInput={(params) => <TextField {...params} label="Kierunek studiów"/>}
                        sx={{mb: 2}}
                    />
                    {selectedKierunek && (
                        <>
                            <Grid container spacing={2} alignItems="center" mb={2}>
                                <Grid item xs={6}>
                                    <FormControl fullWidth sx={{mb: 2}}>
                                        <InputLabel id="demo-simple-select-readonly-label">M</InputLabel>
                                        <Select
                                            labelId="demo-simple-select-readonly-label"
                                            id="demo-simple-select-readonly"
                                            value={"10"}
                                            label="M"
                                            inputProps={{readOnly: true}}
                                        >
                                            <MenuItem value="10">
                                                Matematyka podstawowa
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Wynik M"
                                        value={mScore}
                                        onChange={(e) => {
                                            console.log(e.target.value)
                                            if (e.target.value > 100) {
                                                setMScore(100)
                                            } else if (e.target.value < 0) {
                                                setMScore(0)
                                            } else {
                                                setMScore(e.target.value)
                                            }

                                        }}
                                        sx={{mb: 2}}
                                        inputProps={{min: 0, max: 100}}
                                    />

                                </Grid>
                            </Grid>

                            <Grid container spacing={2} alignItems="center" mb={2}>
                                <Grid item xs={6}>
                                    <FormControl fullWidth sx={{mb: 2}}>
                                        <InputLabel>G1</InputLabel>
                                        <Select
                                            value={g1}
                                            label="G1"
                                            onChange={handleG1Change}
                                        >
                                            {availableG1Subjects.map((subject) => (
                                                <MenuItem key={subject.id} value={subject.id}>
                                                    {subject.name} rozszerzona
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Wynik G1"
                                        value={g1Score}
                                        onChange={(e) => {
                                            console.log(e.target.value)
                                            if (e.target.value > 100) {
                                                setG1Score(100)
                                            } else if (e.target.value < 0) {
                                                setG1Score(0)
                                            } else {
                                                setG1Score(e.target.value)
                                            }

                                        }}
                                        sx={{mb: 2}}
                                        inputProps={{min: 0, max: 100}}
                                        disabled={g1 ? false : true}
                                    />
                                </Grid>
                            </Grid>

                            <Grid container spacing={2} alignItems="center" mb={2}>
                                <Grid item xs={6}>
                                    <FormControl fullWidth sx={{mb: 2}}>
                                        <InputLabel>G2</InputLabel>
                                        <Select
                                            value={g2}
                                            label="G2"
                                            onChange={handleG2Change}
                                        >
                                            {availableG2Subjects.map((subject) => (
                                                <MenuItem key={subject.id} value={subject.id}>
                                                    {subject.name} rozszerzona
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Wynik G2"
                                        value={g2Score}
                                        onChange={(e) => {
                                            console.log(e.target.value)
                                            if (e.target.value > 100) {
                                                setG2Score(100)
                                            } else if (e.target.value < 0) {
                                                setG2Score(0)
                                            } else {
                                                setG2Score(e.target.value)
                                            }

                                        }}
                                        sx={{mb: 2}}
                                        inputProps={{min: 0, max: 100}}
                                        disabled={g2 ? false : true}
                                    />
                                </Grid>
                            </Grid>
                        </>
                    )}
                </Box>
            )}

            {selectedTab === 0 &&
                (<Box sx={{margin: " 3 auto", textAlign: "center"}}>
                    <Button variant="contained" onClick={handleCalculate}>Oblicz</Button>
                </Box>)
            }

            {selectedTab === 0 && !trybWszystkie && results.length > 0 && selectedKierunek && g1 && g2 && (
                <Paper sx={{p: 3, mt: 4}}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6">Wynik użytkownika: {val} punktów</Typography>
                        <IconButton onClick={resetZoom}>
                            <RestartAltIcon/>
                        </IconButton>
                    </Stack>
                    <Box mt={2} sx={{height: 400}}>
                        <Line ref={chartRef} data={data} options={options}/>
                    </Box>
                </Paper>
            )}
        </Container>
    );
};

export default ProgiPunktowe;
