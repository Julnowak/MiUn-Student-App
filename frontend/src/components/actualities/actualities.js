import React, {useEffect, useState} from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Pagination,
  Grid,
  useTheme,
  styled,
  IconButton
} from "@mui/material";
import { CalendarToday, Person, ArrowForward } from "@mui/icons-material";
import client from "../../client";
import {API_BASE_URL} from "../../config";

const StyledCard = styled(Card)(({ theme }) => ({
  transition: "all 0.3s ease",
  borderRadius: "16px",
  boxShadow: theme.shadows[4],
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
  },
}));

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

  const [news, setNews] = useState([]);
  const token = localStorage.getItem("access")

  useEffect(() => {
      const fetchData = async () => {
          try {
              const response = await client.get(API_BASE_URL + "news/", {
                  headers: {
                      Authorization: `Bearer ${token}`,
                  },
              });
              setNews(response.data);
          } catch (error) {
              console.log("Nie udało się zalogować");
          }
      };

      if (token) {
          fetchData();
      }
  }, [token]);

  const [currentPage, setCurrentPage] = useState(1);
  const [updatesPerPage] = useState(3); // One card per page

  // Calculate index of the first and last update on the current page
  const indexOfLastUpdate = currentPage * updatesPerPage;
  const indexOfFirstUpdate = indexOfLastUpdate - updatesPerPage;
  const currentUpdates = news.slice(indexOfFirstUpdate, indexOfLastUpdate);
  const theme = useTheme();

  // Pagination handler
  const handleChangePage = (event, value) => {
    setCurrentPage(value);
  };


  return (
    <Box sx={{
      p: 4,
      maxWidth: 1200,
      margin: "0 auto",
      background: theme.palette.background.default
    }}>
      <Typography
        variant="h3"
        sx={{
          mb: 6,
          textAlign: "center",
          fontWeight: 700,
          color: "primary.main",
          letterSpacing: "-0.5px"
        }}
      >
        Najnowsze Informacje
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {currentUpdates.map((update) => (
          <Grid item xs={12} md={6} lg={4} key={update.id}>
            <StyledCard>
              <CardContent sx={{
                minHeight: 260,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}>
                <Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{
                      mb: 2,
                      fontWeight: 600,
                      color: "text.primary",
                      minHeight: 64
                    }}
                  >
                    {update.name}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    paragraph
                    sx={{
                      lineHeight: 1.6,
                      mb: 3
                    }}
                  >
                    {update.details.length > 200 ? update.details.slice(0,200) + "...": update.details}
                  </Typography>
                </Box>

                <Box sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  color: "text.secondary"
                }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CalendarToday fontSize="small" />
                    <Typography variant="caption">{new Date(update.date_added).toLocaleDateString()}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Person fontSize="small" />
                    <Typography variant="caption">{update.author.username}</Typography>
                  </Box>
                </Box>
              </CardContent>
              <CardActions sx={{
                borderTop: `1px solid ${theme.palette.divider}`,
                justifyContent: "flex-end"
              }}>
                <Button
                  endIcon={<ArrowForward />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 500,
                    "&:hover": {
                      backgroundColor: "action.hover"
                    }
                  }}
                >
                  Czytaj więcej
                </Button>
              </CardActions>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      <Box sx={{
        display: "flex",
        justifyContent: "center",
        mt: 6,

      }}>
        <Pagination
          count={Math.ceil(updates.length / updatesPerPage)}
          page={currentPage}
          onChange={handleChangePage}

          shape="circular"
        />
      </Box>
    </Box>
  );
};

export default Actualities;
