import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { LogOut, User, Bell } from 'lucide-react';
import { Button } from '../ui/Button';

export default function Header() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background/80 backdrop-blur-md px-4 sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center">
            <h1 className="text-xl font-bold tracking-tight text-foreground">{getPageTitle()}</h1>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button type="button" className="-m-2.5 p-2.5 text-muted-foreground hover:text-foreground transition-colors">
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
          </button>
 
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" aria-hidden="true" />
 
            <div className="flex items-center gap-x-4">
            <div className="hidden lg:flex lg:flex-col lg:items-end">
                <span className="text-xs border border-border bg-muted/50 rounded-full px-3 py-1 font-semibold text-muted-foreground uppercase tracking-wider">
                    {user?.roleName || 'Loading...'}
                </span>
            </div>

            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-muted/60"
              aria-label="Open profile"
            >
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center border border-border shadow-sm">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="hidden xl:flex xl:flex-col xl:items-start text-sm pr-4">
                <span className="font-semibold text-foreground truncate max-w-[150px]">{user?.email || 'Unknown User'}</span>
              </div>
            </Link>
            
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
