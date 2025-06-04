import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Chip,
  Divider,
  Tabs,
  Tab,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Avatar,
  Button,
  IconButton,
  Tooltip,
  Pagination
} from '@mui/material';
import {
  CalendarToday,
  School,
  FilterList,
  Today,
  Schedule,
  LocationOn,
  Person,
  CloudUpload,
  Delete
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import Papa from 'papaparse';
import {useNavigate} from "react-router-dom";

const SchedulePage = () => {
  const theme = useTheme();
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [fileName, setFileName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const classesPerPage = 5;
  const navigate = useNavigate();

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const parsedData = results.data
          .filter(item => item.kod_przedmiotu) // Filtrujemy puste wiersze
          .map(item => {
            // Czyszczenie danych - usuwanie cudzysłowów jeśli istnieją
            const cleanedItem = {};
            Object.keys(item).forEach(key => {
              cleanedItem[key] = item[key].replace(/^"|"$/g, '');
            });
            return cleanedItem;
          });

        setScheduleData(parsedData);
        setLoading(false);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setLoading(false);
      }
    });
  };

  // Funkcja do wyodrębniania części przed przecinkiem
  const extractLocation = (location) => {
    if (location === "on-line") return location;
    return location.split(',')[0].trim();
  };

  // Funkcja do obsługi kliknięcia w lokalizację
  const handleLocationClick = (location) => {
    const cleanLocation = extractLocation(location);
    navigate(`/localizations/${encodeURIComponent(cleanLocation)}`);
  };


  const clearFile = () => {
    setScheduleData([]);
    setFileName('');
    setSelectedMonth('all');
    setSelectedSubject('all');
    setCurrentPage(1);
  };

  // Grupowanie zajęć według daty
  const groupByDate = () => {
    const grouped = {};
    scheduleData.forEach(item => {
      const dateKey = item.data;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });
    return grouped;
  };

  const groupedSchedule = groupByDate();

  // Pobieranie unikalnych przedmiotów do filtrowania
  const subjects = [...new Set(scheduleData.map(item => item.nazwa_przedmiotu))];
  // Pobieranie unikalnych miesięcy do filtrowania
  const months = [...new Set(scheduleData.map(item => {
    const date = parseISO(item.data);
    return format(date, 'yyyy-MM', { locale: pl });
  }))];

  // Filtrowanie danych
  const filteredData = scheduleData.filter(item => {
    const date = parseISO(item.data);
    const monthMatch = selectedMonth === 'all' ||
      format(date, 'yyyy-MM') === selectedMonth;
    const subjectMatch = selectedSubject === 'all' ||
      item.nazwa_przedmiotu === selectedSubject;
    return monthMatch && subjectMatch;
  });

  // Formatowanie czasu trwania zajęć
  const formatDuration = (start, end) => {
    return `${start} - ${end}`;
  };

  // Formatowanie daty
  const formatDate = (dateStr) => {
    const date = parseISO(dateStr);
    return format(date, 'EEEE, d MMMM yyyy', { locale: pl });
  };

  // Paginacja
  const totalPages = Math.ceil(filteredData.length / classesPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * classesPerPage,
    currentPage * classesPerPage
  );

  // Grupowanie przefiltrowanych i spaginowanych danych
  const filteredGroupedSchedule = () => {
    const grouped = {};
    paginatedData.forEach(item => {
      const dateKey = item.data;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });
    return grouped;
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Nagłówek */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 56, height: 56 }}>
              <School sx={{ fontSize: 32 }} />
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" component="h1" fontWeight={700}>
              Plan zajęć
            </Typography>
            <Typography color="text.secondary">
              Semestr letni 2024/2025
            </Typography>
          </Grid>

        </Grid>

        {fileName && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              Załadowany plik: <strong>{fileName}</strong>
            </Typography>
            <Tooltip title="Wyczyść">
              <IconButton onClick={clearFile} size="small">
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Paper>

      {/* Filtry i zakładki */}
      {scheduleData.length > 0 && (
        <>
          <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => {
                setTabValue(newValue);
                setCurrentPage(1); // Reset paginacji przy zmianie zakładki
              }}
              sx={{ mb: 2 }}
            >
              <Tab label="Widok tygodniowy" icon={<CalendarToday />} />
              <Tab label="Widok listy" icon={<Schedule />} />
            </Tabs>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{mt: 2}}>
                  <InputLabel id="month-filter-label">
                    Miesiąc
                  </InputLabel>
                  <Select
                    labelId="month-filter-label"
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      setCurrentPage(1); // Reset paginacji przy zmianie filtra
                    }}
                    label="Miesiąc"
                  >
                    <MenuItem value="all">Wszystkie miesiące</MenuItem>
                    {months.map((month, index) => (
                      <MenuItem key={index} value={month}>
                        {format(parseISO(`${month}-01`), 'MMMM yyyy', { locale: pl })}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="subject-filter-label">
                    Przedmiot
                  </InputLabel>
                  <Select
                    labelId="subject-filter-label"
                    value={selectedSubject}
                    onChange={(e) => {
                      setSelectedSubject(e.target.value);
                      setCurrentPage(1); // Reset paginacji przy zmianie filtra
                    }}
                    label="Przedmiot"
                  >
                    <MenuItem value="all">Wszystkie przedmioty</MenuItem>
                    {subjects.map((subject, index) => (
                      <MenuItem key={index} value={subject}>
                        {subject}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Widok listy */}
          {tabValue === 1 && (
            <>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                {loading ? (
                  <Typography>Ładowanie danych...</Typography>
                ) : filteredData.length === 0 ? (
                  <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                    Brak zajęć spełniających wybrane kryteria
                  </Typography>
                ) : (
                  Object.entries(filteredGroupedSchedule()).map(([date, classes]) => (
                    <Box key={date} sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                        {formatDate(date)}
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Grid container spacing={2}>
                        {classes.map((classItem, index) => (
                          <Grid item xs={12} key={index}>
                            <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                              <Grid container spacing={1}>
                                <Grid item xs={12} sm={4}>
                                  <Typography variant="subtitle1" fontWeight={600}>
                                    {classItem.nazwa_przedmiotu}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {classItem.kod_przedmiotu}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={2}>
                                  <Box display="flex" alignItems="center">
                                    <Schedule color="action" sx={{ mr: 1 }} />
                                    <Typography>
                                      {formatDuration(classItem.poczatek, classItem.koniec)}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={6} sm={2}>
                                  <Box display="flex" alignItems="center">
                                    <LocationOn color="action" sx={{ mr: 1 }} />
                                    <Typography>
                                      {classItem.nr_sali === "on-line" ? (
                                        <Chip label="Online" size="small" color="info" />
                                      ) : (
                                        <Chip
                                          label={extractLocation(`${classItem.budynek}, ${classItem.nr_sali}`)}
                                          size="small"
                                          clickable
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleLocationClick(`${classItem.budynek}, ${classItem.nr_sali}`);
                                          }}
                                        />
                                      )}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <Box display="flex" alignItems="center">
                                    <Person color="action" sx={{ mr: 1 }} />
                                    <Typography>
                                      {classItem.prowadzacy}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    label={classItem.rodzaj_zajec}
                                    size="small"
                                    sx={{ mt: 1 }}
                                    color={
                                      classItem.rodzaj_zajec.includes('wykład') ? 'primary' :
                                      classItem.rodzaj_zajec.includes('laboratorium') ? 'secondary' : 'default'
                                    }
                                  />
                                </Grid>
                              </Grid>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ))
                )}
              </Paper>
              {filteredData.length > classesPerPage && (
                <Box display="flex" justifyContent="center" mt={4}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    shape="rounded"
                  />
                </Box>
              )}
            </>
          )}

          {/* Widok kalendarza (tygodniowy) */}
          {tabValue === 0 && (
            <>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                {loading ? (
                  <Typography>Ładowanie danych...</Typography>
                ) : filteredData.length === 0 ? (
                  <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                    Brak zajęć spełniających wybrane kryteria
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {Object.entries(filteredGroupedSchedule()).map(([date, classes]) => (
                      <Grid item xs={12} key={date}>
                        <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                            <Today color="primary" sx={{ verticalAlign: 'middle', mr: 1 }} />
                            {formatDate(date)}
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          <Grid container spacing={2}>
                            {classes.map((classItem, index) => (
                              <Grid item xs={12} md={6} lg={4} key={index}>
                                <Paper sx={{ p: 2, height: '100%', borderLeft: `4px solid ${theme.palette.primary.main}` }}>
                                  <Typography variant="subtitle1" fontWeight={600}>
                                    {classItem.nazwa_przedmiotu}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {classItem.kod_przedmiotu}
                                  </Typography>

                                  <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                                    <Schedule fontSize="small" color="action" sx={{ mr: 1 }} />
                                    <Typography variant="body2">
                                      {formatDuration(classItem.poczatek, classItem.koniec)}
                                    </Typography>
                                  </Box>

                                  <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                                    <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
                                    <Typography variant="body2">
                                      {classItem.nr_sali === "on-line" ? (
                                        <Chip label="Online" size="small" color="info" />
                                      ) : (
                                        `${classItem.budynek}, sala ${classItem.nr_sali}`
                                      )}
                                    </Typography>
                                  </Box>

                                  <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                                    <Person fontSize="small" color="action" sx={{ mr: 1 }} />
                                    <Typography variant="body2">
                                      {classItem.prowadzacy}
                                    </Typography>
                                  </Box>

                                  <Chip
                                    label={classItem.rodzaj_zajec}
                                    size="small"
                                    color={
                                      classItem.rodzaj_zajec.includes('wykład') ? 'primary' :
                                      classItem.rodzaj_zajec.includes('laboratorium') ? 'secondary' : 'default'
                                    }
                                  />
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
              {filteredData.length > classesPerPage && (
                <Box display="flex" justifyContent="center" mt={4}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    shape="rounded"
                  />
                </Box>
              )}
            </>
          )}
        </>
      )}

      {/* Komunikat gdy nie ma danych */}
      {!loading && scheduleData.length === 0 && (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <CloudUpload sx={{ fontSize: 60, color: theme.palette.grey[400], mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Nie załadowano planu zajęć
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Wgraj plik CSV z planem zajęć, aby wyświetlić harmonogram
          </Typography>
          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="upload-csv-empty-state"
            type="file"
            onChange={handleFileUpload}
          />
          <label htmlFor="upload-csv-empty-state">
            <Button
              variant="contained"
              color="primary"
              component="span"
              startIcon={<CloudUpload />}
            >
              Wgraj plik CSV
            </Button>
          </label>
        </Paper>
      )}
    </Container>
  );
};

export default SchedulePage;