
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, FileText, Plus } from 'lucide-react';

// Mock data - in a real app would come from API
const dashboardData = {
  activeReviewCycle: {
    name: 'FY 2024-25 Annual Review',
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    frequency: 'quarterly',
    currentWindow: 'Q1 Review',
    status: 'In Progress',
    daysRemaining: 21
  },
  metrics: {
    employeesWithGoals: 18,
    totalEmployees: 24,
    reviewsCompleted: 15,
    reviewsDue: 9
  },
  recentActivity: [
    { id: 1, type: 'cycle', message: 'Q1 Review window is now open', timestamp: '2 days ago' },
    { id: 2, type: 'review', message: 'Alex Smith completed self-review', timestamp: '3 days ago' },
    { id: 3, type: 'goals', message: 'James Wilson updated team KPIs', timestamp: '1 week ago' }
  ]
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage review cycles and monitor system performance</p>
        </div>
        <Button onClick={() => navigate('/cycles/new')} className="bg-kpi-blue hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          New Review Cycle
        </Button>
      </div>
      
      {/* Active Review Cycle */}
      <Card className="hover-scale">
        <CardHeader className="pb-2">
          <CardTitle>Active Review Cycle</CardTitle>
          <CardDescription>
            {dashboardData.activeReviewCycle.status === 'In Progress' ? (
              <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">
                Active
              </span>
            ) : (
              <span className="text-sm px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                No Active Cycle
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dashboardData.activeReviewCycle ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">{dashboardData.activeReviewCycle.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDate(dashboardData.activeReviewCycle.startDate)} - {formatDate(dashboardData.activeReviewCycle.endDate)}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm mb-1">Current Window: <span className="font-medium">{dashboardData.activeReviewCycle.currentWindow}</span></p>
                  <p className="text-sm text-muted-foreground">
                    {dashboardData.activeReviewCycle.daysRemaining} days remaining
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => navigate(`/cycles/1`)}>
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-muted-foreground">No active review cycle</p>
              <Button onClick={() => navigate('/cycles/new')} variant="link" className="mt-2">
                Create a new cycle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Users size={18} className="mr-2 text-kpi-blue" />
              Goal Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {dashboardData.metrics.employeesWithGoals} of {dashboardData.metrics.totalEmployees} employees
              </span>
              <span className="text-sm font-medium">
                {Math.round((dashboardData.metrics.employeesWithGoals / dashboardData.metrics.totalEmployees) * 100)}%
              </span>
            </div>
            <Progress 
              value={(dashboardData.metrics.employeesWithGoals / dashboardData.metrics.totalEmployees) * 100}
              className="h-2"
            />
          </CardContent>
        </Card>
        
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <FileText size={18} className="mr-2 text-kpi-teal" />
              Reviews Completed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {dashboardData.metrics.reviewsCompleted} of {(dashboardData.metrics.reviewsCompleted + dashboardData.metrics.reviewsDue)} reviews
              </span>
              <span className="text-sm font-medium">
                {Math.round((dashboardData.metrics.reviewsCompleted / (dashboardData.metrics.reviewsCompleted + dashboardData.metrics.reviewsDue)) * 100)}%
              </span>
            </div>
            <Progress 
              value={(dashboardData.metrics.reviewsCompleted / (dashboardData.metrics.reviewsCompleted + dashboardData.metrics.reviewsDue)) * 100}
              className="h-2"
            />
          </CardContent>
        </Card>
        
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Calendar size={18} className="mr-2 text-kpi-blue" />
              Review Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">{dashboardData.activeReviewCycle.currentWindow}</p>
                <p className="text-xs text-muted-foreground">Window closing in {dashboardData.activeReviewCycle.daysRemaining} days</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/calendar')}>
                View All
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.recentActivity.map(activity => (
              <div key={activity.id} className="flex items-start space-x-4 pb-4 border-b last:border-0">
                <div className={`rounded-full p-2 ${
                  activity.type === 'cycle' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'review' ? 'bg-green-100 text-green-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {activity.type === 'cycle' ? <Calendar size={16} /> :
                   activity.type === 'review' ? <FileText size={16} /> :
                   <Users size={16} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
