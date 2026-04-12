import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, Building2, Hospital, Package, Activity, ScrollText } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Roles', href: '/roles', icon: UserCog },
  { name: 'Departments', href: '/departments', icon: Building2 },
  { name: 'Equipment', href: '/equipment', icon: Package },
  { name: 'Meters', href: '/meters', icon: Activity },
  { name: 'Logs', href: '/logs', icon: ScrollText },
];

export default function Sidebar() {
  return (
    <div className="hidden md:flex md:w-64 md:flex-col border-r border-border bg-[#f8fafc]">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-border/50 bg-white">
        <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                <Hospital className="w-5.5 h-5.5" />
            </div>
            <div className="flex flex-col -space-y-1">
                <span className="text-sm font-black tracking-tight text-foreground uppercase">CMMS</span>
                <span className="text-[10px] font-bold tracking-[0.2em] text-primary/70 uppercase">Identity</span>
            </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 space-y-1.5 px-4 py-8">
          <div className="px-3 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 mb-5">
            System Infrastructure
          </div>
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  isActive
                    ? 'bg-blue-50/50 text-slate-900 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.1)] font-bold'
                    : 'text-slate-500 hover:bg-slate-200/40 hover:text-slate-900',
                  'group relative flex items-center rounded-lg px-3 py-2.5 text-sm transition-all duration-200 border border-transparent'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  )}
                  <item.icon
                    className={cn(
                      isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600',
                      'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200'
                    )}
                    aria-hidden="true"
                  />
                  <span className="tracking-tight">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-border/50 bg-white/50">
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-1">System Version</p>
              <p className="text-xs font-bold text-slate-900">v2.0.1 Enterprise</p>
          </div>
      </div>
    </div>
  );
}
