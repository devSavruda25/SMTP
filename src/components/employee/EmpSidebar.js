import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import '../../components/employee/empSidebar.css';
import { Nav, Button, Stack } from 'react-bootstrap';
import {
  Grid,
  BoxArrowRight,
  PersonCircle,
  People,
  ChatLeftText
} from 'react-bootstrap-icons';


export default function EmpSidebar({ className }) {
  
  const navigate = useNavigate();
  const [employee, setEmployee] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/emplogin';
  };

  const isActive = (path) => window.location.pathname === path;

  useEffect(() => {
    const fetchEmployeeData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        const decoded = jwtDecode(token);
        console.log('Decoded token:', decoded);

        try {
          // First try the primary endpoint
          const response = await axios.get(`http://localhost:5000/api/employee/${decoded.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const employeeData = response.data.data || response.data;
          const employeeName = employeeData.name || '';
          
          // Update local state
          setEmployee({
            name: employeeName,
            email: employeeData.email || ''
          });

          

        } catch (apiError) {
          console.warn('Primary API failed, trying fallback:', apiError);
          
          // Fallback to token data if API fails
          const fallbackName = decoded.name || 'Employee';
          setEmployee({
            name: fallbackName,
            email: decoded.email || ''
          });
          
          // Update context with fallback name
          
          
          setError('Profile data might be incomplete - using session information');
        }

      } catch (err) {
        console.error('Error fetching employee data:', err);
        setError('Failed to load profile information');
        
        // Set default values
        setEmployee({
          name: 'Unknown Employee',
          email: ''
        });
       
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, []); // Add setName to dependency array

  return (
    <div className={`sidebar ${className} d-flex flex-column bg-white shadow-sm`} style={{ minHeight: '100vh' }}>
      <div className="d-flex align-items-center p-4 mb-2">
        <span className="fs-5 fw-bold text-primary">SAVINEX EMS</span>
      </div>

      <Nav className="flex-column px-3 flex-grow-1">
        <Nav.Item className="mb-2">
          <Nav.Link
            onClick={() => navigate('/empdashboard')}
            className={`d-flex align-items-center py-2 px-3 rounded-3 ${isActive('/empdashboard') ? 'bg-primary text-white' : 'text-dark hover-bg-light'}`}
          >
            <Grid className="me-3" size={18} />
            <span className="fs-6">Dashboard</span>
          </Nav.Link>
        </Nav.Item>
        <Nav.Item className="mb-2">
          <Nav.Link
            onClick={() => navigate('/empdattendance')}
            className={`d-flex align-items-center py-2 px-3 rounded-3 ${isActive('/attendance') ? 'bg-primary text-white' : 'text-dark hover-bg-light'}`}
          >
            <People className="me-3" size={18} />
            <span className="fs-6">Attendance</span>
          </Nav.Link>
        </Nav.Item>
       
      </Nav>

      <div className="p-3 mt-auto border-top">
        <Stack direction="horizontal" gap={3} className="mb-3 align-items-center">
          <PersonCircle size={28} className="text-muted" />
          <div>
            {loading ? (
              <div className="fw-semibold text-dark">Loading...</div>
            ) : error ? (
              <div className="text-danger">Error: {error}</div>
            ) : (
              <>
                <div className="fw-semibold text-dark">{employee.name || 'No name'}</div>
                <small className="text-muted">{employee.email || 'No email'}</small>
              </>
            )}
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