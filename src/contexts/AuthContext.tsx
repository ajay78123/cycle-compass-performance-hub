import { createContext, useContext, useState, useEffect } from 'react';  
import api from '@/services/api';  
  
export const AuthContext = createContext(null);  
  
export const AuthProvider = ({ children }) => {  
  const [user, setUser] = useState(null);  
  const [isAuthenticated, setIsAuthenticated] = useState(false);  
  const [isLoading, setIsLoading] = useState(true);  
    
  // Check if user is already logged in on mount  
  useEffect(() => {  
    const checkAuth = async () => {  
      const token = localStorage.getItem('token');  
      if (token) {  
        try {  
          const response = await api.get('/auth/me');  
          setUser(response.data);  
          setIsAuthenticated(true);  
        } catch (error) {  
          localStorage.removeItem('token');  
        }  
      }  
      setIsLoading(false);  
    };  
      
    checkAuth();  
  }, []);  
    
  const login = async (email, password) => {  
    try {  
      const response = await api.post('/auth/login', { email, password });  
      localStorage.setItem('token', response.data.token);  
      setUser(response.data.user);  
      setIsAuthenticated(true);  
      return true;  
    } catch (error) {  
      return false;  
    }  
  };  
    
  const logout = () => {  
    localStorage.removeItem('token');  
    setUser(null);  
    setIsAuthenticated(false);  
  };  
    
  return (  
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>  
      {children}  
    </AuthContext.Provider>  
  );  
};  
  
export const useAuth = () => useContext(AuthContext);