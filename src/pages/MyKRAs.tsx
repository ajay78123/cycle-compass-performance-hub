import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Trash2, Send, ArrowDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useKRAs, useCreateKRA } from '@/hooks/useKRAs';  
import { useReviewCycles } from '@/hooks/useReviewCycles';  

type KraFormData = {
  name: string;
  description: string;
  kpis: {
    description: string;
    target: number;
    unit: string;
    weight: number;
  }[];
};

const MyKRAs = () => {
  const { user } = useAuth();
  const { data: reviewCycles, isLoading: cyclesLoading } = useReviewCycles();  
  const { data: kras, isLoading: krasLoading } = useKRAs();  
  const { mutate: createKRA } = useCreateKRA();  

  const [selectedCycle, setSelectedCycle] = useState(reviewCycles?.[0]?.id || '');
  const [expandedKra, setExpandedKra] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing');

  const form = useForm<KraFormData>({
    defaultValues: {
      name: '',
      description: '',
      kpis: [{ description: '', target: 0, unit: '', weight: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "kpis"
  });

  // Show loading state
  if (cyclesLoading || krasLoading) {
    return <div>Loading KRA data...</div>;
  }

  const onSubmit = (data: KraFormData) => {
    // Validate total weight = 100%
    const totalWeight = data.kpis.reduce((sum, kpi) => sum + kpi.weight, 0);
    
    if (totalWeight !== 100) {
      toast.error('KPI weights must sum to 100%');
      return;
    }

    createKRA({
      name: data.name,
      description: data.description,
      cycleId: selectedCycle,
      kpis: data.kpis.map(kpi => ({
        description: kpi.description,
        target: parseFloat(kpi.target.toString()),
        unit: kpi.unit,
        weight: parseInt(kpi.weight.toString())
      }))
    }, {
      onSuccess: () => {
        toast.success('KRA created successfully');
        setActiveTab('existing');
        form.reset();
      },
      onError: () => {
        toast.error('Failed to create KRA');
      }
    });
  };

  const addKpi = () => {
    append({ description: '', target: 0, unit: '', weight: 0 });
  };

  const getKpisByKraId = (kraId: string) => {
    return kras?.find(kra => kra.id === kraId)?.kpis || [];
  };
  
  const calculateTotalWeight = () => {
    const weights = form.watch("kpis").map(kpi => Number(kpi.weight));
    return weights.reduce((sum, weight) => sum + weight, 0);
  };
  
  const totalWeight = calculateTotalWeight();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My KRAs & KPIs</h1>
        <p className="text-muted-foreground">Manage your Key Result Areas and Key Performance Indicators</p>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <Label htmlFor="cycle">Review Cycle</Label>
          <Select value={selectedCycle} onValueChange={setSelectedCycle}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select review cycle" />
            </SelectTrigger>
            <SelectContent>
              {reviewCycles?.map(cycle => (
                <SelectItem key={cycle.id} value={cycle.id}>
                  {cycle.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          variant={activeTab === 'new' ? 'secondary' : 'outline'} 
          onClick={() => setActiveTab(activeTab === 'new' ? 'existing' : 'new')}
        >
          {activeTab === 'new' ? 'Cancel' : 'Add New KRA'}
        </Button>
      </div>
      
      {activeTab === 'new' ? (
        <Card>
          <CardHeader>
            <CardTitle>Create New KRA</CardTitle>
            <CardDescription>Define a new Key Result Area with associated KPIs</CardDescription>
          </CardHeader>
          
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">KRA Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Product Development"
                      {...form.register("name", { required: true })}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive">KRA name is required</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">KRA Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the key result area"
                      {...form.register("description")}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Key Performance Indicators</h3>
                    <div className={`text-sm font-medium ${
                      totalWeight === 100 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      Total Weight: {totalWeight}%
                    </div>
                  </div>
                  
                  {fields.map((kpi, index) => (
                    <div key={kpi.id} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md space-y-4">
                      <div className="flex justify-between">
                        <h4 className="font-medium">KPI {index + 1}</h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20 p-1 h-auto"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`kpis.${index}.description`}>KPI Description</Label>
                          <Input 
                            id={`kpis.${index}.description`}
                            placeholder="e.g. Complete feature releases on schedule"
                            {...form.register(`kpis.${index}.description`, { required: true })}
                          />
                          {form.formState.errors.kpis?.[index]?.description && (
                            <p className="text-sm text-destructive">KPI description is required</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`kpis.${index}.target`}>Target</Label>
                          <div className="flex space-x-2">
                            <Input 
                              id={`kpis.${index}.target`}
                              type="number"
                              placeholder="e.g. 4"
                              {...form.register(`kpis.${index}.target`, { 
                                required: true,
                                valueAsNumber: true
                              })}
                            />
                            <Input 
                              id={`kpis.${index}.unit`}
                              placeholder="Unit (e.g. releases, %)"
                              {...form.register(`kpis.${index}.unit`, { required: true })}
                            />
                          </div>
                          {(form.formState.errors.kpis?.[index]?.target || form.formState.errors.kpis?.[index]?.unit) && (
                            <p className="text-sm text-destructive">Target and unit are required</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`kpis.${index}.weight`}>Weight (%)</Label>
                          <Input 
                            id={`kpis.${index}.weight`}
                            type="number"
                            min="1"
                            max="100"
                            placeholder="e.g. 25"
                            {...form.register(`kpis.${index}.weight`, { 
                              required: true,
                              valueAsNumber: true,
                              min: 1,
                              max: 100
                            })}
                          />
                          {form.formState.errors.kpis?.[index]?.weight && (
                            <p className="text-sm text-destructive">Weight must be between 1 and 100</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={addKpi}
                    className="w-full border-dashed"
                  >
                    <Plus size={16} className="mr-2" />
                    Add KPI
                  </Button>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end space-x-2">
                <Button 
                  type="submit"
                  disabled={totalWeight !== 100}
                  className="bg-kpi-blue hover:bg-blue-700"
                >
                  <Send size={16} className="mr-2" />
                  Submit for Approval
                </Button>
              </CardFooter>
            </form>
          </FormProvider>
        </Card>
      ) : (
        <div className="space-y-4">
          {kras?.length === 0 ? (
            <Alert>
              <AlertTitle>No KRAs found</AlertTitle>
              <AlertDescription>
                You haven't created any Key Result Areas yet. Click "Add New KRA" to get started.
              </AlertDescription>
            </Alert>
          ) : (
            kras?.map(kra => (
              <Card key={kra.id} className="overflow-hidden">
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
                      {expandedKra === kra.id ? <ArrowDown size={16} /> : <ArrowDown size={16} />}
                    </Button>
                  </div>
                </CardHeader>
                
                {expandedKra === kra.id && (
                  <CardContent>
                    <div className="space-y-4">
                      {kra.feedback && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md mb-4">
                          <p className="text-sm font-medium">Manager Feedback:</p>
                          <p className="text-sm">{kra.feedback}</p>
                        </div>
                      )}
                      
                      <h4 className="text-sm font-medium">KPIs:</h4>
                      <div className="space-y-3">
                        {getKpisByKraId(kra.id).map(kpi => (
                          <div 
                            key={kpi.id} 
                            className="border p-3 rounded-md"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium">{kpi.description}</p>
                                <div className="text-sm text-muted-foreground">
                                  Target: {kpi.target} {kpi.unit} | Weight: {kpi.weight}%
                                </div>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                kpi.status === 'approved' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                  : kpi.status === 'rejected'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                              }`}>
                                {kpi.status.charAt(0).toUpperCase() + kpi.status.slice(1)}
                              </span>
                            </div>
                            
                            {kpi.feedback && (
                              <div className="text-sm bg-gray-50 dark:bg-gray-800/50 p-2 rounded mt-2">
                                <span className="font-medium">Feedback: </span>
                                {kpi.feedback}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MyKRAs;