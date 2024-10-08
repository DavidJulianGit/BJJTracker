import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
   Modal,
   Container,
   Row,
   Col,
   Form,
   Button,
   InputGroup,
} from 'react-bootstrap';
import { EyeSlashFill, EyeFill } from 'react-bootstrap-icons';


export default function SignupView() {
   const { login } = useAuth();
   const [formData, setFormData] = useState({
      email: '',
      password: '',
      username: '',
      birthday: '',
      rank: 'white',
      stripes: 0,
   });
   const [showModal, setShowModal] = useState(false);
   const [modalContent, setModalContent] = useState({ title: '', message: '' });
   const [passwordShown, setPasswordShown] = useState(false);
   const navigate = useNavigate();

   const togglePasswordVisibility = () => {
      setPasswordShown(!passwordShown);
   };

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prevState => ({
         ...prevState,
         [name]: value,
      }));
   };

   const handleSubmit = async (event) => {
      event.preventDefault();
      try {
         const response = await fetch('http://localhost:5000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
         });

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || `HTTP error! status: ${response.status}`);
         }

         const userData = await response.json();
         login(userData);
         setModalContent({ title: 'Welcome', message: `Signup successful! Welcome, ${formData.username || 'user'}.` });
         setShowModal(true);
         setTimeout(() => {
            navigate('/');
         }, 2000);

      } catch (error) {
         console.error('Signup submission error:', error);
         setModalContent({ title: 'Error', message: error.message || 'An unexpected error occurred during signup' });
         setShowModal(true);
      }
   };

   return (
      <Container className="mt-5">
         <Row>
            <Col>
               <h3 className="mb-4">Sign Up</h3>
               <Form className="form" onSubmit={handleSubmit}>
                  <Form.Group className="my-3">
                     <Form.Label htmlFor="email">Email</Form.Label>
                     <Form.Control
                        type="email"
                        id="email"
                        name="email"
                        className="rounded"
                        value={formData.email}
                        onChange={handleChange}
                        required
                     />
                  </Form.Group>

                  <Form.Group className="my-3">
                     <Form.Label htmlFor="Password">Password</Form.Label>
                     <InputGroup>
                        <Form.Control
                           id="Password"
                           name="password"
                           type={passwordShown ? "text" : "password"}
                           value={formData.password}
                           onChange={handleChange}
                           minLength="8"
                           required
                        />
                        <Button
                           variant="outline-secondary"
                           onClick={togglePasswordVisibility}
                        >
                           {passwordShown ? <EyeSlashFill size={20} /> : <EyeFill size={20} />}
                        </Button>
                     </InputGroup>
                  </Form.Group>

                  <Form.Group className="my-3">
                     <Form.Label htmlFor="username">Username</Form.Label>
                     <Form.Control
                        type="text"
                        id="username"
                        name="username"
                        className="rounded"
                        value={formData.username}
                        onChange={handleChange}
                        required
                     />
                  </Form.Group>

                  <Form.Group className="my-3">
                     <Form.Label htmlFor="birthday">Birthday</Form.Label>
                     <Form.Control
                        type="date"
                        id="birthday"
                        name="birthday"
                        className="rounded"
                        value={formData.birthday}
                        onChange={handleChange}
                        required
                     />
                  </Form.Group>

                  <Form.Group className="my-3">
                     <Form.Label htmlFor="rank">Belt Rank</Form.Label>
                     <Form.Select
                        id="rank"
                        name="rank"
                        value={formData.rank}
                        onChange={handleChange}
                        required
                     >
                        <option value="white">White</option>
                        <option value="blue">Blue</option>
                        <option value="purple">Purple</option>
                        <option value="brown">Brown</option>
                        <option value="black">Black</option>
                     </Form.Select>
                  </Form.Group>

                  <Form.Group className="my-3">
                     <Form.Label htmlFor="stripes">Stripes</Form.Label>
                     <Form.Control
                        type="number"
                        id="stripes"
                        name="stripes"
                        className="rounded"
                        value={formData.stripes}
                        onChange={handleChange}
                        min="0"
                        max="4"
                        required
                     />
                  </Form.Group>

                  <Button type="submit" className="mt-2">
                     Sign Up
                  </Button>
               </Form>
            </Col>
         </Row>
         <Modal size="sm" centered animation={false} show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
               <Modal.Title>{modalContent.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{modalContent.message}</Modal.Body>
         </Modal>
      </Container>
   );
}