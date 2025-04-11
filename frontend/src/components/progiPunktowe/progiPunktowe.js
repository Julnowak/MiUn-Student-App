import React, {useState} from 'react';
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
    Stack, Grid,
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

const kierunki = [
    {label: 'Informatyka', g1: ['Matematyka', 'Fizyka'], g2: ['Informatyka', 'Język angielski']},
    {label: 'Biotechnologia', g1: ['Biologia', 'Chemia'], g2: ['Matematyka', 'Fizyka']},
];

const wszystkiePrzedmioty = [
    'Matematyka', 'Fizyka', 'Informatyka', 'Język angielski', 'Biologia', 'Chemia', 'Geografia', 'Historia'
];

const ProgiPunktowe = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [trybWszystkie, setTrybWszystkie] = useState(false);
    const [selectedKierunek, setSelectedKierunek] = useState(null);
    const [g1, setG1] = useState('');
    const [g2, setG2] = useState('');
    const [g1Score, setG1Score] = useState(0);
    const [g2Score, setG2Score] = useState(0);
    const [allSubjects, setAllSubjects] = useState({});
    const [results, setResults] = useState([]);

    const handleTabChange = (_, newValue) => setSelectedTab(newValue);

    const handleCalculate = () => {
        if (trybWszystkie) {
            const wyniki = kierunki.map((kierunek) => {
                const score = kierunek.g1.concat(kierunek.g2).reduce((acc, subj) => {
                    return acc + (allSubjects[subj] || 0);
                }, 0);
                return {kierunek: kierunek.label, score};
            }).sort((a, b) => b.score - a.score);
            setResults(wyniki);
            setSelectedTab(1);
        } else {
            if (selectedKierunek) {
                const score = parseInt(g1Score) + parseInt(g2Score);
                setResults([{kierunek: selectedKierunek.label, score}]);
                setSelectedTab(0);
            }
        }
    };

    const filteredG2Subjects = selectedKierunek ? selectedKierunek.g2.filter(subj => subj !== g1) : [];

    const theme = useTheme();
    const chartRef = React.useRef(null);

    const labels = ['2021', '2022', '2023', '2024', '2025'];

    const data = {
        labels,
        datasets: [
            {
                label: 'Tura 1',
                data: [85, 87, 88, 89, 91],
                borderColor: theme.palette.primary.main,
                backgroundColor: theme.palette.primary.light,
                pointRadius: 4,
                tension: 0.4,
            },
            {
                label: 'Tura 2',
                data: [84, 86, 89, 90, 92],
                borderColor: theme.palette.success.main,
                backgroundColor: theme.palette.success.light,
                pointRadius: 4,
                tension: 0.4,
            },
            {
                label: 'Tura 3',
                data: [86, 88, 90, 91, 93],
                borderColor: theme.palette.warning.main,
                backgroundColor: theme.palette.warning.light,
                pointRadius: 4,
                tension: 0.4,
            },
            {
                label: 'Predykcja - środek',
                data: [null, null, null, 92, 94],
                borderColor: theme.palette.error.main,
                pointRadius: 3,
                borderDash: [6, 4],
                tension: 0.3,
            },
            {
                label: 'Predykcja - zakres',
                data: [null, null, null, 89, 91],
                borderColor: 'rgba(255, 87, 34, 0.2)',
                backgroundColor: 'rgba(255, 87, 34, 0.2)',
                pointRadius: 0,
                fill: {
                    target: '+1', // fill between this and the next dataset
                    above: 'rgba(255, 87, 34, 0.2)',
                    below: 'rgba(255, 87, 34, 0.2)',
                },
            },
            {
                label: 'Predykcja - górna',
                data: [null, null, null, 95, 97],
                borderColor: 'rgba(255, 87, 34, 0.0)',
                pointRadius: 0,
            },
            {
                label: 'Użytkownik',
                data: [null, null, null, 91, null],
                borderColor: theme.palette.error.dark,
                backgroundColor: theme.palette.error.dark,
                pointRadius: 7,
                type: 'line',
                showLine: false,
            },
        ],
    };

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

            {!trybWszystkie ? (
                <Box margin={2}>
                    <Autocomplete
                        options={kierunki}
                        getOptionLabel={(option) => option.label}
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
                                        <InputLabel>G1</InputLabel>
                                        <Select value={g1} label="G1" onChange={(e) => setG1(e.target.value)}>
                                            {selectedKierunek.g1.map((subject) => (
                                                <MenuItem key={subject} value={subject}>{subject}</MenuItem>
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
                                        onChange={(e) => setG1Score(e.target.value)}
                                        sx={{mb: 2}}
                                        inputProps={{min: 0, max: 100}}
                                    />

                                </Grid>
                            </Grid>

                            <Grid container spacing={2} alignItems="center" mb={2}>
                                <Grid item xs={6}>
                                    <FormControl fullWidth sx={{mb: 2}}>
                                        <InputLabel>G2</InputLabel>
                                        <Select value={g2} label="G2" onChange={(e) => setG2(e.target.value)}>
                                            {filteredG2Subjects.map((subject) => (
                                                <MenuItem key={subject} value={subject}>{subject}</MenuItem>
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
                                        onChange={(e) => setG2Score(e.target.value)}
                                        sx={{mb: 2}}
                                        inputProps={{min: 0, max: 100}}
                                    />
                                </Grid>
                            </Grid>
                        </>
                    )}
                </Box>
            ) : (
                <>
                    <Grid container spacing={2} alignItems="center" mb={2}>
                        {wszystkiePrzedmioty.map((subject) => (
                            <Grid item xs={6}>
                                <Box key={subject} display="flex" alignItems="center" mb={1}>
                                    <Typography sx={{width: 200}}>{subject}</Typography>
                                    <TextField
                                        type="number"
                                        value={allSubjects[subject] || 0}
                                        onChange={(e) =>
                                            setAllSubjects({
                                                ...allSubjects,
                                                [subject]: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)),
                                            })
                                        }
                                        inputProps={{min: 0, max: 100}}
                                        sx={{width: 100}}
                                    />
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}

            <Box mt={3}>
                <Button variant="contained" onClick={handleCalculate}>Oblicz</Button>
            </Box>

            {selectedTab === 0 && !trybWszystkie && results.length > 0 && (
                <Paper sx={{p: 3, mt: 4}}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6">Wynik użytkownika: 91 punktów</Typography>
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
