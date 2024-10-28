import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/slices/userSlice';
import { Form, Button, Container, Row, Col, Modal, InputGroup } from 'react-bootstrap';
import { Eye, EyeSlash } from 'react-bootstrap-icons';

export default function LoginView() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser, error, status } = useSelector((state) => state.user);

  useEffect(() => {
    if (currentUser) {
      console.log('User logged in, navigating to home');
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      console.log('Submitting login for:', credentials.email);
      await dispatch(loginUser(credentials)).unwrap();
    } catch (error) {
      console.error('Login error:', error);
      setShowModal(true);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <h3 className="mb-4">Login</h3>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="email">Email</Form.Label>
              <Form.Control
                id="email"
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                autoComplete='username'
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="password">Password</Form.Label>
              <InputGroup>
                <Form.Control
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <Button variant="outline-secondary" onClick={togglePasswordVisibility}>
                  {showPassword ? <EyeSlash /> : <Eye />}
                </Button>
              </InputGroup>
            </Form.Group>
            <Button type="submit">Login</Button>
          </Form>
        </Col>
      </Row>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>{error || 'An unexpected error occurred during login'}</Modal.Body>
      </Modal>
    </Container>
  );
}
