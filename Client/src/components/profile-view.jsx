import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
   Container,
   Row,
   Col,
   Form,
   Button,
   InputGroup,
   Modal
} from 'react-bootstrap';
import { EyeSlashFill, EyeFill, ExclamationTriangleFill } from 'react-bootstrap-icons';

export default function ProfileView() {
   const { user, logout } = useAuth();
   const [localUser, setLocalUser] = useState({
      email: '',
      username: '',
      rank: '',
      stripes: 0
   });
   const [newPassword, setNewPassword] = useState('');
   const [newPasswordRepeat, setNewPasswordRepeat] = useState('');
   const [passwordShown, setPasswordShown] = useState(false);
   const [showModal, setShowModal] = useState(false);
   const [modalData, setModalData] = useState({ title: '', message: '' });
   const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
   const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
   const [deleteConfirmation, setDeleteConfirmation] = useState('');

   useEffect(() => {
      console.log(user);
      
      if (user) {
         setLocalUser({
            email: user.email || '',
            username: user.username || '',
            rank: user.rank || '',
            stripes: user.stripes || 0
         });
      }
   }, [user]);

   const togglePasswordVisibility = () => {
      setPasswordShown(!passwordShown);
   };

   const handleUserUpdateSubmit = async (event) => {
      event.preventDefault();
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token); // Log the token

      if (!token) {
         console.error('No token found in localStorage');
         setModalData({ title: 'Error', message: 'No authentication token found. Please log in again.' });
         setShowModal(true);
         return;
      }

      try {
         const response = await fetch('http://localhost:5000/api/users/me', {
            method: 'PUT',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}` // Ensure there's a space after 'Bearer'
            },
            body: JSON.stringify(localUser)
         });

         console.log('Request headers:', {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
         });
         console.log('Response status:', response.status);
         console.log('Response headers:', response.headers);

         const responseBody = await response.text();
         console.log('Response body:', responseBody);

         if (!response.ok) {
            throw new Error(`Failed to update profile: ${response.status} ${responseBody}`);
         }

         const updatedUser = JSON.parse(responseBody);
         setLocalUser(updatedUser);
         setModalData({ title: 'Success', message: 'Profile updated successfully' });
         setShowModal(true);
      } catch (error) {
         console.error('Error in handleUserUpdateSubmit:', error);
         setModalData({ title: 'Error', message: error.message });
         setShowModal(true);
      }
   };

   const handlePasswordChangeSubmit = async (event) => {
      event.preventDefault();
      setShowPasswordChangeModal(false);

      if (newPassword !== newPasswordRepeat) {
         setModalData({ title: 'Error', message: 'Passwords do not match' });
         setShowModal(true);
         return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
         setModalData({ title: 'Error', message: 'No authentication token found. Please log in again.' });
         setShowModal(true);
         return;
      }

      try {
         const response = await fetch('http://localhost:5000/api/users/change-password', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ newPassword })
         });

         console.log('Response status:', response.status);
         const responseBody = await response.text();
         console.log('Response body:', responseBody);

         if (!response.ok) {
            throw new Error(`Failed to change password: ${response.status} ${responseBody}`);
         }

         setModalData({ title: 'Success', message: 'Password changed successfully' });
         setShowModal(true);
         setNewPassword('');
         setNewPasswordRepeat('');
      } catch (error) {
         console.error('Error in handlePasswordChangeSubmit:', error);
         setModalData({ title: 'Error', message: error.message });
         setShowModal(true);
      }
   };

   const handleDeleteAccount = async () => {
      setShowDeleteConfirmationModal(false);

      if (deleteConfirmation.toLowerCase() !== `delete account ${localUser.username}`.toLowerCase()) {
         setModalData({ 
            title: 'Error', 
            message: 'Confirmation text does not match. Account was not deleted.' 
         });
         setShowModal(true);
         return;
      }

      try {
         const response = await fetch('http://localhost:5000/api/users/me', {
            method: 'DELETE',
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
         });

         if (!response.ok) {
            throw new Error('Failed to delete account');
         }

         logout();
       
      } catch (error) {
         setModalData({ title: 'Error', message: error.message });
         setShowModal(true);
      }
   };

   return (
      <Container className="mt-5">
         <Row>
            <Col>
               <h2 className="mb-4">Profile</h2>
               <Form className="form" onSubmit={handleUserUpdateSubmit}>
                  <Form.Group className="mb-3">
                     <Form.Label>Email</Form.Label>
                     <Form.Control
                        type="email"
                        value={localUser.email}
                        onChange={(e) => setLocalUser({ ...localUser, email: e.target.value })}
                        required
                     />
                  </Form.Group>

                  <Form.Group className="mb-3">
                     <Form.Label>Username</Form.Label>
                     <Form.Control
                        type="text"
                        value={localUser.username}
                        onChange={(e) => setLocalUser({ ...localUser, username: e.target.value })}
                        required
                     />
                  </Form.Group>

                  <Form.Group className="mb-3">
                     <Form.Label>Belt Rank</Form.Label>
                     <Form.Select
                        value={localUser.rank}
                        onChange={(e) => setLocalUser({ ...localUser, rank: e.target.value })}
                     >
                        <option value="white">White</option>
                        <option value="blue">Blue</option>
                        <option value="purple">Purple</option>
                        <option value="brown">Brown</option>
                        <option value="black">Black</option>
                     </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                     <Form.Label>Stripes</Form.Label>
                     <Form.Control
                        type="number"
                        value={localUser.stripes}
                        onChange={(e) => setLocalUser({ ...localUser, stripes: parseInt(e.target.value) })}
                        min="0"
                        max="4"
                     />
                  </Form.Group>

                  <Button type="submit" className="mt-2">
                     Save Changes
                  </Button>
               </Form>

               <hr />

               <h4 className="mt-4">Change Password</h4>
               <Form onSubmit={(e) => { e.preventDefault(); setShowPasswordChangeModal(true); }}>
                  <Form.Group className="mb-3">
                     <Form.Label>New Password</Form.Label>
                     <InputGroup>
                        <Form.Control
                           type={passwordShown ? 'text' : 'password'}
                           value={newPassword}
                           onChange={(e) => setNewPassword(e.target.value)}
                           minLength="8"
                           required
                        />
                        <Button variant="outline-secondary" onClick={togglePasswordVisibility}>
                           {passwordShown ? <EyeSlashFill /> : <EyeFill />}
                        </Button>
                     </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3">
                     <Form.Label>Repeat New Password</Form.Label>
                     <InputGroup>
                        <Form.Control
                           type={passwordShown ? 'text' : 'password'}
                           value={newPasswordRepeat}
                           onChange={(e) => setNewPasswordRepeat(e.target.value)}
                           minLength="8"
                           required
                        />
                        <Button variant="outline-secondary" onClick={togglePasswordVisibility}>
                           {passwordShown ? <EyeSlashFill /> : <EyeFill />}
                        </Button>
                     </InputGroup>
                  </Form.Group>

                  <Button type="submit" className="mt-2">
                     Change Password
                  </Button>
               </Form>

               <hr />

               <h4 className="mt-4">Delete Account</h4>
               <Button variant="danger" onClick={() => setShowDeleteConfirmationModal(true)}>
                  Delete Account
               </Button>
            </Col>
         </Row>

         <Modal show={showPasswordChangeModal} onHide={() => setShowPasswordChangeModal(false)}>
            <Modal.Header closeButton>
               <Modal.Title>Confirm Password Change</Modal.Title>
            </Modal.Header>
            <Modal.Body>Are you sure you want to change your password?</Modal.Body>
            <Modal.Footer>
               <Button variant="secondary" onClick={() => setShowPasswordChangeModal(false)}>Cancel</Button>
               <Button variant="primary" onClick={handlePasswordChangeSubmit}>Confirm</Button>
            </Modal.Footer>
         </Modal>

         <Modal show={showDeleteConfirmationModal} onHide={() => setShowDeleteConfirmationModal(false)}>
            <Modal.Header closeButton>
               <Modal.Title>
                  <ExclamationTriangleFill className="text-danger me-2" />
                  Confirm Account Deletion
               </Modal.Title>
            </Modal.Header>
            <Modal.Body>
               <p>This action <strong>CANNOT</strong> be undone. This will permanently delete your account and all associated data.</p>
               <p>Please type <strong>delete account {localUser.username}</strong> to confirm.</p>
               <Form.Control
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder={`delete account ${localUser.username}`}
               />
            </Modal.Body>
            <Modal.Footer>
               <Button variant="secondary" onClick={() => setShowDeleteConfirmationModal(false)}>Cancel</Button>
               <Button 
                  variant="danger" 
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation.toLowerCase() !== `delete account ${localUser.username}`.toLowerCase()}
               >
                  Delete Account
               </Button>
            </Modal.Footer>
         </Modal>

         <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
               <Modal.Title>{modalData.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{modalData.message}</Modal.Body>
         </Modal>
      </Container>
   );
}