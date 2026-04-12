import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { LogIn, Loader2, Hospital } from 'lucide-react';
import { authApi } from '@/api/authApi';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { Button, Input, Label, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await authApi.login(data);
      login(res);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen relative overflow-hidden bg-background text-foreground">
      {/* Premium Multi-layered Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-40"></div>
      
      <div className="relative z-10 w-full flex flex-col md:flex-row h-full">
        <div className="hidden md:flex md:w-1/2 flex-col justify-center px-16 lg:px-24 bg-slate-50/50 border-r border-border/50">
            <div className="flex items-center gap-3 mb-10 translate-y-[-100px]">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <Hospital className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-foreground">CMMS Platform</span>
            </div>
            
            <div className="max-w-md space-y-6">
                <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight text-foreground">
                    Modern Identity <br />
                    <span className="text-primary italic">for Healthcare.</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                    Secure, high-performance authentication infrastructure tailored for sterile hospital environments and complex medical workflows.
                </p>
                <div className="flex items-center gap-4 pt-6">
                    <div className="flex -space-x-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                MD
                            </div>
                        ))}
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Trusted by 500+ hospital administrators globally.</p>
                </div>
            </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
            <div className="w-full max-w-sm space-y-8">
                <div className="md:hidden flex flex-col items-center gap-4 mb-8">
                    <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Hospital className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">CMMS Identity</h1>
                </div>

                <div className="space-y-2 text-center md:text-left">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Sign in</h2>
                    <p className="text-muted-foreground">Enter your credentials to access the dashboard</p>
                </div>

                <Card className="border-border/60 shadow-xl shadow-slate-200/50 bg-card">
                  <CardHeader className="sr-only">
                      <CardTitle>Login form</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                      {error && (
                          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold animate-in shake duration-300">
                            {error}
                          </div>
                      )}
                      <div className="space-y-2">
                          <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                          <Input
                          id="email"
                          type="email"
                          placeholder="admin@hospital.com"
                          disabled={isLoading}
                          {...register('email')}
                          className={cn(
                            "bg-background h-11 border-border/50 transition-all focus:ring-primary/20",
                            errors.email ? 'border-destructive focus-visible:ring-destructive' : ''
                          )}
                          />
                          {errors.email && <p className="text-xs font-medium text-destructive mt-1">{errors.email.message}</p>}
                      </div>
                      <div className="space-y-2">
                          <div className="flex items-center justify-between">
                              <Label htmlFor="password" title="Enter your password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                              <a href="#" className="text-xs font-bold text-primary hover:underline">Forgot?</a>
                          </div>
                          <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          disabled={isLoading}
                          {...register('password')}
                          className={cn(
                            "bg-background h-11 border-border/50 transition-all focus:ring-primary/20",
                            errors.password ? 'border-destructive focus-visible:ring-destructive' : ''
                          )}
                          />
                          {errors.password && <p className="text-xs font-medium text-destructive mt-1">{errors.password.message}</p>}
                      </div>
                      <Button type="submit" className="w-full h-11 text-base font-bold shadow-lg shadow-primary/20" disabled={isLoading}>
                          {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Authenticating...
                            </>
                          ) : (
                            <>
                                <LogIn className="mr-2 h-5 w-5" />
                                Login to Dashboard
                            </>
                          )}
                      </Button>
                      </form>
                  </CardContent>
                  <CardFooter className="flex justify-center border-t border-border/40 bg-muted/20 py-4">
                      <p className="text-xs font-medium text-muted-foreground">
                          Security level: <span className="text-emerald-600 font-bold">Standard AES-256</span>
                      </p>
                  </CardFooter>
                </Card>

                <p className="text-center text-xs text-muted-foreground px-8">
                    By logging in, you agree to our <span className="font-bold cursor-pointer hover:text-foreground underline">Terms of Service</span> and <span className="font-bold cursor-pointer hover:text-foreground underline">Privacy Policy</span>.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
