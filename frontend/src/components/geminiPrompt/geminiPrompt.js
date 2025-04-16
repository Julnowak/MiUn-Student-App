import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Paper,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import {API_BASE_URL} from "../../config";

const GeminiPrompt = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse("");
    setError("");

    try {
      const res = await fetch(API_BASE_URL + "ask-gemini/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(data.response);
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch (err) {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h5" gutterBottom>
          Cześć!
        </Typography>
        <Typography variant="h6" gutterBottom>
          Wpisz swoje zainteresowania i preferencje odnośnie kierunku, a MiUn postara się wybrać dla Ciebie najodpowiedniejsze kierunki.
        </Typography>
        <TextField
          label="Opowiedz nam coś o sobie!"
          multiline
          rows={4}
          fullWidth
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Send"}
          </Button>
        </Box>

        {response && (
          <Box mt={4}>
            <Typography variant="subtitle1" gutterBottom>
              Gemini's Response:
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "#f5f5f5",
                whiteSpace: "pre-wrap",
              }}
            >
              {response}
            </Paper>
          </Box>
        )}

        {error && (
          <Typography color="error" mt={2}>
            {error}
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default GeminiPrompt;
