import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Send, Check } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import { useKRAs } from '@/hooks/useKRAs';
import { useReviewCycles } from '@/hooks/useReviewCycles';
import { useTeamMembers } from '@/hooks/useEmployees';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getSelfReview, submitManagerReview } from '@/services/reviewService';

const ManagerReview = () => {
  const { user } = useAuth();
  const { cycles, isLoading: cyclesLoading, error: cyclesError } = useReviewCycles();
  const { employees: teamMembers, isLoading: teamLoading, error: teamError } = useTeamMembers(user?.id);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [activeCycle, setActiveCycle] = useState<string>('');
  const { kras, isLoading: krasLoading, error: krasError } = useKRAs(selectedEmployee, activeCycle);

  const { data: selfReview, isLoading: reviewLoading, error: reviewError } = useQuery({
    queryKey: ['selfReview', selectedEmployee, activeCycle],
    queryFn: () => getSelfReview(selectedEmployee, activeCycle),
    enabled: !!selectedEmployee && !!activeCycle,
  });

  const submitMutation = useMutation({
    mutationFn: submitManagerReview,
    onSuccess: () => {
      toast.success('Manager review submitted successfully');
      setSubmitted(true);
    },
    onError: () => {
      toast.error('Failed to submit manager review');
      setIsSubmitting(false);
    },
  });

  const [reviews, setReviews] = useState<{ kpiId: string; rating: string; comment: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set active cycle and default employee
  useEffect(() => {
    if (cycles?.length && !activeCycle) {
      const openCycle = cycles.find(c => c.status === 'Open');
      if (openCycle) {
        setActiveCycle(openCycle.id);
      }
    }
    if (teamMembers?.length && !selectedEmployee) {
      setSelectedEmployee(teamMembers[0].id);
    }
  }, [cycles, teamMembers, activeCycle, selectedEmployee]);

  // Initialize manager reviews
  useEffect(() => {
    if (selfReview && kras) {
      const approvedKpis = kras
        .filter(kra => kra.cycleId === activeCycle && kra.status === 'approved')
        .flatMap(kra => kra.kpis)
        .filter(kpi => kpi.status === 'approved');
      setReviews(approvedKpis.map(kpi => ({
        kpiId: kpi.id,
        rating: '',
        comment: '',
      })));
    }
  }, [selfReview, kras, activeCycle]);

  const updateReview = (kpiId: string, field: 'rating' | 'comment', value: string) => {
    setReviews(prev =>
      prev.map(review =>
        review.kpiId === kpiId ? { ...review, [field]: value } : review
      )
    );
  };

  const calculateProgress = () => {
    const totalFields = reviews.length; // Only ratings are required
    const completedFields = reviews.filter(review => review.rating).length;
    return Math.round((completedFields / totalFields) * 100);
  };

  const handleSubmit = () => {
    const incomplete = reviews.some(review => !review.rating);
    if (incomplete) {
      toast.error('Please provide a rating for each KPI');
      return;
    }

    setIsSubmitting(true);
    submitMutation.mutate({
      employeeId: selectedEmployee,
      cycleId: activeCycle,
      reviews: reviews.map(r => ({
        kpiId: r.kpiId,
        rating: parseInt(r.rating),
        comment: r.comment,
      })),
    });
  };

  const completion = calculateProgress();

  if (cyclesLoading || teamLoading || krasLoading || reviewLoading) {
    return <div>Loading review data...</div>;
  }

  if (cyclesError || teamError || krasError || reviewError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load data: {cyclesError?.message || teamError?.message || krasError?.message || reviewError?.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!cycles?.length) {
    return (
      <Alert>
        <AlertTitle>No Review Cycles</AlertTitle>
        <AlertDescription>
          No active review cycles available. Contact an administrator.
        </AlertDescription>
      </Alert>
    );
  }

  if (!teamMembers?.length) {
    return (
      <Alert>
        <AlertTitle>No Team Members</AlertTitle>
        <AlertDescription>
          You have no team members assigned. Contact an administrator.
        </AlertDescription>
      </Alert>
    );
  }

  if (!selfReview) {
    return (
      <Alert>
        <AlertTitle>No Self-Review</AlertTitle>
        <AlertDescription>
          The selected employee has not submitted a self-review for this cycle.
        </AlertDescription>
      </Alert>
    );
  }

  const cycle = cycles.find(c => c.id === activeCycle);
  const approvedKpis = kras
    .filter(kra => kra.cycleId === activeCycle && kra.status === 'approved')
    .flatMap(kra => kra.kpis)
    .filter(kpi => kpi.status === 'approved');

  if (!approvedKpis.length) {
    return (
      <Alert>
        <AlertTitle>No KPIs Available</AlertTitle>
        <AlertDescription>
          No approved KPIs found for the current review cycle.
        </AlertDescription>
      </Alert>
    );
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Manager Review</h1>
          <p className="text-muted-foreground">{cycle?.name} - {teamMembers.find(m => m.id === selectedEmployee)?.name}</p>
        </div>

        <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>
            Your review has been submitted successfully.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Review Summary</CardTitle>
            <CardDescription>
              Your review for {teamMembers.find(m => m.id === selectedEmployee)?.name}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {approvedKpis.map(kpi => {
              const selfReviewData = selfReview.reviews.find(r => r.kpiId === kpi.id);
              const managerReview = reviews.find(r => r.kpiId === kpi.id);
              const kra = kras.find(k => k.kpis.some(kp => kp.id === kpi.id));

              return (
                <div key={kpi.id} className="space-y-2 pb-4 border-b last:border-0 last:pb-0">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{kra?.name}</h3>
                    <div className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs rounded-full">
                      {kpi.weight}%
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{kpi.description}</p>

                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-sm font-medium">Employee Self-Rating</p>
                      <p className="text-lg">{selfReviewData?.rating} / 5</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Your Rating</p>
                      <p className="text-lg">{managerReview?.rating} / 5</p>
                    </div>
                  </div>

                  {selfReviewData?.comment && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Employee Comments</p>
                      <p className="text-sm bg-gray-50 dark:bg-gray-800/50 p-3 rounded mt-1">
                        {selfReviewData.comment}
                      </p>
                    </div>
                  )}

                  {managerReview?.comment && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Your Comments</p>
                      <p className="text-sm bg-gray-50 dark:bg-gray-800/50 p-3 rounded mt-1">
                        {managerReview.comment}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manager Review</h1>
        <p className="text-muted-foreground">{cycle?.name} - {teamMembers.find(m => m.id === selectedEmployee)?.name}</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="employee">Select Team Member</Label>
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-full sm:w-[300px]">
              <SelectValue placeholder="Select team member" />
            </SelectTrigger>
            <SelectContent>
              {teamMembers.map(member => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <CardTitle>Review for {teamMembers.find(m => m.id === selectedEmployee)?.name}</CardTitle>
                <CardDescription>
                  Due by {cycle ? new Date(cycle.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Progress value={completion} className="w-32" />
                <span className="text-sm font-medium">{completion}%</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {approvedKpis.map(kpi => {
              const selfReviewData = selfReview.reviews.find(r => r.kpiId === kpi.id);
              const managerReview = reviews.find(r => r.kpiId === kpi.id);
              const kra = kras.find(k => k.kpis.some(kp => kp.id === kpi.id));

              return (
                <div key={kpi.id} className="space-y-4 pb-6 border-b last:border-0 last:pb-0">
                  <div>
                    <h3 className="text-lg font-medium">{kra?.name}</h3>
                    <p className="text-muted-foreground">{kpi.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm mb-1">Target: {kpi.target} {kpi.unit}</p>
                      <p className="text-sm mb-3">Employee Self-Rating: {selfReviewData?.rating} / 5</p>

                      <div className="space-y-2">
                        <Label className="font-medium">Your Rating</Label>
                        <RadioGroup
                          value={managerReview?.rating}
                          onValueChange={(value) => updateReview(kpi.id, 'rating', value)}
                          className="flex space-x-2 pt-1"
                        >
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <div key={rating} className="flex flex-col items-center">
                              <RadioGroupItem
                                value={rating.toString()}
                                id={`rating-${kpi.id}-${rating}`}
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor={`rating-${kpi.id}-${rating}`}
                                className="h-10 w-10 rounded-full flex items-center justify-center cursor-pointer border border-gray-200
                                  hover:bg-gray-100 peer-data-[state=checked]:bg-kpi-blue
                                  peer-data-[state=checked]:text-white peer-data-[state=checked]:border-kpi-blue"
                              >
                                {rating}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`comment-${kpi.id}`} className="font-medium">
                        Your Comments (optional)
                      </Label>
                      <Textarea
                        id={`comment-${kpi.id}`}
                        value={managerReview?.comment}
                        onChange={(e) => updateReview(kpi.id, 'comment', e.target.value)}
                        placeholder="Provide feedback on the employee's performance..."
                        className="min-h-[120px] resize-none"
                      />
                    </div>
                  </div>

                  {selfReviewData?.comment && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Employee Comments</p>
                      <p className="text-sm bg-gray-50 dark:bg-gray-800/50 p-3 rounded mt-1">
                        {selfReviewData.comment}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>

          <CardFooter>
            <div className="w-full flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-kpi-blue hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>Submitting...</>
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Submit Review
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ManagerReview;