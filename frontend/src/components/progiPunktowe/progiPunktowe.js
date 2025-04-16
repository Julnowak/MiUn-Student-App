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
    Stack, Grid, FormHelperText, Stepper, Step, StepLabel,
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
import {all} from "axios";
import GeminiPrompt from "../geminiPrompt/geminiPrompt";

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
    const [fields, setFields] = useState([]);
    const [allSubjects, setAllSubjects] = useState([]);
    const [allScores, setAllScores] = useState([]);


    const handleTabChange = (_, newValue) => setSelectedTab(newValue);

    const handleCalculate = async () => {
        if (trybWszystkie) {
            const wyniki = fields.map((kierunek) => {
                const score = kierunek.g1.concat(kierunek.g2).reduce((acc, subj) => {
                    return acc + (allSubjects[subj] || 0);
                }, 0);
                return {kierunek: kierunek.label, score};
            }).sort((a, b) => b.score - a.score);
            setResults(wyniki);
            setSelectedTab(1);
        } else {

            try {
                const response = await client.post(API_BASE_URL + "calculation/", {
                        "G1": g1Score,
                        "G2": g2Score,
                        "M": mScore
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                console.log(response.data.score)
                setVal(response.data.score)
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
            console.log(response.data)
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
            console.log(response.data)
            setAllSubjects(response.data);
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
                data: [null, null, null, val, null],
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
   <Box sx={{ margin: 3 }}>
    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
      {['Przedmioty', 'Zainteresowania', 'Wynik'].map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>

    {activeStep === 0 && (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Wprowadź swoje wyniki maturalne
          </Typography>
        </Grid>

        {['PD', 'ROZ'].map((level) => (
          <Grid item xs={12} md={6} key={level}>
            <Paper sx={{ p: 3, borderRadius: 4, boxShadow: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>
                Poziom {level === 'PD' ? 'podstawowy' : 'rozszerzony'}
              </Typography>

              {allSubjects.filter(subject => subject.level === level).map((subject) => (
                <Box key={subject.id} sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                  p: 2,
                  borderRadius: 2,
                  '&:hover': { bgcolor: 'action.hover' }
                }}>
                  <Typography sx={{ flexGrow: 1, mr: 2 }}>
                    {subject.name}
                  </Typography>
                    <TextField
                      type="number"
                      variant="outlined"
                      size="small"
                      value={allScores[subject.id] || ''}
                      onChange={(e) => setAllScores({
                        ...allScores,
                        [subject.id]: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                      })}
                      inputProps={{
                        min: 0,
                        max: 100,
                        style: { textAlign: 'center' }
                      }}
                      sx={{ width: 100 }}
                    />
                </Box>
              ))}
            </Paper>
          </Grid>
        ))}
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
        <GeminiPrompt />
      </Box>
    )}

    {activeStep === 2 && (
      <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper' }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Twój wynik rekrutacyjny
        </Typography>
        <Box sx={{
          display: 'inline-block',
          p: 3,
          borderRadius: 4,
          bgcolor: 'primary.light',
          color: 'primary.contrastText'
        }}>
          <Typography variant="h3">
            {val} punktów
          </Typography>
        </Box>
      </Paper>
    )}

    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      mt: 4,
      gap: 2
    }}>
      <Button
        variant="outlined"
        disabled={activeStep === 0}
        onClick={() => setActiveStep(s => s - 1)}
      >
        Wstecz
      </Button>

      {activeStep < 2 ? (
        <Button
          variant="contained"
          onClick={() => setActiveStep(s => s + 1)}
        >
          {activeStep === 1 ? 'Oblicz' : 'Dalej'}
        </Button>
      ) : (
        <Button
          variant="contained"
          onClick={() => setActiveStep(0)}
        >
          Nowe obliczenia
        </Button>
      )}
    </Box>
  </Box>
            ) : (
                <Box margin={2}>
                    <Autocomplete
                        options={fields}
                        getOptionLabel={(option) => option.name || ''}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        getOptionKey={(option) => option.id}  // Explicitly specify unique key
                        onChange={(_, value) => {
                            setSelectedKierunek(value);
                            console.log(value);
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
                                        onChange={(e) => setMScore(e.target.value)}
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
                                                    {subject.name}
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
                                        <Select
                                            value={g2}
                                            label="G2"
                                            onChange={handleG2Change}
                                        >
                                            {availableG2Subjects.map((subject) => (
                                                <MenuItem key={subject.id} value={subject.id}>
                                                    {subject.name}
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
                                        onChange={(e) => setG2Score(e.target.value)}
                                        sx={{mb: 2}}
                                        inputProps={{min: 0, max: 100}}
                                    />
                                </Grid>
                            </Grid>
                        </>
                    )}
                </Box>
            )}

            <Box mt={3}>
                <Button variant="contained" onClick={handleCalculate}>Oblicz</Button>
            </Box>

            {selectedTab === 0 && !trybWszystkie && results.length > 0 && (
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
