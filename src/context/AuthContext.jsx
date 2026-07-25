import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking local storage for an existing session
    try {
      const storedUser = localStorage.getItem('febebo_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Error parsing stored user:', e);
      localStorage.removeItem('febebo_user');
    }
    setLoading(false);
  }, []);

  const login = (mobileOrUsername, role = 'staff', extraData = {}) => {
    // Dummy login logic:
    const hasProfile = true; 
    const dummyUser = { 
      id: extraData.id || Date.now(), 
      mobile: mobileOrUsername, 
      username: mobileOrUsername,
      role, 
      staffRole: extraData.staffRole || 'Cook',
      name: extraData.name || 'Staff Member',
      hasProfile 
    };
    setUser(dummyUser);
    localStorage.setItem('febebo_user', JSON.stringify(dummyUser));
  };

  const completeProfile = () => {
    if (user) {
      const updatedUser = { ...user, hasProfile: true };
      setUser(updatedUser);
      localStorage.setItem('febebo_user', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('febebo_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, completeProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

