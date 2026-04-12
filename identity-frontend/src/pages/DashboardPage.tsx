import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Users, UserCog, Building2, Activity, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { userApi, roleApi, departmentApi } from '@/api';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user: currentUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    users: 0,
    roles: 0,
    departments: 0
  });
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [users, roles, depts] = await Promise.all([
          userApi.getAll(),
          roleApi.getAll(),
          departmentApi.getAll()
        ]);
        
        setCounts({
          users: users.length,
          roles: roles.length,
          departments: depts.length
        });
      } catch (err) {
        console.error("Failed to fetch dashboard metrics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    { name: 'Total Users', value: counts.users.toString(), icon: Users, color: 'text-blue-600' },
    { name: 'Active Roles', value: counts.roles.toString(), icon: UserCog, color: 'text-indigo-600' },
    { name: 'Departments', value: counts.departments.toString(), icon: Building2, color: 'text-emerald-600' },
    { name: 'System Status', value: 'Healthy', icon: Activity, color: 'text-amber-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, <span className="text-primary">{currentUser?.fullName?.split(' ')[0] || 'Admin'}</span>
        </h2>
        <p className="text-muted-foreground">Real-time system overview and identity metrics.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="bg-card shadow-sm border-border/60 hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {stat.name}
              </CardTitle>
              <stat.icon className={cn("h-4 w-4", stat.color)} />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
}
