import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add,
  CloudUpload,
  Download,
  InsertDriveFile,
  Image,
  VideoFile,
  Audiotrack,
  PictureAsPdf
} from '@mui/icons-material';
import client from "../../client";
import {API_BASE_URL} from "../../config";

const MediaTab = ({ }) => {
  // Stany
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [sortBy, setSortBy] = useState('-uploaded_at');
  const [page, setPage] = useState(1);
  const [currentGroupId] = useState(1); // Zastąp prawdziwym ID grupy
  const itemsPerPage = 5;
  const token = localStorage.getItem("access");

const fetchMediaFiles = async () => {
    try {
        const response = await client.get(API_BASE_URL + "sources/", {
            headers: {
                Authorization: `Bearer ${token}`,
            },

        });

        setMediaFiles(response.data);
        setPage(1); // reset strony

    } catch (error) {
        console.error("Błąd pobierania danych:", error);
    }
};


  useEffect(() => {
    fetchMediaFiles();
  }, );

  // Filtrowanie i sortowanie
  const filteredFiles = useMemo(() => {
    let result = [...mediaFiles];

    if (filterName) {
      result = result.filter(file =>
        file.name.toLowerCase().includes(filterName.toLowerCase())
      );
    }

    result.sort((a, b) => {
      if (sortBy === '-uploaded_at') return new Date(b.uploaded_at) - new Date(a.uploaded_at);
      if (sortBy === 'uploaded_at') return new Date(a.uploaded_at) - new Date(b.uploaded_at);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === '-name') return b.name.localeCompare(a.name);
      return 0;
    });

    return result;
  }, [mediaFiles, filterName, sortBy]);

  // Reset paginacji przy zmianie filtra/sortowania
  useEffect(() => {
    setPage(1);
  }, [filterName, sortBy]);

  // Obsługa plików
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    if (!fileName.trim()) {
      setFileName(event.target.files[0].name.split('.')[0]);
    }
  };

  const handleFileUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', fileName);
      formData.append('group', currentGroupId);

      const response = await axios.post('/api/media/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMediaFiles([response.data, ...mediaFiles]);
      setFileModalOpen(false);
      setFileName('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleDownloadFile = (file) => {
    window.open(file.url, '_blank');
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return <InsertDriveFile />;

    const type = fileType.split('/')[0];
    switch(type) {
      case 'image': return <Image />;
      case 'video': return <VideoFile />;
      case 'audio': return <Audiotrack />;
      case 'application': return <PictureAsPdf />;
      default: return <InsertDriveFile />;
    }
  };

  return (
    <div>
      {/* Przycisk dodawania pliku i modal */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Typography variant="h6">
              Media
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setFileModalOpen(true)}
            >
              Dodaj plik
            </Button>
          </div>

          {/* Filtrowanie i sortowanie */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <TextField
              label="Filtruj po nazwie"
              variant="outlined"
              size="small"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              sx={{ minWidth: '200px' }}
            />

            <FormControl variant="outlined" size="small" sx={{ minWidth: '200px' }}>
              <InputLabel>Sortuj według</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sortuj według"
              >
                <MenuItem value="-uploaded_at">Najnowsze</MenuItem>
                <MenuItem value="uploaded_at">Najstarsze</MenuItem>
                <MenuItem value="name">Nazwa A-Z</MenuItem>
                <MenuItem value="-name">Nazwa Z-A</MenuItem>
              </Select>
            </FormControl>
          </div>

          <Typography color="textSecondary">
            Tu znajdziesz pliki dodawane przez członków Twojej grupy.
          </Typography>
        </CardContent>
      </Card>

      {/* Modal do dodawania pliku */}
      <Dialog open={fileModalOpen} onClose={() => setFileModalOpen(false)}>
        <DialogTitle>Dodaj nowy plik</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nazwa pliku"
            type="text"
            fullWidth
            variant="standard"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />

          <input
            accept="*/*"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUpload />}
              sx={{ mt: 2 }}
            >
              Wybierz plik
            </Button>
          </label>

          {selectedFile && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Wybrany plik: {selectedFile.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFileModalOpen(false)}>Anuluj</Button>
          <Button
            onClick={handleFileUpload}
            disabled={!selectedFile || !fileName.trim()}
            variant="contained"
          >
            Prześlij
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lista plików z paginacją */}
      {filteredFiles.length > 0 ? (
        <Card>
          <CardContent>
            <List>
              {filteredFiles.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((file) => (
                <ListItem key={file.id} secondaryAction={
                  <IconButton edge="end" onClick={() => handleDownloadFile(file)}>
                    <Download />
                  </IconButton>
                }>
                  <ListItemAvatar>
                    <Avatar>
                      {getFileIcon(file.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={file.name}
                    secondary={`Dodane przez: ${file.user?.username} • ${new Date(file.uploaded_at).toLocaleString()}`}
                  />
                </ListItem>
              ))}
            </List>

            {/* Paginacja */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
              <Pagination
                count={Math.ceil(filteredFiles.length / itemsPerPage)}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Typography color="textSecondary" align="center">
              {filterName ? 'Brak plików pasujących do wyszukiwania' : 'Brak plików. Dodaj pierwszy plik!'}
            </Typography>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MediaTab;