
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Calendar, Target, FileText, Check } from 'lucide-react';

// Mock data - in a real app would come from API
const dashboardData = {
  currentCycle: {
    name: 'FY 2024-25 Annual Review',
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    currentWindow: 'Q1 Review',
    selfReviewDue: '2024-06-30',
    daysRemaining: 12,
    selfReviewCompleted: false
  },
  goals: [
    { id: 1, kra: 'Product Development', kpi: 'Complete feature releases on schedule', target: 4, unit: 'releases', weight: 25, progress: 1 },
    { id: 2, kra: 'Code Quality', kpi: 'Maintain code test coverage', target: 85, unit: '%', weight: 20, progress: 90 },
    { id: 3, kra: 'Documentation', kpi: 'Create user guides for new features', target: 4, unit: 'guides', weight: 15, progress: 1 },
    { id: 4, kra: 'Collaboration', kpi: 'Lead cross-team projects', target: 2, unit: 'projects', weight: 20, progress: 1 },
    { id: 5, kra: 'Knowledge Sharing', kpi: 'Conduct technical workshops', target: 4, unit: 'workshops', weight: 20, progress: 0 }
  ]
};

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate goal progress
  const calculateOverallProgress = () => {
    let weightedProgress = 0;
    let totalWeight = 0;
    
    dashboardData.goals.forEach(goal => {
      let progressPercent = 0;
      
      // Handle different types of units and progress tracking
      if (typeof goal.progress === 'number') {
        if (goal.unit === '%') {
          // For percentage-based goals, use the progress value directly
          progressPercent = goal.progress;
        } else {
          // For count-based goals, calculate percentage of target
          progressPercent = (goal.progress / goal.target) * 100;
        }
      }
      
      weightedProgress += (progressPercent * goal.weight);
      totalWeight += goal.weight;
    });
    
    return totalWeight > 0 ? Math.round(weightedProgress / totalWeight) : 0;
  };

  const overallProgress = calculateOverallProgress();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Dashboard</h1>
        <p className="text-muted-foreground">Track your goals and review progress</p>
      </div>
      
      {/* Action Card */}
      <Card className="bg-gradient-to-r from-kpi-blue/90 to-kpi-blue text-white hover-scale">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h3 className="text-xl font-medium">{dashboardData.currentCycle.currentWindow}</h3>
              <p className="text-white/80">
                {dashboardData.currentCycle.selfReviewCompleted 
                  ? "You've completed your self review for this period!" 
                  : `Self review due by ${formatDate(dashboardData.currentCycle.selfReviewDue)}`}
              </p>
              {!dashboardData.currentCycle.selfReviewCompleted && (
                <p className="text-sm text-white/70">
                  {dashboardData.currentCycle.daysRemaining} days remaining
                </p>
              )}
            </div>
            <Button 
              variant={dashboardData.currentCycle.selfReviewCompleted ? "outline" : "secondary"} 
              className={dashboardData.currentCycle.selfReviewCompleted 
                ? "border-white/20 text-white hover:bg-white/10" 
                : "bg-white text-kpi-blue hover:bg-white/90"}
              onClick={() => navigate('/goals')}
            >
              {dashboardData.currentCycle.selfReviewCompleted ? 'View Submission' : 'Start Self Review'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Goal Progress */}
      <Card className="hover-scale">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <Target size={18} className="mr-2 text-kpi-blue" />
            Goal Progress
          </CardTitle>
          <CardDescription>
            {overallProgress < 50 ? 'Keep pushing!' : overallProgress < 80 ? 'Good progress!' : 'Excellent work!'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Overall Progress</span>
            <span className="text-sm font-medium">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </CardContent>
        <CardFooter>
          <Button variant="link" onClick={() => navigate('/goals')} className="p-0 h-auto">
            View All Goals
          </Button>
        </CardFooter>
      </Card>
      
      {/* KRAs and KPIs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">My KRAs & KPIs</CardTitle>
          <CardDescription>
            FY 2024-25 Annual Review Cycle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {dashboardData.goals.map((goal, index) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{goal.kra}</h4>
                    <p className="text-sm text-muted-foreground">{goal.kpi}</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs font-medium">
                    {goal.weight}%
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span>Target: {goal.target} {goal.unit}</span>
                  <span>
                    Current: {typeof goal.progress === 'number' ? goal.progress : 0} {goal.unit}
                  </span>
                </div>
                
                <Progress 
                  value={
                    goal.unit === '%' 
                      ? goal.progress 
                      : ((goal.progress as number) / goal.target) * 100
                  } 
                  className="h-2" 
                />
                
                {index < dashboardData.goals.length - 1 && (
                  <div className="pt-4 border-b"></div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Review Cycle Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Calendar size={18} className="mr-2 text-kpi-blue" />
            Review Cycle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium">{dashboardData.currentCycle.name}</h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(dashboardData.currentCycle.startDate)} - {formatDate(dashboardData.currentCycle.endDate)}
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="rounded-full h-2 w-2 bg-green-500"></div>
                <span className="text-sm">Goals Assigned</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`rounded-full h-2 w-2 ${dashboardData.currentCycle.selfReviewCompleted ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                <span className="text-sm">{dashboardData.currentCycle.selfReviewCompleted ? 'Self Review Complete' : 'Self Review Pending'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDashboard;
