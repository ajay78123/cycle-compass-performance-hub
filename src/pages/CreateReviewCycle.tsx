
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const CreateReviewCycle = () => {
  const navigate = useNavigate();
  const [cycleName, setCycleName] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [frequency, setFrequency] = useState<'quarterly' | 'half-yearly'>('quarterly');
  const [previewWindows, setPreviewWindows] = useState<any[]>([]);
  
  const generateWindows = () => {
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }
    
    if (startDate >= endDate) {
      toast.error('End date must be after start date');
      return;
    }
    
    // Calculate time difference
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 180) {
      toast.error('Review cycle must be at least 6 months long');
      return;
    }
    
    const windows = [];
    const cycleStartDate = new Date(startDate);
    const cycleEndDate = new Date(endDate);
    
    if (frequency === 'quarterly') {
      const quarterlength = Math.floor(diffDays / 4);
      
      for (let i = 0; i < 4; i++) {
        const windowStartDate = new Date(cycleStartDate);
        windowStartDate.setDate(windowStartDate.getDate() + (quarterlength * i));
        
        const windowEndDate = new Date(windowStartDate);
        windowEndDate.setDate(windowEndDate.getDate() + quarterlength - 1);
        
        // Ensure last window doesn't exceed cycle end date
        if (i === 3) {
          windows.push({
            label: `Q${i + 1} Review`,
            openDate: windowStartDate,
            closeDate: cycleEndDate
          });
        } else {
          windows.push({
            label: `Q${i + 1} Review`,
            openDate: windowStartDate,
            closeDate: windowEndDate
          });
        }
      }
    } else {
      // Half-yearly
      const halfYearLength = Math.floor(diffDays / 2);
      
      for (let i = 0; i < 2; i++) {
        const windowStartDate = new Date(cycleStartDate);
        windowStartDate.setDate(windowStartDate.getDate() + (halfYearLength * i));
        
        const windowEndDate = new Date(windowStartDate);
        windowEndDate.setDate(windowEndDate.getDate() + halfYearLength - 1);
        
        // Ensure last window doesn't exceed cycle end date
        if (i === 1) {
          windows.push({
            label: `H${i + 1} Review`,
            openDate: windowStartDate,
            closeDate: cycleEndDate
          });
        } else {
          windows.push({
            label: `H${i + 1} Review`,
            openDate: windowStartDate,
            closeDate: windowEndDate
          });
        }
      }
    }
    
    setPreviewWindows(windows);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cycleName.trim() || !startDate || !endDate || previewWindows.length === 0) {
      toast.error('Please fill all required fields and generate review windows');
      return;
    }
    
    // In a real app, this would be an API call to create the cycle
    toast.success('Review cycle created successfully');
    navigate('/');
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Review Cycle</h1>
        <p className="text-muted-foreground">Set up a new performance review cycle</p>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Cycle Details</CardTitle>
            <CardDescription>
              Define the time period and structure of the review cycle
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cycleName">Cycle Name</Label>
              <Input 
                id="cycleName" 
                value={cycleName} 
                onChange={(e) => setCycleName(e.target.value)} 
                placeholder="e.g. FY 2024-25 Annual Review" 
                required 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Select start date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Select end date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => date <= (startDate || new Date())}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Review Frequency</Label>
              <RadioGroup 
                value={frequency} 
                onValueChange={(value) => setFrequency(value as 'quarterly' | 'half-yearly')}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="quarterly" id="quarterly" />
                  <Label htmlFor="quarterly">Quarterly (4 reviews per cycle)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="half-yearly" id="half-yearly" />
                  <Label htmlFor="half-yearly">Half-Yearly (2 reviews per cycle)</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="pt-2">
              <Button type="button" onClick={generateWindows} variant="outline">
                Generate Review Windows
              </Button>
            </div>
            
            {previewWindows.length > 0 && (
              <div className="space-y-4">
                <Separator />
                <div>
                  <h3 className="text-lg font-medium mb-2">Review Windows</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    These review windows will be created automatically
                  </p>
                  
                  <div className="space-y-4">
                    {previewWindows.map((window, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <h4 className="font-medium">{window.label}</h4>
                            <p className="text-sm text-muted-foreground">
                              {format(window.openDate, "MMM d, yyyy")} - {format(window.closeDate, "MMM d, yyyy")}
                            </p>
                          </div>
                          <div className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                            {Math.round((window.closeDate.getTime() - window.openDate.getTime()) / (1000 * 60 * 60 * 24))} days
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button type="submit" className="bg-kpi-blue hover:bg-blue-700">
              Create Cycle
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateReviewCycle;
