import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);

    // Global Interceptor to catch 401s and logout
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const login = async (identifier, otp) => {
    try {
      const isEmail = identifier.includes('@');
      const payload = isEmail ? { email: identifier, otp } : { mobileNumber: identifier, otp };

      const { data } = await axios.post(`${API_URL}/user/verify-otp`, payload);

      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const sendOtp = async (identifier) => {
    try {
      const isEmail = identifier.includes('@');
      const payload = isEmail ? { email: identifier } : { mobileNumber: identifier };

      const { data } = await axios.post(`${API_URL}/user/send-otp`, payload);
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to send OTP';
    }
  };

  const logout = async () => {
    try {
      if (user?.accessToken) {
        await axios.post(`${API_URL}/user/logout`, {}, {
          headers: { Authorization: `Bearer ${user.accessToken}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('userInfo');
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, sendOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
