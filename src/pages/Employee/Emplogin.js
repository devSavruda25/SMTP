import axios from 'axios';
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const localToken = localStorage.getItem('token');
    const sessionToken = sessionStorage.getItem('token');
    console.log('LocalStorage token:', localToken);
    console.log('SessionStorage token:', sessionToken);
  }, []);

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

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        'http://localhost:5000/api/employee/emplogin',
        {
          email: formData.email,
          password: formData.password
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );

      const token = res.data.token;
      if (!token) throw new Error('No token received');

      const storage = formData.rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', token);
      storage.setItem('role', 'employee');
      storage.setItem('employeeEmail', formData.email);

      setToken(token);
      setRole('employee');
      navigate('/empdashboard', { replace: true });
    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';
      if (err.response) {
        errorMessage = err.response.data.message || `Error: ${err.response.status}`;
        if (err.response.status === 401) errorMessage = 'Invalid email or password';
      } else if (err.request) {
        errorMessage = 'Network error. Check your connection.';
      } else {
        errorMessage = `Error: ${err.message}`;
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
                  <Alert variant="danger" className="text-center" dismissible onClose={() => setError('')}>
                    {error}
                  </Alert>
                )}

                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Email Address</Form.Label>
                    <InputGroup hasValidation>
                      <InputGroup.Text><EnvelopeFill /></InputGroup.Text>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="employee@company.com"
                        required
                        autoComplete="email"
                      />
                      <Form.Control.Feedback type="invalid">
                        Please enter a valid email address.
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formPassword">
                    <Form.Label>Password</Form.Label>
                    <InputGroup hasValidation>
                      <InputGroup.Text><LockFill /></InputGroup.Text>
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
                      >
                        {formData.showPassword ? <EyeSlashFill /> : <EyeFill />}
                      </Button>
                      <Form.Control.Feedback type="invalid">
                        Password must be at least 6 characters.
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
                    <Link to="/forgot-password" className="text-decoration-none small text-primary">
                      Forgot password?
                    </Link>
                  </div>

                  <div className="d-grid mb-3">
                    <Button variant="primary" type="submit" disabled={loading} size="lg">
                      {loading ? (
                        <><Spinner as="span" animation="border" size="sm" className="me-2" />Logging in...</>
                      ) : 'Sign In'}
                    </Button>
                  </div>

                  <div className="text-center small mt-4">
                    <Link to="/" className="text-decoration-none text-primary d-flex align-items-center justify-content-center">
                      <PersonBadge className="me-1" size={14} /> Admin Login
                    </Link>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            <div className="text-center mt-3 text-muted small">
  © {new Date().getFullYear()} <a href="https://savruda.in/" style={{textDecoration: 'none',color: 'inherit'}}>Savruda Innovation</a>. All rights reserved.
</div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
