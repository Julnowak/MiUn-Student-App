import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../client";
import { API_BASE_URL } from "../../config";
import {
    Box,
    Button,
    CircularProgress,
    Container,
    Paper,
    TextField,
    Typography,
    Alert,
    styled,
    useTheme
} from "@mui/material";
import { FaCheckCircle, FaEnvelope, FaArrowLeft } from "react-icons/fa";

const VerificationPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    maxWidth: 500,
    margin: "0 auto",
    borderRadius: theme.shape.borderRadius * 2,
    border: `1px solid ${theme.palette.divider}`,
}));

const CodeInput = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        fontSize: "1.5rem",
        letterSpacing: "0.5rem",
        textAlign: "center",
        padding: theme.spacing(1),
    },
}));

export default function EmailVerification() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [step, setStep] = useState(1); // 1 = request code, 2 = enter code
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleSendCode = async (e) => {
        if (email)
        e?.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");

        if (!email.endsWith("@student.agh.edu.pl")) {
            setError("Proszę podać oficjalny adres email AGH (@student.agh.edu.pl)");
            setIsLoading(false);
            return;
        }

        try {
            await client.post(API_BASE_URL + "send-verification-email/", {
                email: email
            });
            setStep(2);
            setCountdown(60);
            setSuccess("Kod weryfikacyjny został wysłany na Twój adres email.");
        } catch (err) {
            setError(err.response?.data?.message || "Wystąpił błąd podczas wysyłania kodu. Spróbuj ponownie.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (verificationCode.length !== 6) {
            setError("Kod weryfikacyjny musi składać się z 6 cyfr");
            return;
        }

        setIsLoading(true);
        setError("");
        try {
            await client.post(API_BASE_URL + "verify-code/", {
                email: email,
                code: verificationCode
            });
            setSuccess("Twój adres email został pomyślnie zweryfikowany!");
            setTimeout(() => navigate("/userProfile"), 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Nieprawidłowy kod weryfikacyjny. Spróbuj ponownie.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = () => {
        if (countdown > 0) return;
        handleSendCode();
    };

    const handleBack = () => {
        setStep(1);
        setError("");
        setSuccess("");
    };

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <VerificationPaper elevation={0}>
                {step === 1 ? (
                    <Box component="form" onSubmit={handleSendCode}>
                        <Button
                            startIcon={<FaArrowLeft />}
                            onClick={() => navigate(-1)}
                            sx={{ mb: 3 }}
                        >
                            Powrót
                        </Button>

                        <Box sx={{ textAlign: "center", mb: 4 }}>
                            <FaEnvelope size={48} color={theme.palette.primary.main} />
                            <Typography variant="h5" sx={{ mt: 2, fontWeight: 600 }}>
                                Weryfikacja adresu email
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1, color: theme.palette.text.secondary }}>
                                Wprowadź uczelniany adres email, na który wyślemy kod weryfikacyjny
                            </Typography>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <TextField
                            fullWidth
                            label="Adres email"
                            variant="outlined"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{ mb: 3 }}
                            autoFocus
                            required
                            type="email"
                        />

                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                "Wyślij kod weryfikacyjny"
                            )}
                        </Button>
                    </Box>
                ) : (
                    <>
                        <Button
                            startIcon={<FaArrowLeft />}
                            onClick={handleBack}
                            sx={{ mb: 3 }}
                        >
                            Powrót
                        </Button>

                        <Box sx={{ textAlign: "center", mb: 4 }}>
                            <FaCheckCircle size={48} color={theme.palette.success.main} />
                            <Typography variant="h5" sx={{ mt: 2, fontWeight: 600 }}>
                                Wprowadź kod weryfikacyjny
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1, color: theme.palette.text.secondary }}>
                                Wpisz 6-cyfrowy kod wysłany na adres:<br />
                                <strong>{email}</strong>
                            </Typography>
                        </Box>

                        {success && (
                            <Alert severity="success" sx={{ mb: 2 }}>
                                {success}
                            </Alert>
                        )}

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <CodeInput
                            fullWidth
                            variant="outlined"
                            placeholder="------"
                            value={verificationCode}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                                setVerificationCode(value);
                            }}
                            sx={{ mb: 3 }}
                            inputProps={{
                                inputMode: 'numeric',
                                pattern: '[0-9]*'
                            }}
                        />

                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={handleVerifyCode}
                            disabled={isLoading || verificationCode.length !== 6}
                        >
                            {isLoading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                "Zweryfikuj kod"
                            )}
                        </Button>

                        <Box sx={{ textAlign: "center", mt: 3 }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                Nie otrzymałeś kodu?
                            </Typography>
                            <Button
                                onClick={handleResendCode}
                                disabled={countdown > 0}
                                sx={{ mt: 1 }}
                            >
                                Wyślij ponownie {countdown > 0 && `(${countdown}s)`}
                            </Button>
                        </Box>
                    </>
                )}
            </VerificationPaper>
        </Container>
    );
}