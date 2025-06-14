import React, {useState} from 'react';
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Pagination,
    Box,
    Link
} from '@mui/material';
import {useNavigate} from 'react-router-dom';

const ResultsStep = ({results, response, setActiveStep}) => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const itemsPerPage = 5;

    // Obliczanie paginacji
    const pageCount = Math.ceil(results.length / itemsPerPage);
    const paginatedResults = results.sort((a, b) => b.score - a.score)?.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    console.log(results)

    return (
        <Box sx={{mt: 4}}>

            <Typography variant="h5" gutterBottom>
                Wyniki rekrutacji
            </Typography>

            <TableContainer component={Paper} sx={{mb: 3}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Lp.</TableCell>
                            <TableCell>Kierunek</TableCell>
                            <TableCell align="right">Punkty G1</TableCell>
                            <TableCell align="right">Punkty G2</TableCell>
                            <TableCell align="right">Matematyka PD</TableCell>
                            <TableCell align="right">Łącznie</TableCell>
                            <TableCell align="center">Akcje</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedResults.map((result, index) => (
                            <TableRow key={result.id}>
                                <TableCell>{(page - 1) * itemsPerPage + index + 1}</TableCell>
                                <TableCell>{result.field}</TableCell>
                                <TableCell align="right">{result.G1}</TableCell>
                                <TableCell align="right">{result.G2}</TableCell>
                                <TableCell align="right">{result.M}</TableCell>
                                <TableCell align="right">
                                    <strong>{result.score}</strong>
                                </TableCell>
                                <TableCell align="center">
                                    <Link
                                        component="button"
                                        variant="body2"
                                        onClick={() => navigate(`https://rekrutacja.agh.edu.pl/kierunki-studiow/automatyka-i-robotyka`)}
                                        sx={{textDecoration: 'underline'}}
                                    >
                                        Szczegóły
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {pageCount > 1 && (
                <Box sx={{display: 'flex', justifyContent: 'center', mb: 3}}>
                    <Pagination
                        count={pageCount}
                        page={page}
                        size={"small"}
                        onChange={(_, value) => setPage(value)}
                        color="primary"
                    />
                </Box>
            )}


            <Typography variant="h5" gutterBottom>
                MiUn pomocnik
            </Typography>


                        {response && (
                <Box mt={4} sx={{textAlign: "justify"}}>
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            bgcolor: "background.paper",
                            boxShadow: 1,
                            whiteSpace: "pre-wrap",
                            '& strong': {
                                fontWeight: 'bold',
                                color: 'primary.main'
                            }
                        }}
                    >
                        <Typography component="div">
                            {response.split('**').map((part, index) => (
                                index % 2 === 0 ? (
                                    part
                                ) : (
                                    <strong key={index}>{part}</strong>
                                )
                            ))}
                        </Typography>
                    </Paper>
                </Box>
            )}

            <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                <Button
                    variant="contained"
                    onClick={() => setActiveStep(0)}
                    sx={{mt: 2}}
                >
                    Nowe obliczenia
                </Button>
            </Box>

        </Box>
    );
};

export default ResultsStep;