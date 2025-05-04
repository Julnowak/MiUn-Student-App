import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Button, Box, useTheme } from '@mui/material';

const NotFoundPage = () => {
  const theme = useTheme();

  return (
    <>
      <Container maxWidth="md" sx={{
        height: 'calc(100vh - 128px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: theme.spacing(4)
      }}>
        <Typography variant="h1" sx={{
          fontSize: { xs: '6rem', md: '8rem' },
          fontWeight: 700,
          color: theme.palette.text.secondary,
          mb: 2,
          textShadow: '4px 4px 0 rgba(0,0,0,0.1)'
        }}>
          404
        </Typography>

        <Typography variant="h4" sx={{
          mb: 3,
          color: theme.palette.text.primary
        }}>
          Ups! Strona której szukasz nie istnieje
        </Typography>

        <Typography variant="body1" sx={{
          mb: 4,
          color: theme.palette.text.secondary,
          maxWidth: '600px'
        }}>
          Wygląda na to, że zabłądziłeś w cyberprzestrzeni. Sprawdź adres URL lub wróć do strony głównej.
        </Typography>

        <Button
          component={Link}
          to="/"
          variant="contained"
          color="primary"
          size="large"
          sx={{
            px: 6,
            py: 1.5,
            borderRadius: 2,
            fontSize: '1.1rem',
            textTransform: 'none',
            boxShadow: theme.shadows[4],
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[6]
            },
            transition: 'all 0.3s ease'
          }}
        >
          Powrót do strony głównej
        </Button>

        {/* Opcjonalna ilustracja */}
        <Box sx={{
          mt: 8,
          maxWidth: 400,
          opacity: 0.8,
          '& img': {
            width: '100%',
            height: 'auto'
          }
        }}>
        </Box>
      </Container>
    </>
  );
};

export default NotFoundPage;