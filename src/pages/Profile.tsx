
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <div>Loading profile...</div>;
  }
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Role specific data
  const roleSpecificInfo = () => {
    if (user.role === 'admin') {
      return (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">System Access</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>Full administrative access</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>Cycle management</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>User management</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>Reporting access</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">2024-04-28: </span>
                  Created new review cycle
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">2024-04-26: </span>
                  Updated system settings
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">2024-04-24: </span>
                  Generated reports
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    if (user.role === 'manager') {
      return (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Team Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Team Members:</span>
                  <span className="font-medium">4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Reviews Pending:</span>
                  <span className="font-medium">2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Goals Set:</span>
                  <span className="font-medium">75%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Direct Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="text-sm">Alex Johnson</li>
                <li className="text-sm">Morgan Smith</li>
                <li className="text-sm">Taylor Wong</li>
                <li className="text-sm">Jordan Lee</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    // Employee
    return (
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Review Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Current Cycle:</span>
                <span className="font-medium">FY 2024-25 Annual Review</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">KPIs Assigned:</span>
                <span className="font-medium">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Next Review:</span>
                <span className="font-medium">Q1 Review (12 days remaining)</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Manager</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=manager" />
                <AvatarFallback>MU</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Manager User</p>
                <p className="text-sm text-muted-foreground">manager@example.com</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">View and manage your account information</p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center md:flex-row md:text-left md:items-start md:space-x-6">
            <div className="mb-4 md:mb-0">
              <Avatar className="h-24 w-24 border-2 border-gray-200 dark:border-gray-800">
                <AvatarImage src={user.profilePicture} />
                <AvatarFallback className="text-xl">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <div className="text-muted-foreground">{user.email}</div>
              <div className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full capitalize">
                {user.role}
              </div>
              
              <div className="pt-2 space-y-2">
                <div className="grid grid-cols-1 gap-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Account ID:</span>
                    <span className="text-sm">{user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Last Login:</span>
                    <span className="text-sm">{new Date().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {roleSpecificInfo()}
    </div>
  );
};

export default Profile;
