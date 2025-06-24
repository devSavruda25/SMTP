import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Button } from 'react-bootstrap';
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
          {/* Your widgets here */}
        </Row>
      </Container>
    </div>
  );
}