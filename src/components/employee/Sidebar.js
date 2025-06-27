import React from 'react';
import { useNavigate } from 'react-router-dom';

import { 
  Nav,
  Button,
  Stack
} from 'react-bootstrap';
import {
  Grid, 
  Envelope, 
  BoxArrowRight,
  PersonCircle,
  People,
  // ChatLeftText
} from 'react-bootstrap-icons';

export default function Sidebar({ className }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href='/';
  };

  // Helper function to check active route
  const isActive = (path) => {
    return window.location.pathname === path;
  };

  return (
    <div className={`sidebar ${className} d-flex flex-column bg-white shadow-sm`} style={{ minHeight: '100vh' }}>
      {/* Brand Logo/Name */}
      <div className="d-flex align-items-center p-4 mb-2">
        
        <span className="fs-5 fw-bold text-primary">SAVINEX EMS</span>
      </div>

      {/* Navigation Links */}
      <Nav className="flex-column px-3 flex-grow-1">
        <Nav.Item className="mb-2">
          <Nav.Link 
            onClick={() => navigate('/dashboard')} 
            className={`d-flex align-items-center py-2 px-3 rounded-3 ${isActive('/dashboard') ? 'bg-primary text-white' : 'text-dark hover-bg-light'}`}
          >
            <Grid className="me-3" size={18} />
            <span className="fs-6">Dashboard</span>
          </Nav.Link>
        </Nav.Item>
        
        <Nav.Item className="mb-2">
          <Nav.Link 
            onClick={() => navigate('/send')} 
            className={`d-flex align-items-center py-2 px-3 rounded-3 ${isActive('/send') ? 'bg-primary text-white' : 'text-dark hover-bg-light'}`}
          >
            <Envelope className="me-3" size={18} />
            <span className="fs-6">Send Mail</span>
          </Nav.Link>
        </Nav.Item>
        
        {/* <Nav.Item className="mb-2">
          <Nav.Link 
            onClick={() => navigate('/messenger')} 
            className={`d-flex align-items-center py-2 px-3 rounded-3 ${isActive('/messenger') ? 'bg-primary text-white' : 'text-dark hover-bg-light'}`}
          >
            <ChatLeftText className="me-3" size={18} />
            <span className="fs-6">Messenger</span>
          </Nav.Link>
        </Nav.Item> */}
        
        <Nav.Item className="mb-2">
          <Nav.Link 
            onClick={() => navigate('/empAdd')} 
            className={`d-flex align-items-center py-2 px-3 rounded-3 ${isActive('/empAdd') ? 'bg-primary text-white' : 'text-dark hover-bg-light'}`}
          >
            <People className="me-3" size={18} />
            <span className="fs-6">Employee Management</span>
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* User Profile & Logout */}
      <div className="p-3 mt-auto border-top">
        <Stack direction="horizontal" gap={3} className="mb-3 align-items-center">
          <PersonCircle size={28} className="text-muted" />
          <div>
            <div className="fw-semibold text-dark">Admin User</div>
            <small className="text-muted">admin@example.com</small>
          </div>
        </Stack>
        <Button 
          variant="outline-primary" 
          size="sm" 
          className="w-100 d-flex align-items-center justify-content-center"
          onClick={handleLogout}
        >
          <BoxArrowRight className="me-2" size={16} />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
}