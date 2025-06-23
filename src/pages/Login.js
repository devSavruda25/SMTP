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

export default function Login({ setToken }) {
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
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password
      });

      const storage = formData.rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', res.data.token);
      setToken(res.data.token);

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid login credentials');
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
                  <h2 className="h4">Admin Portal</h2>
                  <p className="text-muted">Sign in to access your dashboard</p>
                </div>

                {error && (
                  <Alert variant="danger" className="text-center">
                    {error}
                  </Alert>
                )}

                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <EnvelopeFill />
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="admin@company.com"
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide a valid email.
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <LockFill />
                      </InputGroup.Text>
                      <Form.Control
                        type={formData.showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                        minLength={6}
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() => setFormData({...formData, showPassword: !formData.showPassword})}
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
                    <Link to="/forgot-password" className="text-decoration-none small">
                      Forgot password?
                    </Link>
                  </div>

                  <div className="d-grid mb-3">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                          Signing in...
                        </>
                      ) : 'Sign In'}
                    </Button>
                  </div>

                  <div className="text-center small">
                    <Link 
                      to="/emplogin" 
                      className="text-decoration-none d-flex align-items-center justify-content-center"
                    >
                      <PersonBadge className="me-1" size={14} />
                      Employee Login
                    </Link>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            <div className="text-center mt-3 text-muted small">
              © {new Date().getFullYear()} Company Name. All rights reserved.
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}