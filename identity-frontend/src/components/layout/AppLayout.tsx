import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-8 w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
