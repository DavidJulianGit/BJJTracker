import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Form, Button, Container, Row, Col, Modal } from 'react-bootstrap';

export default function LoginView() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

  const { login } = useAuth();
  const navigate = useNavigate();

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
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || `HTTP error! status: ${response.status}`);
      }

      const userData = await response.json();
      console.log(userData);
      login(userData);
      navigate('/');
    } catch (error) {
      setModalContent({ title: 'Error', message: error.message || 'An unexpected error occurred during login' });
      setShowModal(true);
    }
  };

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <h3 className="mb-4">Login</h3>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                autoComplete='username'
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </Form.Group>
            <Button type="submit">Login</Button>
          </Form>
        </Col>
      </Row>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modalContent.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalContent.message}</Modal.Body>
      </Modal>
    </Container>
  );
}