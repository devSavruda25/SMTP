import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Button, Card, ProgressBar, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export default function Empdashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [employeeData, setEmployeeData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Dummy data for dashboard widgets
  const [dashboardData, setDashboardData] = useState({
    tasks: {
      completed: 12,
      pending: 5,
      overdue: 2,
    },
    projects: [
      { id: 1, name: 'Website Redesign', progress: 75, deadline: '2023-12-15' },
      { id: 2, name: 'Mobile App Development', progress: 30, deadline: '2024-02-20' },
      { id: 3, name: 'Database Migration', progress: 90, deadline: '2023-11-30' },
    ],
    upcomingEvents: [
      { id: 1, title: 'Team Meeting', date: '2023-11-20 10:00', location: 'Conference Room A' },
      { id: 2, title: 'Project Review', date: '2023-11-22 14:30', location: 'Zoom' },
      { id: 3, title: 'Training Session', date: '2023-11-25 09:00', location: 'Training Room 2' },
    ],
    performance: {
      rating: 4.2,
      feedback: 'You are performing above expectations. Keep up the good work!',
    },
    recentActivities: [
      { id: 1, action: 'Completed task', details: 'Homepage redesign', time: '2 hours ago' },
      { id: 2, action: 'Submitted report', details: 'Q3 Performance Review', time: '1 day ago' },
      { id: 3, action: 'Attended meeting', details: 'Project kickoff', time: '2 days ago' },
    ],
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    const fetchEmployeeData = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token from storage:', token);
        
        if (!token) {
          throw new Error('No authentication token found. Please login again.');
        }

        const decoded = jwtDecode(token);
        console.log('Decoded token:', decoded);
        
        if (!decoded?.id) {
          throw new Error('Invalid token format. Missing employee ID.');
        }

        const response = await axios.get(`http://localhost:5000/api/employee/${decoded.id}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });

        console.log('API Response:', response.data);
        
        if (!response.data) {
          throw new Error('Empty response received from server');
        }

        // Handle different response structures
        const data = response.data.data || response.data;
        
        if (!data.name && !data.email) {
          throw new Error('Employee data is incomplete in the response');
        }

        setEmployeeData({
          name: data.name || 'Employee',
          email: data.email || ''
        });

      } catch (err) {
        console.error('API Error:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        
        let errorMessage = err.message;
        
        if (err.response) {
          if (err.response.status === 401) {
            errorMessage = 'Session expired. Please login again.';
          } else if (err.response.data?.message) {
            errorMessage = err.response.data.message;
          }
        }
        
        setError(errorMessage);
        
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          navigate('/emplogin');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
    return () => clearInterval(timer);
  }, [navigate]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 5) return { text: 'Good Night', emoji: '🌙' };
    if (hour < 12) return { text: 'Good Morning', emoji: '☀️' };
    if (hour < 17) return { text: 'Good Afternoon', emoji: '🌤️' };
    if (hour < 21) return { text: 'Good Evening', emoji: '🌆' };
    return { text: 'Good Night', emoji: '🌃' };
  };

  const greeting = getGreeting();

  if (loading) {
    return (
      <div className="dashboard-content" style={{ marginLeft: '270px', padding: '10px' }}>
        <Container fluid>
          <Alert variant="info" className="d-flex align-items-center">
            <div className="spinner-border me-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div>
              <h5>Loading your dashboard...</h5>
              <p className="mb-0">Please wait while we fetch your information</p>
            </div>
          </Alert>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-content" style={{ marginLeft: '270px', padding: '10px' }}>
        <Container fluid>
          <Alert variant="danger">
            <h5>Unable to load dashboard</h5>
            <p>{error}</p>
            <div className="d-flex gap-2">
              <Button variant="primary" onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <Button variant="outline-primary" onClick={() => {
                localStorage.removeItem('token');
                navigate('/emplogin');
              }}>
                Go to Login
              </Button>
            </div>
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className="dashboard-content" style={{ marginLeft: '270px', padding: '10px' }}>
      <Container fluid>
        <Row className="mb-4 align-items-center">
          <Col md={8}>
            <div className="d-flex align-items-center">
              <div className="greeting-bubble bg-success bg-opacity-10 p-3 rounded-4 me-3">
                <span className="display-6">{greeting.emoji}</span>
              </div>
              <div>
                <h1 className="h3 mb-1 fw-bold">
                  {greeting.text}, {employeeData.name}
                </h1>
                <p className="text-muted small mb-0">
                  {employeeData.email ? `Logged in as ${employeeData.email}` : 'Have a productive day!'}
                </p>
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

        {/* Dashboard Widgets */}
        <Row className="g-4">
          {/* Task Summary Card */}
          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title className="d-flex justify-content-between align-items-center">
                  <span>Task Summary</span>
                  <Badge bg="primary" pill>
                    {dashboardData.tasks.completed + dashboardData.tasks.pending + dashboardData.tasks.overdue} Total
                  </Badge>
                </Card.Title>
                <div className="d-flex justify-content-between mb-3">
                  <div>
                    <h6 className="text-success">Completed</h6>
                    <h3>{dashboardData.tasks.completed}</h3>
                  </div>
                  <div>
                    <h6 className="text-warning">Pending</h6>
                    <h3>{dashboardData.tasks.pending}</h3>
                  </div>
                  <div>
                    <h6 className="text-danger">Overdue</h6>
                    <h3>{dashboardData.tasks.overdue}</h3>
                  </div>
                </div>
                <Button variant="outline-primary" size="sm" className="w-100">
                  View All Tasks
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Performance Card */}
          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title>Your Performance</Card.Title>
                <div className="text-center mb-3">
                  <div className="display-4 fw-bold text-primary">
                    {dashboardData.performance.rating}/5
                  </div>
                  <div className="text-muted mb-3">Current Rating</div>
                  <ProgressBar now={dashboardData.performance.rating * 20} className="mb-3" />
                </div>
                <Card.Text className="text-muted">
                  <small>{dashboardData.performance.feedback}</small>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          {/* Upcoming Events Card */}
          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title>Upcoming Events</Card.Title>
                <div className="list-group list-group-flush">
                  {dashboardData.upcomingEvents.map(event => (
                    <div key={event.id} className="list-group-item border-0 px-0 py-2">
                      <div className="d-flex justify-content-between">
                        <strong>{event.title}</strong>
                        <small className="text-muted">{moment(event.date).format('MMM D')}</small>
                      </div>
                      <div className="d-flex justify-content-between">
                        <small>{event.location}</small>
                        <small>{moment(event.date).format('h:mm A')}</small>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline-secondary" size="sm" className="w-100 mt-2">
                  View Calendar
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Projects Progress */}
          <Col md={8}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>Your Projects</Card.Title>
                {dashboardData.projects.map(project => (
                  <div key={project.id} className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>{project.name}</span>
                      <small className="text-muted">Due: {moment(project.deadline).format('MMM D, YYYY')}</small>
                    </div>
                    <ProgressBar 
                      now={project.progress} 
                      label={`${project.progress}%`} 
                      variant={project.progress > 80 ? 'success' : project.progress > 50 ? 'info' : 'warning'}
                    />
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>

          {/* Recent Activities */}
          <Col md={4}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>Recent Activities</Card.Title>
                <div className="list-group list-group-flush">
                  {dashboardData.recentActivities.map(activity => (
                    <div key={activity.id} className="list-group-item border-0 px-0 py-2">
                      <div className="d-flex">
                        <div className="me-3">
                          <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-2">
                            <i className="bi bi-check-circle-fill"></i>
                          </div>
                        </div>
                        <div>
                          <h6 className="mb-0">{activity.action}</h6>
                          <small className="text-muted">{activity.details}</small>
                          <div className="text-muted small">{activity.time}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  ); 
}