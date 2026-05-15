import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { registerFCMToken, removeFCMToken } from '../../../services/pushNotificationService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchFreshProfile = async (storedData) => {
      try {
        const { data } = await axios.get(`${API_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${storedData.accessToken}` }
        });
        // Merge fresh user data with existing tokens
        const updatedInfo = { ...storedData, user: data.user };
        setUser(updatedInfo);
        localStorage.setItem('userInfo', JSON.stringify(updatedInfo));
      } catch (err) {
        console.error('Failed to refresh profile:', err);
        // If profile fetch fails (e.g. invalid token), logout
        if (err.response?.status === 401) {
          logout();
        }
      }
    };

    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchFreshProfile(parsedUser);
    }
    setLoading(false);

    // Global Interceptor to catch 401s and logout
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          const isAdminPath = window.location.pathname.startsWith('/admin');
          if (isAdminPath) {
            window.location.href = '/admin/login';
          } else {
            logout();
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const login = useCallback(async (name, mobileNumber, referralCode, agreedToPolicies) => {
    try {
      const payload = { name, mobileNumber };
      
      if (referralCode) {
        payload.referralCode = referralCode;
      }

      if (agreedToPolicies !== undefined) {
        payload.agreedToPolicies = agreedToPolicies;
      }

      const { data } = await axios.post(`${API_URL}/user/login`, payload);

      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      // Register FCM token after login
      setTimeout(() => registerFCMToken(true), 1000);
      
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  }, [API_URL]);

  const logout = useCallback(async () => {
    try {
      if (user?.accessToken) {
        await axios.post(`${API_URL}/user/logout`, {}, {
          headers: { Authorization: `Bearer ${user.accessToken}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Remove FCM token before clearing user data
      await removeFCMToken();
      setUser(null);
      localStorage.removeItem('userInfo');
    }
  }, [user, API_URL]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
