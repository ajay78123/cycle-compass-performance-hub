
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { AlertCircle, Send, Check, FileText } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data
const employeeWithReviews = [
  { id: "1", name: "Alex Johnson", completed: true },
  { id: "2", name: "Morgan Smith", completed: true },
  { id: "3", name: "Jordan Lee", completed: false },
];

const reviewData = {
  cycle: {
    name: 'FY 2024-25 Annual Review',
    window: 'Q1 Review',
  },
  employee: {
    id: "1",
    name: "Alex Johnson",
    position: "Senior Developer"
  },
  goals: [
    { 
      id: "1", 
      kra: "Product Development", 
      kpi: "Complete feature releases on schedule", 
      target: 4, 
      unit: "releases", 
      weight: 25, 
      progress: 1,
      selfRating: "4",
      selfComment: "I successfully completed the first release ahead of schedule. The team collaboration was excellent, which helped us achieve our goals quickly. I'm tracking well for the next releases as well."
    },
    { 
      id: "2", 
      kra: "Code Quality", 
      kpi: "Maintain code test coverage", 
      target: 85, 
      unit: "%", 
      weight: 20, 
      progress: 90,
      selfRating: "5",
      selfComment: "We've maintained test coverage above target, reaching 90%. I implemented automated testing pipelines which has helped us maintain consistent coverage across all modules."
    },
    { 
      id: "3", 
      kra: "Documentation", 
      kpi: "Create user guides for new features", 
      target: 4, 
      unit: "guides", 
      weight: 15, 
      progress: 1,
      selfRating: "3",
      selfComment: "Completed the first guide for the new authentication system. Need to improve the visualization aspects based on feedback from users."
    },
    { 
      id: "4", 
      kra: "Collaboration", 
      kpi: "Lead cross-team projects", 
      target: 2, 
      unit: "projects", 
      weight: 20, 
      progress: 1,
      selfRating: "4",
      selfComment: "Successfully leading the integration project with the marketing team. Communication has been excellent, though we've had some timeline challenges."
    },
    { 
      id: "5", 
      kra: "Knowledge Sharing", 
      kpi: "Conduct technical workshops", 
      target: 4, 
      unit: "workshops", 
      weight: 20, 
      progress: 0,
      selfRating: "2",
      selfComment: "Haven't been able to schedule any workshops yet due to project deadlines, but have prepared materials for the first two sessions."
    }
  ]
};

const ManagerReview = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(employeeWithReviews[0].id);
  const [reviews, setReviews] = useState(() => 
    reviewData.goals.map(goal => ({
      goalId: goal.id,
      rating: "",
      comment: ""
    }))
  );
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      toast.success('Manager review submitted successfully');
      setSubmitted(true);
      setIsSubmitting(false);
    }, 1000);
  };
  
  const completion = calculateProgress();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manager Reviews</h1>
        <p className="text-muted-foreground">{reviewData.cycle.name} - {reviewData.cycle.window}</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="employee">Select Employee</Label>
        <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
          <SelectTrigger className="w-full md:w-[300px]">
            <SelectValue placeholder="Select employee" />
          </SelectTrigger>
          <SelectContent>
            {employeeWithReviews.map(employee => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.name} {employee.completed && "✓"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {submitted ? (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>
            Your review for {reviewData.employee.name} has been submitted successfully.
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <CardTitle>Manager Review</CardTitle>
                <CardDescription>
                  For: {reviewData.employee.name} - {reviewData.employee.position}
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
                Please review the employee's self-assessment and provide your ratings and feedback for each KPI.
              </AlertDescription>
            </Alert>
            
            {reviewData.goals.map((goal, index) => (
              <div key={goal.id} className="space-y-4 pb-6 border-b last:border-0 last:pb-0">
                <div className="flex justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-lg font-medium">{goal.kra}</h3>
                    <p className="text-muted-foreground">{goal.kpi}</p>
                  </div>
                  <div className="px-2 py-1 h-fit bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs rounded-full">
                    {goal.weight}%
                  </div>
                </div>
                
                <Tabs defaultValue="review">
                  <TabsList className="mb-2">
                    <TabsTrigger value="review">Manager Review</TabsTrigger>
                    <TabsTrigger value="self">Self Assessment</TabsTrigger>
                    <TabsTrigger value="details">Goal Details</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="review" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-medium">Manager Rating</Label>
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
                      
                      <div className="space-y-2">
                        <Label htmlFor={`comment-${index}`} className="font-medium">
                          Manager Feedback
                        </Label>
                        <Textarea 
                          id={`comment-${index}`}
                          value={reviews[index].comment}
                          onChange={(e) => updateReview(index, 'comment', e.target.value)}
                          placeholder="Provide your assessment of the employee's performance in this area..."
                          className="min-h-[120px] resize-none"
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="self" className="space-y-2">
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Self Rating</div>
                        <div className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm font-medium">
                          {goal.selfRating}/5
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Comments</Label>
                        <p className="mt-1 p-3 bg-white dark:bg-gray-800 rounded text-sm">
                          {goal.selfComment}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="details">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Target</Label>
                        <p className="font-medium">{goal.target} {goal.unit}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Current Progress</Label>
                        <p className="font-medium">{goal.progress} {goal.unit}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Completion</Label>
                        <p className="font-medium">
                          {goal.unit === '%' 
                            ? `${goal.progress}%` 
                            : `${Math.round((goal.progress / goal.target) * 100)}%`}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
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
                    Submit Manager Review
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default ManagerReview;
