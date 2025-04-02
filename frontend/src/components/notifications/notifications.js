import React, { useState } from "react";
import { Button, Form, ListGroup, InputGroup, Modal, Badge } from "react-bootstrap";
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import "./notifications.css"


const Notifications = () => {
  // Initial state with example notifications
  const [notifications, setNotifications] = useState([
    {
      title: "New message from the administrator",
      description: "You have a new message from the admin team.",
      date: new Date().toLocaleString(),
      read: false,
    },
    {
      title: "Your reservation has been confirmed",
      description: "Your hotel reservation for tomorrow has been confirmed.",
      date: new Date().toLocaleString(),
      read: false,
    },
    {
      title: "App update available",
      description: "A new update for the app is available.",
      date: new Date().toLocaleString(),
      read: false,
    },
    {
      title: "Payment successfully processed",
      description: "Your recent payment has been processed successfully.",
      date: new Date().toLocaleString(),
      read: true,
    },
    {
      title: "Reminder: Meeting tomorrow at 10:00",
      description: "You have a meeting scheduled for tomorrow at 10:00.",
      date: new Date().toLocaleString(),
      read: false,
    },
  ]);
  const [search, setSearch] = useState("");
  const [newNotification, setNewNotification] = useState({
    title: "",
    description: "",
    reminderDate: new Date(),
    read: false,
  });

  const [showModal, setShowModal] = useState(false);

  // Handle adding new notification
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

  // Handle read/unread status of notification
  const handleReadStatus = (index) => {
    const updatedNotifications = [...notifications];
    updatedNotifications[index].read = !updatedNotifications[index].read;
    setNotifications(updatedNotifications);
  };

  // Filter notifications based on search query
  const filteredNotifications = notifications.filter((notification) =>
    notification.title.toLowerCase().includes(search.toLowerCase()) ||
    notification.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Notifications</h2>

      {/* Search bar */}
      <InputGroup className="mb-4">
        <Form.Control
          placeholder="Search notifications..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>

      {/* Add new notification button */}
      <Button variant="primary" onClick={() => setShowModal(true)} className="mb-4">
        Add Notification
      </Button>

      {/* Notifications list */}
      <ListGroup>
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification, index) => (
            <ListGroup.Item key={index} className={notification.read ? "bg-light" : ""}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5>{notification.title}</h5>
                  <p>{notification.description}</p>
                  <small>{notification.date}</small>
                </div>
                <div className="d-flex align-items-center">
                  {!notification.read && (
                    <Badge pill bg="warning" className="me-2">
                      Unread
                    </Badge>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleReadStatus(index)}
                  >
                    {notification.read ? "Mark as Unread" : "Mark as Read"}
                  </Button>
                </div>
              </div>
            </ListGroup.Item>
          ))
        ) : (
          <ListGroup.Item>No notifications</ListGroup.Item>
        )}
      </ListGroup>

      {/* Modal for adding new notification */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Notification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={newNotification.title}
                onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                placeholder="Enter title"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newNotification.description}
                onChange={(e) => setNewNotification({ ...newNotification, description: e.target.value })}
                placeholder="Enter description"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Reminder Date and Time</Form.Label>
              <DateTimePicker
                onChange={(date) => setNewNotification({ ...newNotification, reminderDate: date })}
                value={newNotification.reminderDate}

              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddNotification}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Notifications;
