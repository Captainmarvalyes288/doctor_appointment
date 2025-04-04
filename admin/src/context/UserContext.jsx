import { createContext, useState, useEffect } from 'react';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

export const UserContext = createContext();

const UserContextProvider = ({ children }) => {
  const [uToken, setUToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (uToken) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [uToken]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${uToken}`
        }
      });
      setUser(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      logout();
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setUToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUToken('');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/user/profile', profileData, {
        headers: {
          'Authorization': `Bearer ${uToken}`
        }
      });
      setUser(response.data);
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
      return false;
    }
  };

  return (
    <UserContext.Provider
      value={{
        uToken,
        user,
        loading,
        login,
        logout,
        updateProfile,
        fetchUserProfile
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

UserContextProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default UserContextProvider; 