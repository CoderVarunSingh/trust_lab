import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('trustlab_user') || 'null');
    if (stored?.token) {
      setUser(stored);
    }
    setLoading(false);
  }, []);

  const loginUser = (userData) => {
    localStorage.setItem('trustlab_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('trustlab_user');
    setUser(null);
  };

  const updateUser = (data) => {
    const updated = { ...user, ...data };
    localStorage.setItem('trustlab_user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
