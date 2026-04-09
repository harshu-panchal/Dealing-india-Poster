import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AdminAuthContext = createContext();

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminInfo');
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
    setLoading(false);
  }, []);

  const loginAdmin = async (username, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/admin/login`, { username, password });
      setAdmin(data);
      localStorage.setItem('adminInfo', JSON.stringify(data));
      localStorage.setItem('isAdminAuthenticated', 'true');
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const logoutAdmin = () => {
    localStorage.removeItem('adminInfo');
    localStorage.removeItem('isAdminAuthenticated');
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, loginAdmin, logoutAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
