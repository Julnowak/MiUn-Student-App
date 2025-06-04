import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  Divider,
  Chip,
  useTheme,
  Tabs,
  Tab
} from '@mui/material';
import {
  FilterList,
  CalendarToday,
  Grade,
  Assessment,
  Star,
  StarBorder,
  StarHalf
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Mock data
const studentData = {
  name: "Jan Kowalski",
  albumNumber: "123456",
  fieldOfStudy: "Informatyka",
  faculty: "Wydział Elektroniki i Technik Informacyjnych",
  semester: 4,
  avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  courses: [
    {
      id: 1,
      name: "Algorytmy i struktury danych",
      code: "AISD-2023",
      field: "Informatyka",
      semester: 4,
      grade: 5.0,
      date: "2023-02-15",
      lecturer: "dr hab. Anna Nowak",
      type: "Wykład"
    },
    {
      id: 2,
      name: "Bazy danych",
      code: "BD-2023",
      field: "Informatyka",
      semester: 3,
      grade: 4.5,
      date: "2023-01-20",
      lecturer: "prof. Jan Wiśniewski",
      type: "Laboratorium"
    },
    {
      id: 3,
      name: "Programowanie obiektowe",
      code: "PO-2023",
      field: "Informatyka",
      semester: 3,
      grade: 4.0,
      date: "2022-12-10",
      lecturer: "mgr Piotr Kowalczyk",
      type: "Projekt"
    },
    {
      id: 4,
      name: "Historia sztuki",
      code: "HS-2023",
      field: "Sztuka",
      semester: 2,
      grade: 3.5,
      date: "2022-06-05",
      lecturer: "dr Maria Lewandowska",
      type: "Wykład"
    },
    {
      id: 5,
      name: "Matematyka dyskretna",
      code: "MD-2023",
      field: "Informatyka",
      semester: 2,
      grade: 3.0,
      date: "2022-06-15",
      lecturer: "prof. Adam Malinowski",
      type: "Egzamin"
    }
  ]
};

const gradeDistribution = [
  { grade: "2.0", count: 0 },
  { grade: "3.0", count: 1 },
  { grade: "3.5", count: 1 },
  { grade: "4.0", count: 1 },
  { grade: "4.5", count: 1 },
  { grade: "5.0", count: 1 },
];

const progressOverTime = [
  { semester: "Semestr 2", avg: 3.25 },
  { semester: "Semestr 3", avg: 4.25 },
  { semester: "Semestr 4", avg: 5.0 },
];

const StudentGradesPage = () => {
  const theme = useTheme();
  const [selectedField, setSelectedField] = useState("Wszystkie");
  const [selectedSemester, setSelectedSemester] = useState("Wszystkie");
  const [tabValue, setTabValue] = useState(0);

  const fields = ["Wszystkie", ...new Set(studentData.courses.map(course => course.field))];
  const semesters = ["Wszystkie", ...new Set(studentData.courses.map(course => course.semester))];

  const filteredCourses = studentData.courses.filter(course => {
    const fieldMatch = selectedField === "Wszystkie" || course.field === selectedField;
    const semesterMatch = selectedSemester === "Wszystkie" || course.semester === selectedSemester;
    return fieldMatch && semesterMatch;
  });

  const calculateAverage = () => {
    if (filteredCourses.length === 0) return 0;
    const sum = filteredCourses.reduce((acc, course) => acc + course.grade, 0);
    return (sum / filteredCourses.length).toFixed(2);
  };

  const renderGradeIcon = (grade) => {
    if (grade >= 4.5) return <Star color="success" />;
    if (grade >= 3.5) return <StarHalf color="warning" />;
    return <StarBorder color="error" />;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Student profile header */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: theme.palette.primary.light }}>
              <Typography variant="h6">Średnia ocen</Typography>
              <Typography variant="h3" fontWeight={700}>
                {calculateAverage()}
              </Typography>
              <Typography variant="caption">
                ({filteredCourses.length} przedmiotów)
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Navigation tabs */}
      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Oceny" icon={<Grade />} />
        <Tab label="Statystyki" icon={<Assessment />} />
      </Tabs>

      {/* Filters */}
      {tabValue === 0 && (
      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="field-filter-label">
                Kierunek
              </InputLabel>
              <Select
                labelId="field-filter-label"
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                label="Kierunek"
              >
                {fields.map((field, index) => (
                  <MenuItem key={index} value={field}>
                    {field}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="semester-filter-label">
                Semestr
              </InputLabel>
              <Select
                labelId="semester-filter-label"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                label="Semestr"
              >
                {semesters.map((semester, index) => (
                  <MenuItem key={index} value={semester}>
                    {semester === "Wszystkie" ? semester : `Semestr ${semester}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>)}

      {/* Grades table */}
      {tabValue === 0 && (
      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: theme.palette.grey[100] }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Przedmiot</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Kod</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Typ</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Kierunek</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Semestr</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Prowadzący</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Ocena</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Data</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <TableRow key={course.id} hover>
                    <TableCell>{course.name}</TableCell>
                    <TableCell>{course.code}</TableCell>
                    <TableCell>
                      <Chip
                        label={course.type}
                        size="small"
                        color={
                          course.type === "Egzamin" ? "primary" :
                          course.type === "Laboratorium" ? "secondary" : "default"
                        }
                      />
                    </TableCell>
                    <TableCell>{course.field}</TableCell>
                    <TableCell>Semestr {course.semester}</TableCell>
                    <TableCell>{course.lecturer}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {renderGradeIcon(course.grade)}
                        <Typography sx={{ ml: 1 }}>{course.grade}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{new Date(course.date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Brak ocen spełniających wybrane kryteria
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>)}

      {/* Statistics section (hidden when not active) */}
      {tabValue === 1 && (
        <Paper elevation={2} sx={{ p: 3, mt: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
            Statystyki ocen
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Rozkład ocen
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="grade" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      fill={theme.palette.primary.main}
                      name="Liczba ocen"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Średnia ocen w czasie
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semester" />
                    <YAxis domain={[2, 5]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="avg"
                      stroke={theme.palette.secondary.main}
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                      name="Średnia ocen"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Container>
  );
};

export default StudentGradesPage;