
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Save, Trash2, AlertTriangle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data
const teamMembers = [
  { id: "1", name: "Alex Johnson" },
  { id: "2", name: "Morgan Smith" },
  { id: "3", name: "Taylor Wong" },
  { id: "4", name: "Jordan Lee" },
];

const reviewCycles = [
  { id: "1", name: "FY 2024-25 Annual Review" }
];

const existingGoals = {
  "1": [
    { id: "1", kra: "Product Development", kpi: "Complete feature releases on schedule", target: 4, unit: "releases", weight: 25 },
    { id: "2", kra: "Code Quality", kpi: "Maintain code test coverage", target: 85, unit: "%", weight: 20 },
    { id: "3", kra: "Documentation", kpi: "Create user guides for new features", target: 4, unit: "guides", weight: 15 },
    { id: "4", kra: "Collaboration", kpi: "Lead cross-team projects", target: 2, unit: "projects", weight: 20 },
    { id: "5", kra: "Knowledge Sharing", kpi: "Conduct technical workshops", target: 4, unit: "workshops", weight: 20 }
  ],
  "2": [
    { id: "1", kra: "Sales Target", kpi: "Achieve quarterly sales target", target: 500000, unit: "USD", weight: 40 },
    { id: "2", kra: "Client Retention", kpi: "Maintain client retention rate", target: 90, unit: "%", weight: 30 },
    { id: "3", kra: "New Clients", kpi: "Acquire new clients", target: 5, unit: "clients", weight: 30 }
  ]
};

interface KpiFormData {
  kra: string;
  kpi: string;
  target: string;
  unit: string;
  weight: string;
  id?: string;
}

const TeamGoals = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(teamMembers[0].id);
  const [selectedCycle, setSelectedCycle] = useState(reviewCycles[0].id);
  const [goals, setGoals] = useState<KpiFormData[]>([]);
  const [totalWeight, setTotalWeight] = useState(0);
  
  // Load goals when employee changes
  React.useEffect(() => {
    if (existingGoals[selectedEmployee as keyof typeof existingGoals]) {
      const employeeGoals = existingGoals[selectedEmployee as keyof typeof existingGoals].map(goal => ({
        id: goal.id,
        kra: goal.kra,
        kpi: goal.kpi,
        target: goal.target.toString(),
        unit: goal.unit,
        weight: goal.weight.toString()
      }));
      
      setGoals(employeeGoals);
      calculateTotalWeight(employeeGoals);
    } else {
      setGoals([]);
      setTotalWeight(0);
    }
  }, [selectedEmployee]);
  
  const calculateTotalWeight = (goalsArray: KpiFormData[]) => {
    const total = goalsArray.reduce((sum, goal) => sum + (parseInt(goal.weight) || 0), 0);
    setTotalWeight(total);
  };
  
  const addGoal = () => {
    const newGoals = [
      ...goals,
      { kra: '', kpi: '', target: '', unit: '', weight: '' }
    ];
    setGoals(newGoals);
  };
  
  const removeGoal = (index: number) => {
    const newGoals = [...goals];
    newGoals.splice(index, 1);
    setGoals(newGoals);
    calculateTotalWeight(newGoals);
  };
  
  const updateGoal = (index: number, field: keyof KpiFormData, value: string) => {
    const newGoals = [...goals];
    newGoals[index] = { ...newGoals[index], [field]: value };
    setGoals(newGoals);
    
    if (field === 'weight') {
      calculateTotalWeight(newGoals);
    }
  };
  
  const handleSaveGoals = () => {
    // Validate
    const emptyFields = goals.some(goal => 
      !goal.kra || !goal.kpi || !goal.target || !goal.unit || !goal.weight
    );
    
    if (emptyFields) {
      toast.error('Please fill all fields for each KRA/KPI');
      return;
    }
    
    if (totalWeight !== 100) {
      toast.error('Total weight must equal 100%');
      return;
    }
    
    // In a real app, this would be an API call
    toast.success(`Goals saved for ${teamMembers.find(m => m.id === selectedEmployee)?.name}`);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Team Goals</h1>
        <p className="text-muted-foreground">Assign KRAs & KPIs to team members</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Goals</CardTitle>
          <CardDescription>
            Set and review Key Result Areas and Key Performance Indicators
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="employee">Select Team Member</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
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
            
            <div className="space-y-2">
              <Label htmlFor="cycle">Review Cycle</Label>
              <Select value={selectedCycle} onValueChange={setSelectedCycle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select review cycle" />
                </SelectTrigger>
                <SelectContent>
                  {reviewCycles.map(cycle => (
                    <SelectItem key={cycle.id} value={cycle.id}>
                      {cycle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">KRAs & KPIs</h3>
              <div className="flex items-center space-x-2">
                <div className={`text-sm font-medium ${
                  totalWeight === 100 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  Total Weight: {totalWeight}%
                </div>
                {totalWeight !== 100 && (
                  <AlertTriangle size={16} className="text-red-600 dark:text-red-400" />
                )}
              </div>
            </div>
            
            {goals.map((goal, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md space-y-4">
                <div className="flex justify-between">
                  <h4 className="font-medium">Goal {index + 1}</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeGoal(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20 p-1 h-auto"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`kra-${index}`}>Key Result Area (KRA)</Label>
                    <Input 
                      id={`kra-${index}`}
                      value={goal.kra}
                      onChange={(e) => updateGoal(index, 'kra', e.target.value)}
                      placeholder="e.g. Product Development"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`kpi-${index}`}>Key Performance Indicator (KPI)</Label>
                    <Input 
                      id={`kpi-${index}`}
                      value={goal.kpi}
                      onChange={(e) => updateGoal(index, 'kpi', e.target.value)}
                      placeholder="e.g. Complete feature releases on schedule"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`target-${index}`}>Target</Label>
                    <Input 
                      id={`target-${index}`}
                      type="text"
                      value={goal.target}
                      onChange={(e) => updateGoal(index, 'target', e.target.value)}
                      placeholder="e.g. 4"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`unit-${index}`}>Unit</Label>
                    <Input 
                      id={`unit-${index}`}
                      value={goal.unit}
                      onChange={(e) => updateGoal(index, 'unit', e.target.value)}
                      placeholder="e.g. releases, %, USD"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`weight-${index}`}>Weight (%)</Label>
                    <Input 
                      id={`weight-${index}`}
                      type="number"
                      min="1"
                      max="100"
                      value={goal.weight}
                      onChange={(e) => updateGoal(index, 'weight', e.target.value)}
                      placeholder="e.g. 25"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              onClick={addGoal}
              className="w-full border-dashed"
            >
              <Plus size={16} className="mr-2" />
              Add Goal
            </Button>
          </div>
          
          <div className="pt-4 flex justify-end">
            <Button onClick={handleSaveGoals} className="bg-kpi-blue hover:bg-blue-700">
              <Save size={16} className="mr-2" />
              Save Goals
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamGoals;
