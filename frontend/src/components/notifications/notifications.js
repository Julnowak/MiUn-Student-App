import React, { useEffect, useState } from "react";
import { Box, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fab, IconButton, InputAdornment, List, ListItem, ListItemIcon, ListItemText, Pagination, TextField, Badge, Button } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import AddIcon from "@mui/icons-material/Add";
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import client from "../../client";
import { API_BASE_URL } from "../../config";
import MailIcon from '@mui/icons-material/Mail';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");
  const [newNotification, setNewNotification] = useState({
    title: "",
    description: "",
    reminderDate: new Date(),
    read: false,
  });
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage] = useState(5); // Set the number of notifications per page

  const token = localStorage.getItem("access");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await client.get(API_BASE_URL + "notifications/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setNotifications(response.data);
      } catch (error) {
        console.log("Nie udało się zalogować");
      }
    };

    if (notifications.length < 1 && token) {
      fetchNotifications();
    }
  }, [notifications.length, token]);

  const handleAddNotification = () => {
    if (newNotification.title.trim() && newNotification.description.trim()) {
      setNotifications([newNotification, ...notifications]);
      setNewNotification({
        title: "",
        description: "",
        reminderDate: new Date(),
        read: false,
      });
      setShowModal(false); // Close modal after adding
    }
  };

  const handleReadStatus = (index) => {
    const updatedNotifications = [...notifications];
    updatedNotifications[index].read = !updatedNotifications[index].read;
    setNotifications(updatedNotifications);
  };

  const filteredNotifications = notifications.filter((notification) =>
    notification.title.toLowerCase().includes(search.toLowerCase()) ||
    notification.description.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredNotifications.length / perPage);

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Powiadomienia</h2>

      {/* Search bar */}
      <TextField
        label="Wyszukaj..."
        variant="outlined"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton edge="end">
                {/* Optional search icon can be added here */}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 4 }}
      />

      {/* Notifications list */}
      <List>
        {paginatedNotifications.length > 0 ? (
          paginatedNotifications.map((notification, index) => (
            <ListItem key={index} button className={notification.read ? "bg-light" : ""}>
              <ListItemIcon>
                <Badge color={"secondary"} variant="dot" invisible={false} >
                  <MailIcon />
                </Badge>
              </ListItemIcon>
              <ListItemText
                primary={notification.title}
                secondary={notification.description || "Brak opisu"}
              />
              <Chip label={notification.reminderDate} color="primary" />
              <Button variant="outlined" size="small" onClick={() => handleReadStatus(index)}>
                {notification.read ? "Mark as Unread" : "Mark as Read"}
              </Button>
            </ListItem>
          ))
        ) : (
          <ListItem>Brak powiadomień</ListItem>
        )}
      </List>

      {/* Modal for adding new notification */}
      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogTitle>Dodaj Powiadomienie</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            variant="outlined"
            fullWidth
            value={newNotification.title}
            onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            value={newNotification.description}
            onChange={(e) => setNewNotification({ ...newNotification, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <DateTimePicker
            onChange={(date) => setNewNotification({ ...newNotification, reminderDate: date })}
            value={newNotification.reminderDate}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddNotification} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
        />
      </Box>

      {/* Floating action button */}
      <Fab color="secondary" aria-label="add" sx={{ position: 'fixed', bottom: 20, right: 20 }} onClick={() => setShowModal(true)}>
        <AddIcon />
      </Fab>
    </div>
  );
};

export default Notifications;
