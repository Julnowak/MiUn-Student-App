import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from "@mui/material";
import MessageIcon from "@mui/icons-material/Message";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import FacebookIcon from "@mui/icons-material/Facebook";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

const ContactSection = ({ offer }) => {
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [swapData, setSwapData] = useState({
    title: "",
    description: "",
    image: null,
  });

  const handleSwapInputChange = (e) => {
    const { name, value } = e.target;
    setSwapData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setSwapData((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  const handleSwapSubmit = () => {
    // Tu można wysłać dane do backendu
    console.log("Zgłoszono zamiennik:", swapData);
    setSwapModalOpen(false);
    setSwapData({ title: "", description: "", image: null });
  };

  return (
    <>
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="subtitle1">Ogłoszeniodawca:</Typography>
          <Typography variant="h6">{offer.user_name}</Typography>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<PhoneIcon />}
            href={`tel:${offer.phone || ""}`}
            sx={{ mt: 2 }}
          >
            Zadzwoń
          </Button>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<EmailIcon />}
            href={`mailto:${offer.email || ""}`}
            sx={{ mt: 1 }}
          >
            Wyślij e-mail
          </Button>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<FacebookIcon />}
            href={`https://m.me/${offer.messenger || ""}`}
            target="_blank"
            sx={{ mt: 1 }}
          >
            Messenger
          </Button>

          <Button
            variant="contained"
            fullWidth
            startIcon={<MessageIcon />}
            sx={{ mt: 2 }}
          >
            Napisz wiadomość
          </Button>

          <Button
            variant="contained"
            color="secondary"
            fullWidth
            startIcon={<SwapHorizIcon />}
            onClick={() => setSwapModalOpen(true)}
            sx={{ mt: 2 }}
          >
            Zaproponuj zamiennik
          </Button>
        </CardContent>
      </Card>

      {/* Modal Zamiennika */}
      <Dialog open={swapModalOpen} onClose={() => setSwapModalOpen(false)}>
        <DialogTitle>Zaproponuj zamiennik</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nazwa przedmiotu"
            name="title"
            value={swapData.title}
            onChange={handleSwapInputChange}
            sx={{ mt: 1 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Opis przedmiotu"
            name="description"
            value={swapData.description}
            onChange={handleSwapInputChange}
            sx={{ mt: 2 }}
          />
          <Button variant="outlined" component="label" sx={{ mt: 2 }}>
            Dodaj zdjęcie
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </Button>
          {swapData.image && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Wybrano: {swapData.image.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSwapModalOpen(false)}>Anuluj</Button>
          <Button onClick={handleSwapSubmit} variant="contained">
            Wyślij
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ContactSection;
