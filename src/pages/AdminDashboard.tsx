import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, FileText, Plus } from 'lucide-react';
import { useActiveReviewCycle } from '@/hooks/useActiveReviewCycle';
import { useEmployeeStats } from '@/hooks/useEmployeeStats';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { Skeleton } from '@/components/ui/skeleton';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { cycle, isLoading: cycleLoading } = useActiveReviewCycle();
  const { stats, isLoading: statsLoading } = useEmployeeStats();
  const { activities, isLoading: activitiesLoading } = useRecentActivity();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate days remaining for the current window if there's an active cycle
  const calculateDaysRemaining = () => {
    if (!cycle) return 0;

    const currentWindow = cycle.windows?.find(w => w.status === 'open');
    if (!currentWindow) return 0;

    const closeDate = new Date(currentWindow.closeDate);
    const today = new Date();
    const diffTime = closeDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = useMemo(() => calculateDaysRemaining(), [cycle]);

  // Get the current window label
  const currentWindowLabel = useMemo(() => {
    if (!cycle) return '';

    const currentWindow = cycle.windows?.find(w => w.status === 'open');
    return currentWindow?.label || '';
  }, [cycle]);

  // Loading state
  if (cycleLoading || statsLoading || activitiesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage review cycles and monitor system performance</p>
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        <Skeleton className="h-48 w-full" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>

        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

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
            {cycle?.status === 'In Progress' ? (
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
          {cycle ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">{cycle.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm mb-1">
                    Current Window: <span className="font-medium">{currentWindowLabel}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {daysRemaining} days remaining
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => navigate(`/cycles/${cycle.id}`)}>
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
                {stats.employeesWithGoals} of {stats.totalEmployees} employees
              </span>
              <span className="text-sm font-medium">
                {Math.round((stats.employeesWithGoals / stats.totalEmployees) * 100)}%
              </span>
            </div>
            <Progress
              value={(stats.employeesWithGoals / stats.totalEmployees) * 100}
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
                {stats.reviewsCompleted} of {(stats.reviewsCompleted + stats.reviewsDue)} reviews
              </span>
              <span className="text-sm font-medium">
                {Math.round((stats.reviewsCompleted / (stats.reviewsCompleted + stats.reviewsDue)) * 100)}%
              </span>
            </div>
            <Progress
              value={(stats.reviewsCompleted / (stats.reviewsCompleted + stats.reviewsDue)) * 100}
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
                <p className="text-sm font-medium">{currentWindowLabel}</p>
                <p className="text-xs text-muted-foreground">Window closing in {daysRemaining} days</p>
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
            {activities.map(activity => (
              <div key={activity.id} className="flex items-start space-x-4 pb-4 border-b last:border-0">
                <div
                  className={`rounded-full p-2 ${
                    activity.type === 'cycle'
                      ? 'bg-blue-100 text-blue-600'
                      : activity.type === 'review'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-purple-100 text-purple-600'
                  }`}
                >
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