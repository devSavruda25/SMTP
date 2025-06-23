import React, { useState, useEffect } from 'react';

import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import {
  Envelope,
  People,
  GraphUp,
  // ClockHistory,
  
  PlusCircle,
  ListUl,
  
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import axios from 'axios';
export default function Dashboard() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
const [emailCount, setEmailCount] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Enhanced time-based greeting with emojis
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 5) return { text: 'Good Night', emoji: '🌙' };
    if (hour < 12) return { text: 'Good Morning', emoji: '☀️' };
    if (hour < 17) return { text: 'Good Afternoon', emoji: '🌤️' };
    if (hour < 21) return { text: 'Good Evening', emoji: '🌆' };
    return { text: 'Good Night', emoji: '🌃' };
  };
const fetchEmailCount = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:5000/api/email/history", {
      headers: { Authorization: token },
    });
    setEmailCount(res.data.count);
  } catch (err) {
    console.error("Failed to fetch email count", err);
    setEmailCount("Error");
  }
};
useEffect(() => {
  fetchEmailCount();
}, []);

  // Stats data with improved variants
  const stats = [
    { 
      title: "Emails Sent", 
      value: emailCount !== null ? emailCount : "Loading...", 
      icon: <Envelope size={20} />, 
      
    },
    { 
      title: "Active Users", 
      value: "", 
      icon: <People size={20} />, 
      
    },
    { 
      title: "Open Rate", 
      value: "", 
      icon: <GraphUp size={20} />, 
      
    }
  ];

  

  const greeting = getGreeting();

  return (
    <div className="dashboard-content" style={{marginLeft: '270px', padding: '10px'}}>
      <Container fluid>
        {/* Header Section */}
        <Row className="mb-4 align-items-center">
          <Col md={7}>
            <div className="d-flex align-items-center">
              <div className="greeting-bubble bg-primary bg-opacity-10 p-3 rounded-4 me-3">
                <span className="display-6">{greeting.emoji}</span>
              </div>
              <div>
                <h1 className="h3 mb-1 fw-bold">{greeting.text}, Admin</h1>
                <p className="text-muted small mb-0">Dashboard overview and analytics</p>
              </div>
            </div>
          </Col>
          <Col md={5} className="mt-3 mt-md-0">
            <div className="bg-light p-3 rounded-3 text-end">
              <span className="text-primary fw-semibold">
                {moment(currentTime).format('dddd, MMMM Do YYYY')}
              </span>
              <div className="fs-5 fw-bold">
                {moment(currentTime).format('h:mm:ss A')}
              </div>
            </div>
          </Col>
        </Row>

        {/* Stats Cards - Improved Design */}
        <Row className="g-4 mb-4">
          {stats.map((stat, index) => (
            <Col xl={3} lg={6} md={6} sm={12} key={index}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-3">
                  <div className="d-flex align-items-start">
                    <div className={`bg-${stat.variant}-subtle p-2 rounded-3 me-3`}>
                      {React.cloneElement(stat.icon, { className: `text-${stat.variant}` })}
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="text-muted text-uppercase small fw-semibold mb-1">{stat.title}</h6>
                      <div className="d-flex align-items-baseline">
                        <h3 className="mb-0 fw-bold me-2">{stat.value}</h3>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Main Content Area */}
        <Row className="g-4 mb-4">
          {/* Email Activity Chart */}
          <Col lg={8}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-bottom-0 py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">Email Performance</h5>
                  {/* <div className="d-flex">
                    <Button variant="outline-secondary" size="sm" className="me-2">Week</Button>
                    <Button variant="outline-secondary" size="sm" className="me-2">Month</Button>
                    <Button variant="primary" size="sm">Quarter</Button>
                  </div> */}
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="chart-placeholder bg-light rounded-3 d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                  <div className="text-center">
                    <p className="text-muted mb-2">Email engagement metrics</p>
                    <p className="small text-muted">Open rates, click-through rates, and replies</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          
          <Col lg={4}>
            <Card className="border-0 shadow-sm h-90">
              <Card.Header className="bg-white border-bottom-0 py-3">
                <h5 className="mb-0 fw-bold">Quick Actions</h5>
              </Card.Header>
              <Card.Body className="p-3">
                <div className="d-grid gap-2">
                  <Button
                    variant="outline-secondary"
                    className="py-3 rounded-3 text-start d-flex align-items-center"
                    onClick={() => navigate('/send')}
                  >
                    <PlusCircle size={20} className="me-3" />
                    <div>
                      <div className="fw-bold">Compose New Email</div>
                     
                    </div>
                  </Button>
                  
                  
                  
                  <Button 
                    variant="outline-secondary" 
                    className="py-3 rounded-3 text-start d-flex align-items-center"
                    onClick={() => navigate('/send#email-tabs')}
                  >
                    <ListUl size={20} className="me-3" />
                    <div>
                      <div className="fw-bold">View History</div>
                     
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline-secondary" 
                    className="py-3 rounded-3 text-start d-flex align-items-center"
                  >
                    <People size={20} className="me-3" />
                    <div>
                      <div className="fw-bold">Add Employee</div>
                     
                    </div>
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

      </Container>
    </div>
  );
}