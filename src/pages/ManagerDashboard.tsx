
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, FileText, AlertCircle } from 'lucide-react';

// Mock data - in a real app would come from API
const dashboardData = {
  activeReviewCycle: {
    name: 'FY 2024-25 Annual Review',
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    currentWindow: 'Q1 Review',
    daysRemaining: 21
  },
  teamMembers: [
    { id: 1, name: 'Alex Johnson', goalsSet: true, reviewCompleted: true },
    { id: 2, name: 'Morgan Smith', goalsSet: true, reviewCompleted: false },
    { id: 3, name: 'Taylor Wong', goalsSet: false, reviewCompleted: false },
    { id: 4, name: 'Jordan Lee', goalsSet: true, reviewCompleted: false }
  ],
  pendingTasks: [
    { id: 1, type: 'goals', employee: 'Taylor Wong', task: 'Set KRAs/KPIs' },
    { id: 2, type: 'review', employee: 'Morgan Smith', task: 'Complete manager review' },
    { id: 3, type: 'review', employee: 'Jordan Lee', task: 'Complete manager review' }
  ]
};

const ManagerDashboard = () => {
  const navigate = useNavigate();
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Calculate team metrics
  const totalTeamMembers = dashboardData.teamMembers.length;
  const membersWithGoals = dashboardData.teamMembers.filter(m => m.goalsSet).length;
  const completedReviews = dashboardData.teamMembers.filter(m => m.reviewCompleted).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manager Dashboard</h1>
        <p className="text-muted-foreground">Manage your team's goals and review progress</p>
      </div>
      
      {/* Active Review Cycle */}
      <Card className="hover-scale">
        <CardHeader className="pb-2">
          <CardTitle>Active Review Cycle</CardTitle>
        </CardHeader>
        <CardContent>
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
                <Button variant="outline" onClick={() => navigate('/reviews')}>
                  View Reviews
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Team Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Users size={18} className="mr-2 text-kpi-blue" />
              Team Goal Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {membersWithGoals} of {totalTeamMembers} team members
              </span>
              <span className="text-sm font-medium">
                {Math.round((membersWithGoals / totalTeamMembers) * 100)}%
              </span>
            </div>
            <Progress 
              value={(membersWithGoals / totalTeamMembers) * 100}
              className="h-2"
            />
            <div className="pt-2">
              <Button variant="link" size="sm" onClick={() => navigate('/team-goals')} className="p-0 h-auto">
                Manage Goals
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <FileText size={18} className="mr-2 text-kpi-teal" />
              Team Reviews Completed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {completedReviews} of {totalTeamMembers} team members
              </span>
              <span className="text-sm font-medium">
                {Math.round((completedReviews / totalTeamMembers) * 100)}%
              </span>
            </div>
            <Progress 
              value={(completedReviews / totalTeamMembers) * 100}
              className="h-2"
            />
            <div className="pt-2">
              <Button variant="link" size="sm" onClick={() => navigate('/reviews')} className="p-0 h-auto">
                View Reviews
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Pending Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <AlertCircle size={18} className="mr-2 text-amber-500" />
            Pending Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData.pendingTasks.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.pendingTasks.map(task => (
                <div key={task.id} className="flex items-start space-x-4 pb-4 border-b last:border-0">
                  <div className={`rounded-full p-2 ${
                    task.type === 'goals' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {task.type === 'goals' ? <Users size={16} /> : <FileText size={16} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{task.task}</p>
                    <p className="text-xs text-muted-foreground">For: {task.employee}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => 
                    navigate(task.type === 'goals' ? '/team-goals' : '/reviews')
                  }>
                    Take Action
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No pending tasks!</p>
          )}
        </CardContent>
      </Card>
      
      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.teamMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between pb-4 border-b last:border-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <span>{member.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`rounded-full h-2 w-2 ${member.goalsSet ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-muted-foreground">
                    {member.goalsSet ? 'Goals Set' : 'Needs Goals'}
                  </span>
                  <div className="w-px h-4 bg-gray-200 mx-2"></div>
                  <div className={`rounded-full h-2 w-2 ${member.reviewCompleted ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                  <span className="text-xs text-muted-foreground">
                    {member.reviewCompleted ? 'Review Done' : 'Review Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerDashboard;
