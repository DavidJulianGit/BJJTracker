import React, { createContext, useContext, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearUserProfile, fetchUserProfile, loginUser, logout as logoutAction } from '../store/slices/userSlice';
import { clearTrainingSessions } from '../store/slices/trainingSessionsSlice';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  const login = useCallback(async (userData) => {
    await dispatch(loginUser(userData));
  }, [dispatch]);

  const logout = useCallback(() => {
    dispatch(logoutAction());
    dispatch(clearTrainingSessions());
  }, [dispatch]);

  const checkTokenValidity = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      logout();
      return false;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/verify-token', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error verifying token:', error);
      logout();
      return false;
    }
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user: currentUser, login, logout, checkTokenValidity }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
