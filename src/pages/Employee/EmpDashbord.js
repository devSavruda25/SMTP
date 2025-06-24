import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import moment from 'moment';
import axios from 'axios';

export default function Empdashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchAttendanceStatus();
    fetchDailyTasks();
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 5) return { text: 'Good Night', emoji: '🌙' };
    if (hour < 12) return { text: 'Good Morning', emoji: '☀️' };
    if (hour < 17) return { text: 'Good Afternoon', emoji: '🌤️' };
    if (hour < 21) return { text: 'Good Evening', emoji: '🌆' };
    return { text: 'Good Night', emoji: '🌃' };
  };

  const greeting = getGreeting();

  const fetchAttendanceStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/attendance/status', {
        headers: { Authorization: token },
      });
      setAttendanceStatus(res.data.status); // e.g., "Present", "Absent", "Checked In"
    } catch (err) {
      console.error('Error fetching attendance status', err);
    }
  };

  const fetchDailyTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/tasks/today', {
        headers: { Authorization: token },
      });
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error('Error fetching tasks', err);
    }
  };

  const handleCheckIn = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/attendance/checkin', {}, {
        headers: { Authorization: token },
      });
      fetchAttendanceStatus();
    } catch (err) {
      console.error('Check-in failed', err);
    }
  };

  const handleCheckOut = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/attendance/checkout', {}, {
        headers: { Authorization: token },
      });
      fetchAttendanceStatus();
    } catch (err) {
      console.error('Check-out failed', err);
    }
  };

  return (
    <div className="dashboard-content" style={{ marginLeft: '270px', padding: '10px' }}>
      <Container fluid>
        {/* Header */}
        <Row className="mb-4 align-items-center">
          <Col md={8}>
            <div className="d-flex align-items-center">
              <div className="greeting-bubble bg-success bg-opacity-10 p-3 rounded-4 me-3">
                <span className="display-6">{greeting.emoji}</span>
              </div>
              <div>
                <h1 className="h3 mb-1 fw-bold">{greeting.text}, Employee</h1>
                <p className="text-muted small mb-0">Have a productive day!</p>
              </div>
            </div>
          </Col>
          <Col md={4} className="mt-3 mt-md-0 text-end">
            <div className="bg-light p-3 rounded-3">
              <span className="text-success fw-semibold">
                {moment(currentTime).format('dddd, MMMM Do YYYY')}
              </span>
              <div className="fs-5 fw-bold">
                {moment(currentTime).format('h:mm:ss A')}
              </div>
            </div>
          </Col>
        </Row>

        {/* Attendance Section */}
        <Row className="mb-4">
          <Col md={12}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5 className="fw-bold mb-3">Attendance</h5>
                <p className="text-muted">Status: 
                  <Badge bg={attendanceStatus === 'Checked In' ? 'success' : 'secondary'} className="ms-2">
                    {attendanceStatus || 'Not Marked'}
                  </Badge>
                </p>
                <div className="d-flex gap-2">
                  <Button variant="success" onClick={handleCheckIn} disabled={attendanceStatus === 'Checked In'}>
                    Check In
                  </Button>
                  <Button variant="danger" onClick={handleCheckOut} disabled={attendanceStatus !== 'Checked In'}>
                    Check Out
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Daily Tasks */}
        <Row>
          <Col md={12}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5 className="fw-bold mb-3">Today's Tasks</h5>
                {tasks.length > 0 ? (
                  <ul className="list-group">
                    {tasks.map((task, idx) => (
                      <li className="list-group-item d-flex justify-content-between align-items-center" key={idx}>
                        {task.title}
                        <Badge bg={task.status === 'completed' ? 'success' : 'warning'}>
                          {task.status}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">No tasks assigned today.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
