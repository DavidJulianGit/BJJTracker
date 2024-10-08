import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

// Components
import NavigationBar from './navigation-bar'
import ProfileView from './profile-view'
import TrainingSessionsView from './sessions-view'
import SignupView from './signup-view';
import LoginView from './login-view';
import TagsView from './tags-view';
import TechniquesView from './techniques-view';
import TechniqueDetailsView from './technique-details-view'; 

export default function MainView() {
	const { user } = useAuth();

	return (
		<BrowserRouter>
			<NavigationBar />
			<Container className="mt-5 pt-5">
				<Routes>
					<Route path="/signup" element={user ? <Navigate to="/" /> : <SignupView />} />
					<Route path="/login" element={user ? <Navigate to="/" /> : <LoginView />} />
					<Route path="/tags" element={user ? <TagsView /> : <Navigate to="/login" />} />
					<Route path="/profile" element={user ? <ProfileView /> : <Navigate to="/login" />} />
					<Route path="/techniques" element={user ? <TechniquesView /> : <Navigate to="/login" />} />
					<Route path="/techniques/:id" element={user ? <TechniqueDetailsView /> : <Navigate to="/login" />} />
					<Route path="/sessions" element={user ? <TrainingSessionsView /> : <Navigate to="/login" />} />
					<Route path="/" element={user ? <Navigate to="/sessions" /> : <Navigate to="/login" />} />
				</Routes>
			</Container>
		</BrowserRouter>
	);
}
