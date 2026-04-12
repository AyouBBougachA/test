import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2 } from 'lucide-react';
import { User, Role, Department } from '@/types';
import { userApi, roleApi, departmentApi } from '@/api';
import { Button, Input, Label } from '@/components/ui';

const userSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  phoneNumber: z.string().max(30, "Phone number is too long").optional().or(z.literal('')),
  password: z.string().optional(),
  roleId: z.number().min(1, "Role is required"),
  departmentId: z.number().optional().nullable(),
  isActive: z.boolean(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: User | null;
}

export default function UserModal({ isOpen, onClose, onSuccess, user }: UserModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      roleId: 0,
      departmentId: null,
      isActive: true
    }
  });

  const selectedRoleId = watch('roleId');
  const selectedRole = roles.find((r) => r.roleId === selectedRoleId);
  const showDepartment = selectedRole?.roleName === 'TECHNICIAN';

  useEffect(() => {
    if (isOpen) {
      roleApi.getAll().then(setRoles).catch(console.error);
      departmentApi.getAll().then(setDepartments).catch(console.error);
      
      if (user) {
        setValue('fullName', user.fullName);
        setValue('email', user.email);
        setValue('phoneNumber', user.phoneNumber || '');
        setValue('roleId', user.roleId as number);
        setValue('departmentId', user.departmentId);
        setValue('isActive', user.isActive);
      } else {
        reset({ fullName: '', email: '', phoneNumber: '', password: '', roleId: 0, departmentId: null, isActive: true });
      }
    }
  }, [isOpen, user, setValue, reset]);

  useEffect(() => {
    if (!showDepartment) {
      setValue('departmentId', null);
    }
  }, [showDepartment, setValue]);

  const onSubmit = async (data: UserFormValues) => {
    try {
      setSubmitting(true);
      setError(null);
      
      if (!user && !data.password) {
        setError("Password is required for new users");
        setSubmitting(false);
        return;
      }

      const payload = {
        ...data,
        password: data.password || undefined
      };

      if (user) {
        await userApi.update(user.userId, payload);
      } else {
        await userApi.create(payload as any); // cast for required password in create
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${user ? 'update' : 'create'} user`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-card rounded-xl shadow-2xl border border-border overflow-hidden slide-in-from-bottom-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/20">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            {user ? 'Edit User Identity' : 'Create New Identity'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 bg-card text-foreground">
          <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-4 bg-destructive/10 text-destructive text-sm font-semibold rounded-lg border border-destructive/20">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
              <Input {...register('fullName')} placeholder="e.g. John Doe" className="bg-background border-border/50" />
              {errors.fullName && <p className="text-xs font-medium text-destructive mt-1">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
              <Input type="email" {...register('email')} placeholder="john@hospital.com" className="bg-background border-border/50" />
              {errors.email && <p className="text-xs font-medium text-destructive mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
              <Input type="tel" {...register('phoneNumber')} placeholder="+1 555 123 4567" className="bg-background border-border/50" />
              {errors.phoneNumber && <p className="text-xs font-medium text-destructive mt-1">{errors.phoneNumber.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{user ? 'Change Password (Optional)' : 'Security Password'}</Label>
              <Input type="password" {...register('password')} placeholder="••••••••" className="bg-background border-border/50" />
              {errors.password && <p className="text-xs font-medium text-destructive mt-1">{errors.password.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">System Role</Label>
                <select 
                  {...register('roleId', { valueAsNumber: true })}
                  className="w-full h-10 px-3 py-2 border rounded-md border-border/50 bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                >
                  <option value={0}>Select Role</option>
                  {roles.map(r => (
                    <option key={r.roleId} value={r.roleId}>{r.roleName}</option>
                  ))}
                </select>
                {errors.roleId && <p className="text-xs font-medium text-destructive mt-1">{errors.roleId.message}</p>}
              </div>

              {showDepartment && (
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hospital Department</Label>
                  <select 
                    {...register('departmentId', { setValueAs: v => v ? parseInt(v) : null })}
                    className="w-full h-10 px-3 py-2 border rounded-md border-border/50 bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                  >
                    <option value="">None / Global</option>
                    {departments.map(d => (
                      <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg border border-border/30 mt-4">
              <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">Account Status</span>
                  <span className="text-xs text-muted-foreground">Immediate system access enablement</span>
              </div>
              <input 
                type="checkbox" 
                {...register('isActive')} 
                className="w-5 h-5 rounded-md border-border bg-background text-primary focus:ring-primary/20 cursor-pointer" 
              />
            </div>
          </form>
        </div>

        <div className="px-6 py-4 bg-muted/30 border-t border-border/50 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={submitting} className="font-semibold">Cancel</Button>
          <Button form="user-form" type="submit" disabled={submitting} className="min-w-[120px] shadow-sm font-bold">
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {user ? 'Update Identity' : 'Create Identity'}
          </Button>
        </div>
      </div>
    </div>
  );
}
