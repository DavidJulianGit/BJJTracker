import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar3EventFill, GearFill, TagsFill, BoxArrowRight, PersonSquare, PersonFill, PersonPlusFill, BarChartFill, Flower1, MoonFill, SunFill } from 'react-bootstrap-icons';

export default function NavigationBar() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [expanded, setExpanded] = useState(false);
	const [isDarkMode, setIsDarkMode] = useState(false);

	useEffect(() => {
		const savedMode = localStorage.getItem('darkMode');
		setIsDarkMode(savedMode === 'true');
		document.documentElement.setAttribute('data-bs-theme', savedMode === 'true' ? 'dark' : 'light');
	}, []);

	const handleLogout = () => {
		logout();
		navigate('/login');
		setExpanded(false);
	};

	const handleNavItemClick = () => {
		setExpanded(false);
	};

	const toggleDarkMode = () => {
		const newMode = !isDarkMode;
		setIsDarkMode(newMode);
		localStorage.setItem('darkMode', newMode);
		document.documentElement.setAttribute('data-bs-theme', newMode ? 'dark' : 'light');
		document.body.setAttribute('data-bs-theme', newMode ? 'dark' : 'light');
	};

	return (
		<Navbar bg="primary" expand="md" fixed="top" expanded={expanded} onToggle={setExpanded}>
			<Container fluid style={{maxWidth: '1500px'}}>
				<Navbar.Brand as={Link} to="/" className='text-white d-flex align-items-center' onClick={handleNavItemClick}>
					<Flower1 size={20} className='me-2'/>BJJ Tracker
				</Navbar.Brand>
				<div className="d-flex align-items-center order-md-last">
					<div className="theme-toggle me-3">
						<SunFill size={14} className="theme-icon sun" />
						<label className="switch mx-2">
							<input
								type="checkbox"
								checked={isDarkMode}
								onChange={toggleDarkMode}
							/>
							<span className="slider round"></span>
						</label>
						<MoonFill size={14} className="theme-icon moon" />
					</div>
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
				</div>
				<Navbar.Collapse id="basic-navbar-nav">
					<Nav className="ms-auto">
						{user ? (
							<>
								<Nav.Link as={Link} to="/tags" className='d-flex align-items-center mx-1' onClick={handleNavItemClick}>
									<TagsFill size={16} className='me-2' />Tags
								</Nav.Link>
								<Nav.Link as={Link} to="/techniques" className='d-flex align-items-center mx-1' onClick={handleNavItemClick}>
									<GearFill size={16} className='me-2' />Techniques
								</Nav.Link>
								<Nav.Link as={Link} to="/sessions" className='d-flex align-items-center mx-1' onClick={handleNavItemClick}>
									<Calendar3EventFill size={16} className='me-2' />Sessions
								</Nav.Link>
								<Nav.Link as={Link} to="/statistics" className='d-flex align-items-center mx-1' onClick={handleNavItemClick}>
									<BarChartFill size={16} className='me-2' />Statistics
								</Nav.Link>
								<Nav.Link as={Link} to="/profile" className='d-flex align-items-center mx-1' onClick={handleNavItemClick}>
									<PersonSquare size={16} className='me-2' />Profile
								</Nav.Link>
								<Nav.Link onClick={handleLogout} className='d-flex align-items-center mx-1'>
									<BoxArrowRight size={16} className='me-2' />Logout
								</Nav.Link>
							</>
						) : (
							<>
								<Nav.Link as={Link} to="/login" className='d-flex align-items-center mx-1' onClick={handleNavItemClick}>
									<PersonFill size={16} className='me-2' />Login
								</Nav.Link>
								<Nav.Link as={Link} to="/signup" className='d-flex align-items-center mx-1' onClick={handleNavItemClick}>
									<PersonPlusFill size={16} className='me-2' />Sign Up
								</Nav.Link>
							</>
						)}
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
}
