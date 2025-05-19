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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    IconButton,
    Link,
    ImageList,
    ImageListItem
} from "@mui/material";
import {CalendarToday, Person, ArrowForward, Close} from "@mui/icons-material";
import client from "../../client";
import {API_BASE_URL} from "../../config";

const StyledCard = styled(Card)(({theme}) => ({
    transition: "all 0.3s ease",
    borderRadius: "16px",
    boxShadow: theme.shadows[4],
    "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: theme.shadows[8],
    },
}));

const Actualities = () => {
    const [selectedPost, setSelectedPost] = useState(null);
    const [news, setNews] = useState([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const token = localStorage.getItem("access");
    const [currentPage, setCurrentPage] = useState(1);
    const [updatesPerPage] = useState(3);
    const theme = useTheme();

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
                console.log("Nie udało się pobrać aktualności");
            }
        };

        if (token) {
            fetchData();
        }
    }, [token]);

    const indexOfLastUpdate = currentPage * updatesPerPage;
    const indexOfFirstUpdate = indexOfLastUpdate - updatesPerPage;
    const currentUpdates = news.slice(indexOfFirstUpdate, indexOfLastUpdate);

    const handleChangePage = (event, value) => {
        setCurrentPage(value);
    };

    const handleCloseDialog = () => {
        setSelectedPost(null);
        setSelectedImageIndex(0);
    };

    const handleNextImage = () => {
        setSelectedImageIndex(prev =>
            prev < selectedPost.images.length - 1 ? prev + 1 : 0
        );
    };

    const handlePrevImage = () => {
        setSelectedImageIndex(prev =>
            prev > 0 ? prev - 1 : selectedPost.images.length - 1
        );
    };

    // Funkcja do wykrywania i zamiany linków w tekście
    const renderTextWithLinks = (text) => {
        if (!text) return '';

        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.split(urlRegex).map((part, index) => {
            if (part.match(urlRegex)) {
                return (
                    <Link
                        key={index}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{wordBreak: 'break-all'}}
                    >
                        {part}
                    </Link>
                );
            }
            return part;
        });
    };

    return (
        <Box sx={{
            p: 4,
            maxWidth: 1200,
            margin: "0 auto",
        }}>
            <Typography
                variant="h3"
                sx={{
                    mb: 6,
                    textAlign: "center",
                    fontWeight: 700,
                    color: "#212121",
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
                                        {update.details.length > 200 ? update.details.slice(0, 200) + "..." : update.details}
                                    </Typography>
                                </Box>

                                <Box sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    color: "text.secondary"
                                }}>
                                    <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                                        <CalendarToday fontSize="small"/>
                                        <Typography
                                            variant="caption">{new Date(update.date_added).toLocaleDateString()}</Typography>
                                    </Box>
                                    <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                                        <Person fontSize="small"/>
                                        <Typography variant="caption">{update.author.username}</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                            <CardActions sx={{
                                borderTop: `1px solid ${theme.palette.divider}`,
                                justifyContent: "flex-end"
                            }}>
                                <Button
                                    endIcon={<ArrowForward/>}
                                    onClick={() => setSelectedPost(update)}
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

            {/* Post Details Dialog */}
            <Dialog
                open={!!selectedPost}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
                transitionDuration={0}
            >
                <DialogTitle sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "#212121",
                    color: theme.palette.primary.contrastText
                }}>
                    {selectedPost?.name}
                    <IconButton onClick={handleCloseDialog} sx={{color: "inherit"}}>
                        <Close/>
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{pt: 3}}>
                    <DialogContentText component="div">
                        <Typography mt={3} align={"justify"} variant="body1" paragraph>
                            {renderTextWithLinks(selectedPost?.details)}
                        </Typography>

                        {selectedPost?.images?.length > 0 && (
                            <Box sx={{mt: 3, mb: 3}}>
                                {selectedPost.images.length === 1 ? (
                                    <Box sx={{textAlign: 'center'}}>
                                        <img
                                            src={`${selectedPost.images[0]}`}
                                            alt="Post image"
                                            style={{maxWidth: '100%', maxHeight: '500px', borderRadius: '8px'}}
                                        />
                                    </Box>
                                ) : (
                                    <>
                                        <Box sx={{position: 'relative', textAlign: 'center'}}>
                                            <img
                                                src={`${selectedPost.images[selectedImageIndex].file.slice(16)}`}
                                                alt={`Image`}
                                                style={{maxWidth: '100%', maxHeight: '400px', borderRadius: '8px'}}
                                            />
                                            {selectedPost.images.length > 1 && (
                                                <>
                                                    <IconButton
                                                        onClick={handlePrevImage}
                                                        sx={{
                                                            position: 'absolute',
                                                            left: 10,
                                                            top: '50%',
                                                            transform: 'translateY(-50%)',
                                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                                            color: 'white',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(0,0,0,0.7)',
                                                            }
                                                        }}
                                                    >
                                                        <ArrowForward sx={{transform: 'rotate(180deg)'}}/>
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={handleNextImage}
                                                        sx={{
                                                            position: 'absolute',
                                                            right: 10,
                                                            top: '50%',
                                                            transform: 'translateY(-50%)',
                                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                                            color: 'white',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(0,0,0,0.7)',
                                                            }
                                                        }}
                                                    >
                                                        <ArrowForward/>
                                                    </IconButton>
                                                </>
                                            )}
                                        </Box>
                                        <ImageList cols={Math.min(selectedPost.images.length, 5)} gap={8} sx={{mt: 2}}>
                                            {selectedPost.images.map((image, index) => (
                                                <ImageListItem key={index} onClick={() => setSelectedImageIndex(index)}>
                                                    <img
                                                        src={`${image.file.slice(16)}`}
                                                        alt={`Thumbnail ${index + 1}`}
                                                        style={{
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            opacity: index === selectedImageIndex ? 1 : 0.7,
                                                            border: index === selectedImageIndex ? `2px solid ${theme.palette.primary.main}` : 'none'
                                                        }}
                                                    />
                                                </ImageListItem>
                                            ))}
                                        </ImageList>
                                    </>
                                )}
                            </Box>
                        )}

                        <Box sx={{
                            display: "flex",
                            gap: 3,
                            mt: 2,
                            color: "text.secondary"
                        }}>
                            <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                                <CalendarToday fontSize="small"/>
                                <Typography variant="body2">
                                    {selectedPost && new Date(selectedPost.date_added).toLocaleDateString()}
                                </Typography>
                            </Box>
                            <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                                <Person fontSize="small"/>
                                <Typography variant="body2">
                                    {selectedPost?.author.username}
                                </Typography>
                            </Box>
                        </Box>
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{p: 2}}>
                    <Button
                        onClick={handleCloseDialog}
                        variant="contained"
                        color="primary"
                        sx={{backgroundColor: "#212121"}}
                    >
                        Zamknij
                    </Button>
                </DialogActions>
            </Dialog>

            <Box sx={{
                display: "flex",
                justifyContent: "center",
                mt: 6,
            }}>
                <Pagination
                    count={Math.ceil(news.length / updatesPerPage)}
                    page={currentPage}
                    onChange={handleChangePage}
                    shape="circular"
                />
            </Box>
        </Box>
    );
};

export default Actualities;