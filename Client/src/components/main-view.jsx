import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import '../scss/custom.scss';

// Components
import NavigationBar from './NavigationBar';
import ProfileView from './ProfileView';
import TrainingSessionsView from './SessionsView';
import TrainingSessionDetailsView from './TrainingSessionDetailsView';
import SignupView from './SignupView';
import LoginView from './LoginView';
import TagsView from './TagsView';
import TechniquesView from './TechniquesView';
import TechniqueDetailsView from './TechniqueDetailsView'; 
import StatisticsView from './StatisticsView';

export default function MainView() {
	const { currentUser } = useSelector((state) => state.user);

	// Set light or dark mode 
	useEffect(() => {
		const savedMode = localStorage.getItem('darkMode');
		document.documentElement.setAttribute('data-bs-theme', savedMode === 'true' ? 'dark' : 'light');
		document.body.setAttribute('data-bs-theme', savedMode === 'true' ? 'dark' : 'light');
	}, []);

	// Set the belt rank theme
	useEffect(() => {
		if (currentUser && currentUser.rank) {
			document.body.setAttribute('data-belt-rank', currentUser.rank);
		} else {
			document.body.setAttribute('data-belt-rank', 'white');
		}
	}, [currentUser]);
	  
	return (
		<BrowserRouter>
			<NavigationBar />
			<Container className="mt-5 pt-5 main-container">
				<Routes>
					<Route path="/signup" element={currentUser ? <Navigate to="/" /> : <SignupView />} />
					<Route path="/login" element={currentUser ? <Navigate to="/" /> : <LoginView />} />
					<Route path="/tags" element={currentUser ? <TagsView /> : <Navigate to="/login" />} />
					<Route path="/profile" element={currentUser ? <ProfileView /> : <Navigate to="/login" />} />
					<Route path="/techniques" element={currentUser ? <TechniquesView /> : <Navigate to="/login" />} />
					<Route path="/techniques/:id" element={currentUser ? <TechniqueDetailsView /> : <Navigate to="/login" />} />
					<Route path="/sessions" element={currentUser ? <TrainingSessionsView /> : <Navigate to="/login" />} />
					<Route path="/statistics" element={currentUser ? <StatisticsView /> : <Navigate to="/login" />} />
					<Route path="/sessions/:id" element={currentUser ? <TrainingSessionDetailsView /> : <Navigate to="/login" />} />
					<Route path="/" element={currentUser ? <Navigate to="/sessions" /> : <Navigate to="/login" />} />
				</Routes>
			</Container>
		</BrowserRouter>
	);
}
