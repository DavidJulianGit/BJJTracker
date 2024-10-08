import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function NavigationBar() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate('/login');
	};

	return (
		<Navbar bg="primary" expand="md" fixed="top">
			<Container>
				<Navbar.Brand as={Link} to="/" className='text-white'>BJJ Tracker</Navbar.Brand>
				<Navbar.Toggle aria-controls="basic-navbar-nav" />
				<Navbar.Collapse id="basic-navbar-nav">
					<Nav className="ms-auto">
						{user ? (
							<>
								<Nav.Link as={Link} to="/tags" className='text-white'>Tags</Nav.Link>
								<Nav.Link as={Link} to="/profile" className='text-white'>Profile</Nav.Link>
								<Nav.Link as={Link} to="/techniques" className='text-white'>Techniques</Nav.Link>
								<Nav.Link as={Link} to="/sessions" className='text-white'>Sessions</Nav.Link>
								<p onClick={handleLogout} style={{ cursor: 'pointer' }} className='text-white align-self-center px-0 mx-2 my-0'>Logout</p>
							</>
						) : (
							<>
								<Nav.Link as={Link} to="/login" className='text-white'>Login</Nav.Link>
								<Nav.Link as={Link} to="/signup" className='text-white'>Sign Up</Nav.Link>
							</>
						)}
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
}
