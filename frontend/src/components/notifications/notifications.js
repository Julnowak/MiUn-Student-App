import React, {useEffect, useRef, useState} from "react";
import { Button, Form, ListGroup, InputGroup, Modal, Badge } from "react-bootstrap";
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import "./notifications.css"
import Paginator from "../../paginator/paginator";
import client from "../../client";
import {API_BASE_URL} from "../../config";



const Notifications = () => {
  // Initial state with example notifications
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");
  const [newNotification, setNewNotification] = useState({
    title: "",
    description: "",
    reminderDate: new Date(),
    read: false,
  });

  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem("access");



  useEffect(() => {
      const fetchNotifications = async () => {
          try {
              const response = await client.get(API_BASE_URL + "notifications/", {
                  headers: {
                      Authorization: `Bearer ${token}`,
                  },
              });

              setNotifications(response.data)
          } catch (error) {
              console.log("Nie udało się zalogować");
          }
      };

      if (notifications.length < 1 && token) {
          fetchNotifications();
      }
  }, [notifications.length, token]);


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
      <h2 className="mb-4">Powiadomienia</h2>

      {/* Search bar */}
      <InputGroup className="mb-4">
        <Form.Control
          placeholder="Wyszukaj..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>

      {/* Add new notification button */}
      <Button variant="primary" onClick={() => setShowModal(true)} className="mb-4">
        +
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
                  {!notification.isRead && (
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
          <ListGroup.Item>Brak powiadomień</ListGroup.Item>
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


      <Paginator totalPages={10} setCurrentPage={1} currentPage={1}/>
    </div>
  );
};

export default Notifications;
