import { useAuthStore } from '@/store/authStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { User, Mail, ShieldCheck, Building, Calendar, Loader2 } from 'lucide-react';

export default function ProfilePage() {
    const { user } = useAuthStore();

    if (!user) {
        return (
            <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-2">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">{user.fullName}</h1>
                  <p className="text-muted-foreground font-medium">Platform Access Credentials</p>
                </div>
            </div>

            <Card className="border-border/60 bg-card shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/40 pb-6">
                    <CardTitle className="text-lg font-bold">Identity Profile</CardTitle>
                    <CardDescription className="text-muted-foreground">Your account details and system permissions.</CardDescription>
                </CardHeader>
                <CardContent className="pt-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                <Mail className="w-3 h-3" /> Email Address
                            </div>
                            <p className="text-sm font-semibold text-foreground bg-muted/30 p-2 rounded-md border border-border/30">{user.email}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                <ShieldCheck className="w-3 h-3" /> System Role
                            </div>
                            <p className="text-sm font-bold text-primary bg-primary/5 p-2 rounded-md border border-primary/10 inline-block px-4">
                                {user.roleName || 'STANDARD_USER'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                <Building className="w-3 h-3" /> Department
                            </div>
                            <p className="text-sm font-semibold text-foreground bg-muted/30 p-2 rounded-md border border-border/30">
                                {user.departmentName || 'Global / Not Assigned'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                <Calendar className="w-3 h-3" /> Account ID
                            </div>
                            <p className="text-sm font-mono font-medium text-muted-foreground">ID: {user.userId}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="bg-muted/30 border border-border/50 rounded-xl p-4 flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">Security Settings</p>
                    <p className="text-xs text-muted-foreground">Control your multi-factor and password preferences.</p>
                </div>
                <button className="text-xs font-bold text-primary hover:underline hover:bg-primary/5 px-3 py-2 rounded-md transition-colors">
                    Manage Security
                </button>
            </div>
        </div>
    )
}
