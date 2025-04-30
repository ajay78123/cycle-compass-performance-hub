import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { AlertCircle, Send, Check } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from '@/contexts/AuthContext';
import { useKRAs } from '@/hooks/useKRAs';
import { useReviewCycles } from '@/hooks/useReviewCycles';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getSelfReview, submitSelfReview } from '@/services/reviewService';

const EmployeeReview = () => {
  const { user } = useAuth();
  const { cycles, isLoading: cyclesLoading, error: cyclesError } = useReviewCycles();
  const { kras, isLoading: krasLoading, error: krasError } = useKRAs(user?.id);
  const [activeCycle, setActiveCycle] = useState<string>('');

  const { data: selfReview, isLoading: reviewLoading, error: reviewError } = useQuery({
    queryKey: ['selfReview', user?.id, activeCycle],
    queryFn: () => getSelfReview(user!.id, activeCycle),
    enabled: !!user?.id && !!activeCycle,
  });

  const submitMutation = useMutation({
    mutationFn: submitSelfReview,
    onSuccess: () => {
      toast.success('Self-review submitted successfully');
      setSubmitted(true);
    },
    onError: () => {
      toast.error('Failed to submit self-review');
      setIsSubmitting(false);
    },
  });

  const [reviews, setReviews] = useState<{ kpiId: string; rating: string; comment: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set active cycle and initialize reviews
  useEffect(() => {
    if (cycles?.length && !activeCycle) {
      const openCycle = cycles.find(c => c.status === 'Open');
      if (openCycle) {
        setActiveCycle(openCycle.id);
      }
    }
  }, [cycles, activeCycle]);

  useEffect(() => {
    if (kras && !selfReview) {
      const approvedKpis = kras
        .filter(kra => kra.cycleId === activeCycle && kra.status === 'approved')
        .flatMap(kra => kra.kpis)
        .filter(kpi => kpi.status === 'approved');
      setReviews(approvedKpis.map(kpi => ({
        kpiId: kpi.id,
        rating: '',
        comment: '',
      })));
    } else if (selfReview) {
      setReviews(selfReview.reviews.map(r => ({
        kpiId: r.kpiId,
        rating: r.rating.toString(),
        comment: r.comment,
      })));
      setSubmitted(true);
    }
  }, [kras, selfReview, activeCycle]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
      employeeId: user!.id,
      cycleId: activeCycle,
      reviews: reviews.map(r => ({
        kpiId: r.kpiId,
        rating: parseInt(r.rating),
        comment: r.comment,
      })),
    });
  };

  const completion = calculateProgress();

  if (cyclesLoading || krasLoading || reviewLoading) {
    return <div>Loading review data...</div>;
  }

  if (cyclesError || krasError || reviewError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load data: {cyclesError?.message || krasError?.message || reviewError?.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!cycles?.length) {
    return (
      <Alert>
        <AlertTitle>No Review Cycles</AlertTitle>
        <AlertDescription>
          No active review cycles available. Contact your administrator.
        </AlertDescription>
      </Alert>
    );
  }

  const cycle = cycles.find(c => c.id === activeCycle);
  const approvedKpis = kras
    .filter(kra => kra.cycleId === activeCycle && kra.status === 'approved')
    .flatMap(kra => kra.kpis)
    .filter(kpi => kpi.status === 'approved');

  if (!approvedKpis.length && !selfReview) {
    return (
      <Alert>
        <AlertTitle>No KPIs Available</AlertTitle>
        <AlertDescription>
          No approved KPIs found for the current review cycle. Please create and get KRAs approved first.
        </AlertDescription>
      </Alert>
    );
  }

  if (submitted || selfReview) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Self Review</h1>
          <p className="text-muted-foreground">{cycle?.name}</p>
        </div>

        <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>
            Your self-review has been submitted successfully.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Review Summary</CardTitle>
            <CardDescription>
              Your submission will be reviewed by your manager
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {approvedKpis.map(kpi => {
              const review = reviews.find(r => r.kpiId === kpi.id);
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
                      <p className="text-sm font-medium">Self Rating</p>
                      <p className="text-lg">{review?.rating} / 5</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Target</p>
                      <p className="text-lg">{kpi.target} {kpi.unit}</p>
                    </div>
                  </div>

                  {review?.comment && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Comments</p>
                      <p className="text-sm bg-gray-50 dark:bg-gray-800/50 p-3 rounded mt-1">
                        {review.comment}
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
        <h1 className="text-2xl font-bold">Self Review</h1>
        <p className="text-muted-foreground">{cycle?.name}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <CardTitle>Your Self Review</CardTitle>
              <CardDescription>
                Due by {cycle ? formatDate(cycle.endDate) : 'N/A'}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Progress value={completion} className="w-32" />
              <span className="text-sm font-medium">{completion}%</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Please rate your performance for each KPI. Comments are optional but recommended.
              Your manager will review your self-assessment.
            </AlertDescription>
          </Alert>

          {approvedKpis.map(kpi => {
            const review = reviews.find(r => r.kpiId === kpi.id);
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

                    <div className="space-y-2">
                      <Label className="font-medium">Self Rating</Label>
                      <RadioGroup
                        value={review?.rating}
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
                      Comments (optional)
                    </Label>
                    <Textarea
                      id={`comment-${kpi.id}`}
                      value={review?.comment}
                      onChange={(e) => updateReview(kpi.id, 'comment', e.target.value)}
                      placeholder="Provide details about your performance, challenges, and achievements..."
                      className="min-h-[120px] resize-none"
                    />
                  </div>
                </div>
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
  );
};

export default EmployeeReview;