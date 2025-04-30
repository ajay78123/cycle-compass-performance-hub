import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Check, X, ArrowDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { KPI, KRA } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useKRAs } from '@/hooks/useKRAs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';

// Mock users (assuming teamMembers are still needed for selection)
const teamMembers = [
  { id: "3", name: "Employee User" },
  { id: "4", name: "Taylor Wong" },
];

const ValidateKRAs = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(teamMembers[0].id);
  const { kras, kpis, isLoading } = useKRAs(selectedEmployee);
  const [expandedKra, setExpandedKra] = useState<string | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  
  const queryClient = useQueryClient();

  const approveKraMutation = useMutation({
    mutationFn: async ({ kraId, feedback }: { kraId: string, feedback: string }) => {
      return api.patch(`/kras/${kraId}/approve`, { feedback });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kras'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      toast.success('KRA and associated KPIs approved');
    }
  });

  const rejectKraMutation = useMutation({
    mutationFn: async ({ kraId, feedback }: { kraId: string, feedback: string }) => {
      return api.patch(`/kras/${kraId}/reject`, { feedback });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kras'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      toast.success('KRA and associated KPIs rejected with feedback');
    }
  });

  const approveKpiMutation = useMutation({
    mutationFn: async ({ kpiId, feedback }: { kpiId: string, feedback: string }) => {
      return api.patch(`/kpis/${kpiId}/approve`, { feedback });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      toast.success('KPI approved');
    }
  });

  const rejectKpiMutation = useMutation({
    mutationFn: async ({ kpiId, feedback }: { kpiId: string, feedback: string }) => {
      return api.patch(`/kpis/${kpiId}/reject`, { feedback });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
      toast.success('KPI rejected with feedback');
    }
  });

  const handleFeedbackChange = (id: string, feedback: string) => {
    setFeedbackMap(prev => ({ ...prev, [id]: feedback }));
  };

  const handleApproveKra = (kraId: string) => {
    approveKraMutation.mutate({ 
      kraId, 
      feedback: feedbackMap[kraId] || '' 
    });
  };

  const handleRejectKra = (kraId: string) => {
    if (!feedbackMap[kraId]) {
      toast.error('Please provide feedback before rejecting');
      return;
    }

    rejectKraMutation.mutate({ 
      kraId, 
      feedback: feedbackMap[kraId] 
    });
  };

  const handleApproveKpi = (kpiId: string) => {
    approveKpiMutation.mutate({
      kpiId,
      feedback: feedbackMap[kpiId] || ''
    });
  };

  const handleRejectKpi = (kpiId: string) => {
    if (!feedbackMap[kpiId]) {
      toast.error('Please provide feedback before rejecting');
      return;
    }

    rejectKpiMutation.mutate({
      kpiId,
      feedback: feedbackMap[kpiId]
    });
  };

  const getKpisByKraId = (kraId: string) => {
    return kpis.filter(kpi => kpi.kraId === kraId);
  };

  const getEmployeeKras = () => {
    const employeeKras = kras.filter(kra => kra.employeeId === selectedEmployee);
    
    if (activeTab === 'pending') {
      return employeeKras.filter(kra => kra.status === 'pending');
    }
    
    return employeeKras;
  };

  const pendingKrasCount = kras.filter(kra => 
    kra.employeeId === selectedEmployee && kra.status === 'pending'
  ).length;

  if (isLoading) {
    return <div>Loading KRAs and KPIs...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Validate KRAs & KPIs</h1>
        <p className="text-muted-foreground">Review and approve team members' Key Result Areas</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'pending' | 'all')} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="pending">
                Pending 
                {pendingKrasCount > 0 && (
                  <Badge className="ml-2 bg-amber-500">{pendingKrasCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="all">All KRAs</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="space-y-4">
          {getEmployeeKras().length === 0 ? (
            <Alert>
              <AlertTitle>No KRAs pending review</AlertTitle>
              <AlertDescription>
                {activeTab === 'pending' 
                  ? "There are no pending KRAs to review for this team member." 
                  : "This team member hasn't created any KRAs yet."}
              </AlertDescription>
            </Alert>
          ) : (
            getEmployeeKras().map(kra => (
              <Card key={kra.id} className={`overflow-hidden ${
                kra.status === 'approved' 
                  ? 'border-green-200 dark:border-green-900' 
                  : kra.status === 'rejected'
                    ? 'border-red-200 dark:border-red-900'
                    : ''
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        {kra.name}
                        <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                          kra.status === 'approved' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                            : kra.status === 'rejected'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                        }`}>
                          {kra.status.charAt(0).toUpperCase() + kra.status.slice(1)}
                        </span>
                      </CardTitle>
                      {kra.description && (
                        <CardDescription>{kra.description}</CardDescription>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedKra(expandedKra === kra.id ? null : kra.id)}
                    >
                      <ArrowDown size={16} />
                    </Button>
                  </div>
                </CardHeader>
                
                {expandedKra === kra.id && (
                  <>
                    <CardContent>
                      <div className="space-y-4">
                        {kra.status === 'pending' && (
                          <div className="space-y-2">
                            <Label htmlFor={`feedback-${kra.id}`}>Feedback (optional for approval, required for rejection)</Label>
                            <Textarea
                              id={`feedback-${kra.id}`}
                              placeholder="Provide feedback about this KRA..."
                              value={feedbackMap[kra.id] || ''}
                              onChange={(e) => handleFeedbackChange(kra.id, e.target.value)}
                            />
                          </div>
                        )}
                        
                        {kra.feedback && (
                          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md">
                            <p className="text-sm font-medium">Your Feedback:</p>
                            <p className="text-sm">{kra.feedback}</p>
                          </div>
                        )}
                        
                        <Separator />
                        
                        <h4 className="text-sm font-medium">KPIs:</h4>
                        <div className="space-y-4">
                          {getKpisByKraId(kra.id).map(kpi => (
                            <div 
                              key={kpi.id} 
                              className={`border p-4 rounded-md ${
                                kpi.status === 'approved' 
                                  ? 'border-green-200 dark:border-green-900' 
                                  : kpi.status === 'rejected'
                                    ? 'border-red-200 dark:border-red-900'
                                    : ''
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center">
                                    <p className="font-medium">{kpi.description}</p>
                                    <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                                      kpi.status === 'approved' 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                        : kpi.status === 'rejected'
                                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                    }`}>
                                      {kpi.status.charAt(0).toUpperCase() + kpi.status.slice(1)}
                                    </span>
                                  </div>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    Target: {kpi.target} {kpi.unit} | Weight: {kpi.weight}%
                                  </div>
                                </div>
                                
                                {kpi.status === 'pending' && kra.status === 'pending' && (
                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="border-green-500 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                                      onClick={() => handleApproveKpi(kpi.id)}
                                    >
                                      <Check size=14 className="mr-1" /> Approve
                                    </Button>
                                    <Button 
                                      variant="outline"
                                      size="sm"
                                      className="border-red-500 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                      onClick={() => handleRejectKpi(kpi.id)}
                                    >
                                      <X size=14 className="mr-1" /> Reject
                                    </Button>
                                  </div>
                                )}
                              </div>
                              
                              {kpi.status === 'pending' && kra.status === 'pending' && (
                                <div className="mt-2 space-y-2">
                                  <Textarea
                                    placeholder="Provide feedback for this KPI..."
                                    value={feedbackMap[kpi.id] || ''}
                                    onChange={(e) => handleFeedbackChange(kpi.id, e.target.value)}
                                    className="text-sm"
                                  />
                                </div>
                              )}
                              
                              {kpi.feedback && (
                                <div className="text-sm bg-gray-50 dark:bg-gray-800/50 p-2 rounded mt-2">
                                  <span className="font-medium">Your Feedback: </span>
                                  {kpi.feedback}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    
                    {kra.status === 'pending' && (
                      <CardFooter className="flex justify-end space-x-2 border-t pt-4">
                        <Button 
                          variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                          onClick={() => handleRejectKra(kra.id)}
                        >
                          <X size=16 className="mr-2" />
                          Reject KRA & KPIs
                        </Button>
                        <Button 
                          variant="outline"
                          className="border-green-500 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                          onClick={() => handleApproveKra(kra.id)}
                        >
                          <Check size=16 className="mr-2" />
                          Approve KRA & KPIs
                        </Button>
                      </CardFooter>
                    )}
                  </>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidateKRAs;