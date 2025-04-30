
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Login = () => {
  const { isAuthenticated, login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    try {
      const success = await login(email, password);
      if (!success) {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    }
  };

  const demoCredentials = [
    { role: 'Admin', email: 'admin@example.com', password: 'password' },
    { role: 'Manager', email: 'manager@example.com', password: 'password' },
    { role: 'Employee', email: 'employee@example.com', password: 'password' },
    { role: 'Test Admin', email: 'test@gmail.com', password: 'testpass' },
  ];
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="h-12 w-12 rounded-xl bg-kpi-blue mx-auto mb-4 flex items-center justify-center">
          <span className="text-white font-bold text-xl">K</span>
        </div>
        <h1 className="text-2xl font-bold mb-1">KRA/KPI Cycle & Review App</h1>
        <p className="text-gray-500 dark:text-gray-400">Login to manage performance goals and reviews</p>
      </div>
      
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col">
            <Button 
              type="submit" 
              className="w-full bg-kpi-blue hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            
            <div className="mt-6 space-y-4">
              <p className="text-sm text-center text-gray-500">Demo Accounts</p>
              <div className="grid grid-cols-2 gap-3">
                {demoCredentials.map((cred) => (
                  <Button
                    key={cred.role}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEmail(cred.email);
                      setPassword(cred.password);
                    }}
                    className="text-xs"
                  >
                    {cred.role}
                  </Button>
                ))}
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
