import { useState, useEffect } from 'react';
import { departmentApi } from '@/api';
import { Department } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Label } from '@/components/ui';
import { Trash2, Plus, Loader2, Building2 } from 'lucide-react';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDeptName, setNewDeptName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await departmentApi.getAll();
      setDepartments(data);
    } catch (err: any) {
      setError("Failed to load departments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    
    try {
      setSubmitting(true);
      setError(null);
      await departmentApi.create({ departmentName: newDeptName });
      setNewDeptName('');
      fetchDepartments();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create department.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;
    try {
      setError(null);
      await departmentApi.delete(id);
      fetchDepartments();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete department.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Departments Management</h2>
          <p className="text-muted-foreground mt-1 text-sm">Manage hospital departments globally.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 text-foreground">
        <Card className="md:col-span-1 h-fit shadow-sm border-border/60 bg-card overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50 pb-6">
            <CardTitle className="text-lg font-bold">Create Department</CardTitle>
            <CardDescription className="text-muted-foreground">Add a new hospital unit.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deptName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Department Name</Label>
                <Input
                  id="deptName"
                  placeholder="e.g. Cardiology"
                  value={newDeptName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDeptName(e.target.value)}
                  disabled={submitting}
                  className="bg-background border-border/50"
                />
              </div>
              <Button type="submit" className="w-full shadow-sm" disabled={submitting || !newDeptName}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Plus className="mr-2 h-4 w-4" /> Add Department
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-sm border-border/60 bg-card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/50">
                    <tr>
                        <th className="px-6 py-4 font-bold tracking-wider">ID</th>
                        <th className="px-6 py-4 font-bold tracking-wider">Department Name</th>
                        <th className="px-6 py-4 text-right font-bold tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 bg-card">
                    {loading ? (
                        <tr><td colSpan={3} className="px-6 py-12 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto opacity-40" /></td></tr>
                    ) : departments.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="px-6 py-16 text-center text-muted-foreground bg-muted/10 font-medium">
                                No hospital departments found in the database.
                            </td>
                        </tr>
                    ) : (
                        departments.map((dept) => (
                        <tr key={dept.departmentId} className="hover:bg-muted/30 transition-colors group">
                            <td className="px-6 py-4 font-bold text-muted-foreground/60">{dept.departmentId}</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Building2 className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="font-bold text-foreground">{dept.departmentName}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                            <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDelete(dept.departmentId)}
                                title="Delete Department"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            </td>
                        </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </Card>
      </div>
    </div>
  );
}
