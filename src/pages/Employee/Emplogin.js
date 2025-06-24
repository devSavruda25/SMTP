import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button,
  Form,
  Card,
  Alert,
  Container,
  Row,
  Col,
  InputGroup,
  Spinner
} from 'react-bootstrap';
import {
  EnvelopeFill,
  LockFill,
  PersonBadge,
  EyeFill,
  EyeSlashFill
} from 'react-bootstrap-icons';

export default function EmpLogin({ setToken, setRole }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    showPassword: false,
    rememberMe: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setError('');

    // Validate form before submission
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting login with:', { 
        email: formData.email, 
        rememberMe: formData.rememberMe 
      });

      const res = await axios.post(
        'http://localhost:5000/api/employee/emplogin', 
        {
          email: formData.email,
          password: formData.password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 seconds timeout
        }
      );

      console.log('Login response:', res.data);

      if (!res.data.token) {
        throw new Error('No token received in response');
      }

      const token = res.data.token;
      const storage = formData.rememberMe ? localStorage : sessionStorage;

      storage.setItem('token', token);
      storage.setItem('role', 'employee');
      storage.setItem('employeeEmail', formData.email); // Store email for display

      setToken(token);
      setRole('employee');

      // Redirect to dashboard or intended page
      navigate('/empdashboard', { 
        state: { from: 'login' },
        replace: true 
      });

    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (axios.isCancel(err)) {
        errorMessage = 'Request timed out. Please check your connection.';
      } else if (err.response) {
        // Server responded with error status
        console.error('Server error:', err.response.data);
        errorMessage = err.response.data.message || 
          `Server error: ${err.response.status}`;
        
        // Handle specific status codes
        if (err.response.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (err.response.status === 403) {
          errorMessage = 'Account not authorized';
        } else if (err.response.status === 429) {
          errorMessage = 'Too many attempts. Please try again later.';
        }
      } else if (err.request) {
        // No response received
        console.error('Network error:', err.request);
        errorMessage = 'Network error. Please check your connection.';
      } else {
        // Other errors
        console.error('Login error:', err.message);
        errorMessage = `Login error: ${err.message}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex min-vh-100 align-items-center justify-content-center bg-light">
      <Container style={{ maxWidth: '500px' }}>
        <Row className="justify-content-center">
          <Col>
            <Card className="shadow-sm border-0">
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <PersonBadge size={48} className="text-primary mb-3" />
                  <h2 className="h4">Employee Portal</h2>
                  <p className="text-muted">Sign in to access your dashboard</p>
                </div>

                {error && (
                  <Alert 
                    variant="danger" 
                    className="text-center"
                    dismissible
                    onClose={() => setError('')}
                  >
                    {error}
                  </Alert>
                )}

                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Email Address</Form.Label>
                    <InputGroup hasValidation>
                      <InputGroup.Text>
                        <EnvelopeFill />
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="employee@company.com"
                        required
                        autoFocus
                        autoComplete="email"
                        pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                      />
                      <Form.Control.Feedback type="invalid">
                        Please enter a valid email address.
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formPassword">
                    <Form.Label>Password</Form.Label>
                    <InputGroup hasValidation>
                      <InputGroup.Text>
                        <LockFill />
                      </InputGroup.Text>
                      <Form.Control
                        type={formData.showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                        minLength={6}
                        autoComplete="current-password"
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          showPassword: !prev.showPassword
                        }))}
                        aria-label={formData.showPassword ? 'Hide password' : 'Show password'}
                      >
                        {formData.showPassword ? <EyeSlashFill /> : <EyeFill />}
                      </Button>
                      <Form.Control.Feedback type="invalid">
                        Password must be at least 8 characters.
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <Form.Check
                      type="checkbox"
                      id="rememberMe"
                      label="Remember me"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                    />
                    <Link 
                      to="/forgot-password" 
                      className="text-decoration-none small text-primary"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="d-grid mb-3">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={loading}
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Logging in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </div>

                  <div className="text-center small mt-4">
                    <Link
                      to="/"
                      className="text-decoration-none text-primary d-flex align-items-center justify-content-center"
                    >
                      <PersonBadge className="me-1" size={14} />
                      Admin Login
                    </Link>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            <div className="text-center mt-3 text-muted small">
              © {new Date().getFullYear()} Your Company. All rights reserved.
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}