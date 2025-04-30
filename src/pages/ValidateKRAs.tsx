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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useKRAs } from '@/hooks/useKRAs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approveKRA, rejectKRA, approveKPI, rejectKPI } from '@/services/kraService';
import { useTeamMembers } from '../hooks/useEmployees';
import { useAuth } from '@/contexts/AuthContext';

const ValidateKRAs = () => {
  const { user } = useAuth();
  const { employees: teamMembers, isLoading: teamLoading, error: teamError } = useTeamMembers(user?.id);
  const [selectedEmployee, setSelectedEmployee] = useState<string>(teamMembers?.[0]?.id || '');
  const { kras, isLoading: krasLoading, error: krasError } = useKRAs(selectedEmployee);
  const [expandedKra, setExpandedKra] = useState<string | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  const queryClient = useQueryClient();

  const approveKraMutation = useMutation({
    mutationFn: ({ kraId, feedback }: { kraId: string; feedback: string }) =>
      approveKRA(kraId, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kras'] });
      toast.success('KRA and associated KPIs approved');
    },
    onError: () => {
      toast.error('Failed to approve KRA');
    },
  });

  const rejectKraMutation = useMutation({
    mutationFn: ({ kraId, feedback }: { kraId: string; feedback: string }) =>
      rejectKRA(kraId, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kras'] });
      toast.success('KRA and associated KPIs rejected');
    },
    onError: () => {
      toast.error('Failed to reject KRA');
    },
  });

  const approveKpiMutation = useMutation({
    mutationFn: ({ kpiId, feedback }: { kpiId: string; feedback: string }) =>
      approveKPI(kpiId, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kras'] });
      toast.success('KPI approved');
    },
    onError: () => {
      toast.error('Failed to approve KPI');
    },
  });

  const rejectKpiMutation = useMutation({
    mutationFn: ({ kpiId, feedback }: { kpiId: string; feedback: string }) =>
      rejectKPI(kpiId, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kras'] });
      toast.success('KPI rejected');
    },
    onError: () => {
      toast.error('Failed to reject KPI');
    },
  });

  const handleFeedbackChange = (id: string, feedback: string) => {
    setFeedbackMap(prev => ({ ...prev, [id]: feedback }));
  };

  const handleApproveKra = (kraId: string) => {
    if (!feedbackMap[kraId]) {
      toast.warning('Feedback is recommended for approval');
    }
    approveKraMutation.mutate({
      kraId,
      feedback: feedbackMap[kraId] || '',
    });
  };

  const handleRejectKra = (kraId: string) => {
    if (!feedbackMap[kraId]) {
      toast.error('Feedback is required for rejection');
      return;
    }
    rejectKraMutation.mutate({
      kraId,
      feedback: feedbackMap[kraId],
    });
  };

  const handleApproveKpi = (kpiId: string) => {
    if (!feedbackMap[kpiId]) {
      toast.warning('Feedback is recommended for approval');
    }
    approveKpiMutation.mutate({
      kpiId,
      feedback: feedbackMap[kpiId] || '',
    });
  };

  const handleRejectKpi = (kpiId: string) => {
    if (!feedbackMap[kpiId]) {
      toast.error('Feedback is required for rejection');
      return;
    }
    rejectKpiMutation.mutate({
      kpiId,
      feedback: feedbackMap[kpiId],
    });
  };

  const getEmployeeKras = () => {
    if (activeTab === 'pending') {
      return kras.filter(kra => kra.status === 'pending');
    }
    return kras;
  };

  const pendingKrasCount = kras.filter(kra => kra.status === 'pending').length;

  if (teamLoading || krasLoading) {
    return <div>Loading KRAs and team members...</div>;
  }

  if (teamError || krasError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load data: {teamError?.message || krasError?.message}
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
              <AlertTitle>No KRAs found</AlertTitle>
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
                            <Label htmlFor={`feedback-${kra.id}`}>Feedback (recommended)</Label>
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
                          {kra.kpis.map(kpi => (
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
                                      <Check size={14} className="mr-1" /> Approve
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-red-500 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                      onClick={() => handleRejectKpi(kpi.id)}
                                    >
                                      <X size={14} className="mr-1" /> Reject
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
                          <X size={16} className="mr-2" />
                          Reject KRA & KPIs
                        </Button>
                        <Button
                          variant="outline"
                          className="border-green-500 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                          onClick={() => handleApproveKra(kra.id)}
                        >
                          <Check size={16} className="mr-2" />
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