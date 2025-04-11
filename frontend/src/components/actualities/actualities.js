import React, { useState } from "react";
import { Box, Typography, Card, CardContent, CardActions, Button, Pagination, Grid } from "@mui/material";

const Actualities = () => {
  // Sample data (in a real app, this would be fetched from an API)
  const [updates, setUpdates] = useState([
    {
      id: 1,
      title: "Nowa wersja API v2.0",
      date: "2025-04-01",
      content: "Wersja 2.0 API wprowadza nowe funkcjonalności, takie jak poprawa wydajności i nowe metody.",
      author: "Deweloper 1"
    },
    {
      id: 2,
      title: "Poprawki w systemie logowania",
      date: "2025-03-25",
      content: "Naprawiono błąd w procesie logowania, który powodował problemy z autoryzacją.",
      author: "Deweloper 2"
    },
    {
      id: 3,
      title: "Nowe możliwości w aplikacji mobilnej",
      date: "2025-03-20",
      content: "W aplikacji mobilnej dodano nową funkcjonalność synchronizacji danych offline.",
      author: "Deweloper 3"
    },
    {
      id: 4,
      title: "Zmiany w strukturze bazy danych",
      date: "2025-03-15",
      content: "Zmieniono strukturę bazy danych, co pozwoli na lepszą skalowalność aplikacji.",
      author: "Deweloper 4"
    },
    {
      id: 5,
      title: "Poprawki UI w panelu administratora",
      date: "2025-03-10",
      content: "Zoptymalizowano interfejs użytkownika panelu administratora w celu poprawy doświadczeń użytkowników.",
      author: "Deweloper 5"
    },
    {
      id: 6,
      title: "Ulepszony system powiadomień",
      date: "2025-03-05",
      content: "Nowy system powiadomień umożliwia łatwiejsze śledzenie ważnych informacji w aplikacji.",
      author: "Deweloper 6"
    }
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [updatesPerPage] = useState(3); // One card per page

  // Calculate index of the first and last update on the current page
  const indexOfLastUpdate = currentPage * updatesPerPage;
  const indexOfFirstUpdate = indexOfLastUpdate - updatesPerPage;
  const currentUpdates = updates.slice(indexOfFirstUpdate, indexOfLastUpdate);

  // Pagination handler
  const handleChangePage = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, margin: "auto", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
      <Typography variant="h4" gutterBottom>
        Najnowsze Informacje od Deweloperów
      </Typography>

      {/* Developer Updates Cards */}
      <Grid container spacing={3} justifyContent="center">
        {currentUpdates.map((update) => (
          <Grid item xs={12} key={update.id}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  {update.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {update.content}
                </Typography>
                <Typography variant="caption" display="block" color="textSecondary">
                  {`Data: ${update.date} | Autor: ${update.author}`}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary" onClick={() => console.log(`Kliknięto ${update.id}`)}>
                  Zobacz szczegóły
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Pagination
          count={Math.ceil(updates.length / updatesPerPage)}
          page={currentPage}
          onChange={handleChangePage}
        />
      </Box>
    </Box>
  );
};

export default Actualities;
