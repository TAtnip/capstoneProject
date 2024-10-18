import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../api';
import { REFRESH_TOKEN, ACCESS_TOKEN } from '../constants';

// This component is the protected route which wraps each page. It checks for authorization via the JWT tokens.

function ProtectedRoute({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(null);

  // Function to refresh the token
  const refreshToken = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);
    try {
      const res = await api.post('/api/token/refresh/', { refresh: refreshToken });
      if (res.status === 200) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.log(error);
      setIsAuthorized(false);
    }
  };

  // Function to check if the token is expired and handle authentication
  const auth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      setIsAuthorized(false);
      return;
    }
    const decoded = jwtDecode(token);
    const tokenExpiration = decoded.exp;
    const now = Date.now() / 1000;

    if (tokenExpiration < now) {
      await refreshToken();  // Refresh token if expired
    } else {
      setIsAuthorized(true); // Token is still valid
    }
  };

  // Use useEffect to handle authentication check on mount
  useEffect(() => {
    auth();
  }, []);

  if (isAuthorized === null) {
    return <div>Loading...</div>; // Loading state while checking auth
  }

  return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;