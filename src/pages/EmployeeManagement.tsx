import React, { useState } from 'react';  
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';  
import { Button } from '@/components/ui/button';  
import { Input } from '@/components/ui/input';  
import { Label } from '@/components/ui/label';  
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';  
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';  
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';  
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';  
import { useToast } from '@/components/ui/use-toast';  
import { Plus, Search, Edit, Trash2, AlertCircle } from 'lucide-react';  
  
// This would be replaced with API calls in a real implementation  
const mockEmployees = [  
  { id: '1', name: 'John Doe', email: 'john.doe@example.com', department: 'Engineering', role: 'employee', manager: 'Jane Smith' },  
  { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', department: 'Engineering', role: 'manager', manager: 'Mike Johnson' },  
  { id: '3', name: 'Mike Johnson', email: 'mike.johnson@example.com', department: 'Product', role: 'manager', manager: '' },  
];  
  
const EmployeeManagement = () => {  
  const { toast } = useToast();  
  const [employees, setEmployees] = useState(mockEmployees);  
  const [searchTerm, setSearchTerm] = useState('');  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);  
  const [newEmployee, setNewEmployee] = useState({  
    name: '',  
    email: '',  
    department: '',  
    role: 'employee',  
    manager: '',  
  });  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});  
  
  // Filter employees based on search term  
  const filteredEmployees = employees.filter(  
    (employee) =>  
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||  
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||  
      employee.department.toLowerCase().includes(searchTerm.toLowerCase())  
  );  
  
  const validateForm = () => {  
    const errors: Record<string, string> = {};  
      
    if (!newEmployee.name.trim()) {  
      errors.name = 'Name is required';  
    }  
      
    if (!newEmployee.email.trim()) {  
      errors.email = 'Email is required';  
    } else if (!/\S+@\S+\.\S+/.test(newEmployee.email)) {  
      errors.email = 'Email is invalid';  
    } else if (employees.some(emp => emp.email === newEmployee.email)) {  
      errors.email = 'Email already exists';  
    }  
      
    if (!newEmployee.department.trim()) {  
      errors.department = 'Department is required';  
    }  
      
    if (newEmployee.role === 'employee' && !newEmployee.manager.trim()) {  
      errors.manager = 'Manager is required for employees';  
    }  
      
    setFormErrors(errors);  
    return Object.keys(errors).length === 0;  
  };  
  
  const handleCreateEmployee = () => {  
    if (!validateForm()) return;  
      
    // In a real app, this would be an API call  
    const newEmployeeWithId = {  
      ...newEmployee,  
      id: (employees.length + 1).toString(),  
    };  
      
    setEmployees([...employees, newEmployeeWithId]);  
    setIsCreateDialogOpen(false);  
    setNewEmployee({  
      name: '',  
      email: '',  
      department: '',  
      role: 'employee',  
      manager: '',  
    });  
    setFormErrors({});  
      
    toast({  
      title: "Success",  
      description: "Employee created successfully",  
    });  
  };  
  
  const handleDeleteEmployee = (id: string) => {  
    // In a real app, this would be an API call  
    setEmployees(employees.filter(emp => emp.id !== id));  
      
    toast({  
      title: "Success",  
      description: "Employee deleted successfully",  
    });  
  };  
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {  
    const { name, value } = e.target;  
    setNewEmployee({  
      ...newEmployee,  
      [name]: value,  
    });  
      
    // Clear error for this field if it exists  
    if (formErrors[name]) {  
      setFormErrors({  
        ...formErrors,  
        [name]: '',  
      });  
    }  
  };  
  
  const handleSelectChange = (name: string, value: string) => {  
    setNewEmployee({  
      ...newEmployee,  
      [name]: value,  
    });  
      
    // Clear error for this field if it exists  
    if (formErrors[name]) {  
      setFormErrors({  
        ...formErrors,  
        [name]: '',  
      });  
    }  
  };  
  
  return (  
    <div className="space-y-6">  
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">  
        <div>  
          <h1 className="text-2xl font-bold">Employee Management</h1>  
          <p className="text-muted-foreground">Create and manage employees in the system</p>  
        </div>  
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>  
          <DialogTrigger asChild>  
            <Button className="bg-kpi-blue hover:bg-blue-700">  
              <Plus className="mr-2 h-4 w-4" />  
              Add Employee  
            </Button>  
          </DialogTrigger>  
          <DialogContent className="sm:max-w-[500px]">  
            <DialogHeader>  
              <DialogTitle>Create New Employee</DialogTitle>  
              <DialogDescription>  
                Add a new employee to the system. They will receive an email to set up their account.  
              </DialogDescription>  
            </DialogHeader>  
            <div className="space-y-4 py-4">  
              <div className="space-y-2">  
                <Label htmlFor="name">Full Name</Label>  
                <Input  
                  id="name"  
                  name="name"  
                  placeholder="John Doe"  
                  value={newEmployee.name}  
                  onChange={handleInputChange}  
                />  
                {formErrors.name && (  
                  <p className="text-sm text-red-500">{formErrors.name}</p>  
                )}  
              </div>  
              <div className="space-y-2">  
                <Label htmlFor="email">Email</Label>  
                <Input  
                  id="email"  
                  name="email"  
                  type="email"  
                  placeholder="john.doe@example.com"  
                  value={newEmployee.email}  
                  onChange={handleInputChange}  
                />  
                {formErrors.email && (  
                  <p className="text-sm text-red-500">{formErrors.email}</p>  
                )}  
              </div>  
              <div className="space-y-2">  
                <Label htmlFor="department">Department</Label>  
                <Input  
                  id="department"  
                  name="department"  
                  placeholder="Engineering"  
                  value={newEmployee.department}  
                  onChange={handleInputChange}  
                />  
                {formErrors.department && (  
                  <p className="text-sm text-red-500">{formErrors.department}</p>  
                )}  
              </div>  
              <div className="space-y-2">  
                <Label htmlFor="role">Role</Label>  
                <Select  
                  value={newEmployee.role}  
                  onValueChange={(value) => handleSelectChange('role', value)}  
                >  
                  <SelectTrigger>  
                    <SelectValue placeholder="Select role" />  
                  </SelectTrigger>  
                  <SelectContent>  
                    <SelectItem value="employee">Employee</SelectItem>  
                    <SelectItem value="manager">Manager</SelectItem>  
                    <SelectItem value="admin">Admin</SelectItem>  
                  </SelectContent>  
                </Select>  
              </div>  
              {newEmployee.role === 'employee' && (  
                <div className="space-y-2">  
                  <Label htmlFor="manager">Manager</Label>  
                  <Select  
                    value={newEmployee.manager}  
                    onValueChange={(value) => handleSelectChange('manager', value)}  
                  >  
                    <SelectTrigger>  
                      <SelectValue placeholder="Select manager" />  
                    </SelectTrigger>  
                    <SelectContent>  
                      {employees  
                        .filter(emp => emp.role === 'manager' || emp.role === 'admin')  
                        .map(manager => (  
                          <SelectItem key={manager.id} value={manager.name}>  
                            {manager.name}  
                          </SelectItem>  
                        ))}  
                    </SelectContent>  
                  </Select>  
                  {formErrors.manager && (  
                    <p className="text-sm text-red-500">{formErrors.manager}</p>  
                  )}  
                </div>  
              )}  
            </div>  
            <DialogFooter>  
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>  
                Cancel  
              </Button>  
              <Button onClick={handleCreateEmployee}>  
                Create Employee  
              </Button>  
            </DialogFooter>  
          </DialogContent>  
        </Dialog>  
      </div>  
  
      <Card>  
        <CardHeader className="pb-3">  
          <CardTitle>Employees</CardTitle>  
          <CardDescription>  
            Manage employee accounts and permissions  
          </CardDescription>  
          <div className="relative mt-2">  
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />  
            <Input  
              placeholder="Search employees..."  
              className="pl-8"  
              value={searchTerm}  
              onChange={(e) => setSearchTerm(e.target.value)}  
            />  
          </div>  
        </CardHeader>  
        <CardContent>  
          {filteredEmployees.length > 0 ? (  
            <Table>  
              <TableHeader>  
                <TableRow>  
                  <TableHead>Name</TableHead>  
                  <TableHead>Email</TableHead>  
                  <TableHead>Department</TableHead>  
                  <TableHead>Role</TableHead>  
                  <TableHead>Manager</TableHead>  
                  <TableHead className="text-right">Actions</TableHead>  
                </TableRow>  
              </TableHeader>  
              <TableBody>  
                {filteredEmployees.map((employee) => (  
                  <TableRow key={employee.id}>  
                    <TableCell className="font-medium">{employee.name}</TableCell>  
                    <TableCell>{employee.email}</TableCell>  
                    <TableCell>{employee.department}</TableCell>  
                    <TableCell className="capitalize">{employee.role}</TableCell>  
                    <TableCell>{employee.manager || '-'}</TableCell>  
                    <TableCell className="text-right">  
                      <div className="flex justify-end gap-2">  
                        <Button variant="ghost" size="icon">  
                          <Edit className="h-4 w-4" />  
                        </Button>  
                        <Button   
                          variant="ghost"   
                          size="icon"   
                          className="text-red-500"  
                          onClick={() => handleDeleteEmployee(employee.id)}  
                        >  
                          <Trash2 className="h-4 w-4" />  
                        </Button>  
                      </div>  
                    </TableCell>  
                  </TableRow>  
                ))}  
              </TableBody>  
            </Table>  
          ) : (  
            <div className="flex flex-col items-center justify-center py-8">  
              <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />  
              <p className="text-muted-foreground">No employees found</p>  
            </div>  
          )}  
        </CardContent>  
        <CardFooter className="border-t px-6 py-4">  
          <p className="text-sm text-muted-foreground">  
            Showing {filteredEmployees.length} of {employees.length} employees  
          </p>  
        </CardFooter>  
      </Card>  
  
      <Alert>  
        <AlertCircle className="h-4 w-4" />  
        <AlertTitle>Bulk Import</AlertTitle>  
        <AlertDescription>  
          Need to add multiple employees at once? Use our CSV import feature.  
          <Button variant="link" className="h-auto p-0 ml-2">  
            Import CSV  
          </Button>  
        </AlertDescription>  
      </Alert>  
    </div>  
  );  
};  
  
export default EmployeeManagement;