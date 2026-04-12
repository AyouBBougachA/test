import { useState, useEffect } from 'react';
import { userApi } from '@/api';
import { User } from '@/types';
import { Card, Button, Badge, Input } from '@/components/ui';
import { Search, Plus, Edit2, ShieldBan, ShieldCheck, Loader2, Trash2 } from 'lucide-react';
import UserModal from './UserModal';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAll();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      setFilteredUsers(users.filter(u => 
        u.email.toLowerCase().includes(q) || 
        u.fullName.toLowerCase().includes(q) ||
        (u.phoneNumber?.toLowerCase().includes(q) ?? false) ||
        (u.roleName?.toLowerCase().includes(q) ?? false)
      ));
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const handleToggleStatus = async (user: User) => {
    try {
      await userApi.updateStatus(user.userId, !user.isActive);
      fetchUsers();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Permanently delete ${user.fullName}? This cannot be undone.`)) return;
    try {
      await userApi.delete(user.userId);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };


  const openCreate = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">User Management</h2>
          <p className="text-muted-foreground mt-1 text-sm">Manage identities, roles, and system access.</p>
        </div>
        <Button onClick={openCreate} className="shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Add New User
        </Button>
      </div>

      <Card className="shadow-sm border-border/60 bg-card overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/30">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <Input 
              placeholder="Search users..." 
              className="pl-9 h-9 bg-background border-border/50 focus-visible:ring-primary/20" 
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Name</th>
                <th className="px-6 py-4 font-bold tracking-wider">Role</th>
                <th className="px-6 py-4 font-bold tracking-wider">Phone</th>
                <th className="px-6 py-4 font-bold tracking-wider">Department</th>
                <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                <th className="px-6 py-4 text-right font-bold tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 bg-card">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto opacity-40" /></td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-muted-foreground bg-muted/10">
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                <Search className="w-6 h-6 text-muted-foreground/40" />
                            </div>
                            <p className="font-semibold text-foreground">No users found</p>
                            <p className="text-xs max-w-[200px] mx-auto mt-1">We couldn't find any user matching your search criteria in the database.</p>
                        </div>
                    </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.userId} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="font-bold text-foreground">{u.fullName}</div>
                        <div className="text-muted-foreground text-xs">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="font-semibold">{u.roleName || 'No Role'}</Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-medium">
                      {u.phoneNumber || <span className="italic opacity-40">None</span>}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-medium">
                      {u.departmentName || <span className="italic opacity-40">None</span>}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={u.isActive ? "success" : "secondary"}>
                        {u.isActive ? "Active" : "Disabled"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                                variant="ghost" size="icon" 
                                title={u.isActive ? "Deactivate User" : "Activate User"}
                                onClick={() => handleToggleStatus(u)}
                                className={u.isActive ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"}
                            >
                                {u.isActive ? <ShieldBan className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10" onClick={() => openEdit(u)}>
                                <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Delete User"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(u)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <UserModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={fetchUsers} 
        user={selectedUser} 
      />
    </div>
  );
}
