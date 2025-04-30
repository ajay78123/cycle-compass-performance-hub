
import React, { useState } from 'react';
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

// Mock data
const reviewData = {
  cycle: {
    name: 'FY 2024-25 Annual Review',
    window: 'Q1 Review',
    dueDate: '2024-06-30'
  },
  goals: [
    { id: "1", kra: "Product Development", kpi: "Complete feature releases on schedule", target: 4, unit: "releases", weight: 25, progress: 1 },
    { id: "2", kra: "Code Quality", kpi: "Maintain code test coverage", target: 85, unit: "%", weight: 20, progress: 90 },
    { id: "3", kra: "Documentation", kpi: "Create user guides for new features", target: 4, unit: "guides", weight: 15, progress: 1 },
    { id: "4", kra: "Collaboration", kpi: "Lead cross-team projects", target: 2, unit: "projects", weight: 20, progress: 1 },
    { id: "5", kra: "Knowledge Sharing", kpi: "Conduct technical workshops", target: 4, unit: "workshops", weight: 20, progress: 0 }
  ]
};

const EmployeeReview = () => {
  const [reviews, setReviews] = useState(() => 
    reviewData.goals.map(goal => ({
      goalId: goal.id,
      rating: "",
      comment: ""
    }))
  );
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const updateReview = (index: number, field: 'rating' | 'comment', value: string) => {
    const newReviews = [...reviews];
    newReviews[index] = { ...newReviews[index], [field]: value };
    setReviews(newReviews);
  };
  
  const calculateProgress = () => {
    const totalFields = reviews.length * 2; // Each review needs rating and comment
    let completedFields = 0;
    
    reviews.forEach(review => {
      if (review.rating) completedFields++;
      if (review.comment.trim()) completedFields++;
    });
    
    return Math.round((completedFields / totalFields) * 100);
  };
  
  const handleSubmit = () => {
    // Validate all reviews have ratings and comments
    const incomplete = reviews.some(review => !review.rating || !review.comment.trim());
    
    if (incomplete) {
      toast.error('Please provide both a rating and comment for each KPI');
      return;
    }
    
    setIsSubmitting(true);
    
    // In a real app, this would be an API call
    setTimeout(() => {
      toast.success('Self-review submitted successfully');
      setSubmitted(true);
      setIsSubmitting(false);
    }, 1000);
  };
  
  const completion = calculateProgress();
  
  if (submitted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Self Review</h1>
          <p className="text-muted-foreground">{reviewData.cycle.name} - {reviewData.cycle.window}</p>
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
            {reviewData.goals.map((goal, index) => {
              const review = reviews.find(r => r.goalId === goal.id);
              
              return (
                <div key={goal.id} className="space-y-2 pb-4 border-b last:border-0 last:pb-0">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{goal.kra}</h3>
                    <div className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs rounded-full">
                      {goal.weight}%
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{goal.kpi}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-sm font-medium">Self Rating</p>
                      <p className="text-lg">{review?.rating} / 5</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Target</p>
                      <p className="text-lg">{goal.target} {goal.unit}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm font-medium">Comments</p>
                    <p className="text-sm bg-gray-50 dark:bg-gray-800/50 p-3 rounded mt-1">
                      {review?.comment}
                    </p>
                  </div>
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
        <p className="text-muted-foreground">{reviewData.cycle.name} - {reviewData.cycle.window}</p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <CardTitle>Your Self Review</CardTitle>
              <CardDescription>
                Due by {formatDate(reviewData.cycle.dueDate)}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-kpi-blue rounded-full" 
                  style={{ width: `${completion}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{completion}%</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Please rate your performance and provide comments for each KPI. 
              Your manager will review your self-assessment.
            </AlertDescription>
          </Alert>
          
          {reviewData.goals.map((goal, index) => (
            <div key={goal.id} className="space-y-4 pb-6 border-b last:border-0 last:pb-0">
              <div>
                <h3 className="text-lg font-medium">{goal.kra}</h3>
                <p className="text-muted-foreground">{goal.kpi}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm mb-1">Target: {goal.target} {goal.unit}</p>
                  <p className="text-sm mb-3">Current Progress: {goal.progress} {goal.unit}</p>
                  
                  <div className="space-y-2">
                    <Label className="font-medium">Self Rating</Label>
                    <RadioGroup 
                      value={reviews[index].rating} 
                      onValueChange={(value) => updateReview(index, 'rating', value)}
                      className="flex space-x-2 pt-1"
                    >
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <div key={rating} className="flex flex-col items-center">
                          <RadioGroupItem 
                            value={rating.toString()} 
                            id={`rating-${index}-${rating}`}
                            className="peer sr-only"
                          />
                          <Label 
                            htmlFor={`rating-${index}-${rating}`}
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
                  <Label htmlFor={`comment-${index}`} className="font-medium">
                    Comments
                  </Label>
                  <Textarea 
                    id={`comment-${index}`}
                    value={reviews[index].comment}
                    onChange={(e) => updateReview(index, 'comment', e.target.value)}
                    placeholder="Provide details about your performance, challenges, and achievements..."
                    className="min-h-[120px] resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
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
