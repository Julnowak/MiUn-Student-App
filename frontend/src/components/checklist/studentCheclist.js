import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Checkbox,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  Box,
  Paper,
  Grow,
  Zoom,
  Collapse,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Avatar
} from "@mui/material";
import { CheckCircle, School, Celebration, ConfirmationNumber } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const checklistItems = [
  "Odebranie legitymacji studenckiej",
  "Zapisanie się na kursy (USOS)",
  "Pobranie planu zajęć",
  "Dołączenie do grup dziekańskich na Facebooku",
  "Zainstalowanie e-maila uczelnianego",
  "Zorientowanie się gdzie znajdują się budynki A, B, C...",
  "Zgłoszenie się na spotkanie integracyjne",
  "Sprawdzenie terminów sesji i zaliczeń",
  "Zarejestrowanie się w Wirtualnym Dziekanacie",
  "Zainstalowanie aplikacji studenckiej (np. Mobilny USOS)"
];

const AnimatedCheckbox = styled(Checkbox)(({ theme }) => ({
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.2)'
  },
}));

const StudentChecklist = () => {
  const [checked, setChecked] = useState([]);
  const [allCompleted, setAllCompleted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (checked.length === checklistItems.length) {
      setAllCompleted(true);
      setOpen(true);
    } else {
      setAllCompleted(false);
    }
  }, [checked]);

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleReset = () => {
    setChecked([]);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Grow in={true} timeout={800}>
        <Paper elevation={4} sx={{
          p: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%)'
        }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar sx={{
              bgcolor: 'primary.main',
              width: 60,
              height: 60,
              margin: '0 auto',
              mb: 2
            }}>
              <School fontSize="large" />
            </Avatar>
            <Typography variant="h4" sx={{
              fontWeight: 700,
              color: 'text.primary',
              mb: 1
            }}>
              Checklista Pierwszoroczniaka AGH
            </Typography>
            <Typography variant="body1" sx={{
              color: 'text.secondary',
              mb: 2
            }}>
              Przygotuj się dobrze na pierwszy semestr!
            </Typography>
            {allCompleted && (
              <Zoom in={allCompleted}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  color: 'success.main'
                }}>
                  <Celebration />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Wszystko gotowe!
                  </Typography>
                </Box>
              </Zoom>
            )}
          </Box>

          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: 0 }}>
              <List sx={{ p: 0 }}>
                {checklistItems.map((item, index) => (
                  <Collapse
                    key={index}
                    in={true}
                    timeout={(index + 1) * 200}
                    mountOnEnter
                    unmountOnExit
                  >
                    <ListItem
                      button
                      onClick={handleToggle(index)}
                      sx={{
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: 'rgba(25, 118, 210, 0.08)',
                          transform: 'translateX(5px)'
                        },
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': {
                          borderBottom: 'none'
                        }
                      }}
                    >
                      <ListItemIcon>
                        <AnimatedCheckbox
                          edge="start"
                          checked={checked.indexOf(index) !== -1}
                          tabIndex={-1}
                          disableRipple
                          icon={<CheckCircle color="disabled" />}
                          checkedIcon={<CheckCircle color="success" />}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={item}
                        primaryTypographyProps={{
                          sx: {
                            fontWeight: checked.indexOf(index) !== -1 ? 600 : 400,
                            color: checked.indexOf(index) !== -1 ? 'text.primary' : 'text.secondary',
                            textDecoration: checked.indexOf(index) !== -1 ? 'none' : 'none'
                          }
                        }}
                      />
                      {checked.indexOf(index) !== -1 && (
                        <Zoom in={checked.indexOf(index) !== -1}>
                          <ConfirmationNumber color="primary" />
                        </Zoom>
                      )}
                    </ListItem>
                  </Collapse>
                ))}
              </List>
            </CardContent>
          </Card>

          {allCompleted && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleReset}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                Wyczyść checklistę
              </Button>
            </Box>
          )}
        </Paper>
      </Grow>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ textAlign: 'center' }}>
          <Celebration color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" component="div">
            Gratulacje!
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ textAlign: 'center' }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Udało Ci się wykonać wszystkie zadania na liście!
            </Typography>
            <Typography variant="body2">
              Jesteś gotowy na rozpoczęcie swojej przygody na AGH. Powodzenia!
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            onClick={handleClose}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2 }}
          >
            Rozpocznij studia!
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default StudentChecklist;