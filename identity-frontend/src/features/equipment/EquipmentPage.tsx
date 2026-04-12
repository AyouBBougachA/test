import { useState, useEffect } from 'react';
import { equipmentApi } from '@/api/equipmentApi';
import { departmentApi } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { Equipment, Department } from '@/types';
import { Card, Button, Badge, Input } from '@/components/ui';
import { Search, Plus, Edit2, History, Archive, Loader2, Package, MapPin, Hash, FileText, RotateCcw, Layers, Boxes } from 'lucide-react';
import EquipmentModal from './EquipmentModal';
import HistoryModal from './HistoryModal';
import DocumentModal from './DocumentModal';
import CategoryManagerModal from './CategoryManagerModal';
import ModelManagerModal from './ModelManagerModal';

// Simple debounce hook helper
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function EquipmentPage() {
  const { user } = useAuthStore();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search parameters
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 400);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<number | ''>('');
  
  const [departments, setDepartments] = useState<Department[]>([]);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [modelManagerOpen, setModelManagerOpen] = useState(false);
  const [optionsVersion, setOptionsVersion] = useState(0);
  
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyEquipmentId, setHistoryEquipmentId] = useState<number | null>(null);
  
  const [documentOpen, setDocumentOpen] = useState(false);
  const [documentEquipmentId, setDocumentEquipmentId] = useState<number | null>(null);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const data = await equipmentApi.search(
          departmentFilter === '' ? undefined : departmentFilter,
          statusFilter === '' ? undefined : statusFilter,
          debouncedQuery === '' ? undefined : debouncedQuery
      );
      setEquipment(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    departmentApi.getAll().then(setDepartments).catch(() => setDepartments([]));
  }, []);

  useEffect(() => {
    fetchEquipment();
  }, [debouncedQuery, statusFilter, departmentFilter]);

  const handleArchive = async (id: number) => {
    if (!window.confirm("Are you sure you want to archive this equipment? It will no longer appear in active lists.")) return;
    try {
      await equipmentApi.archive(id);
      fetchEquipment();
    } catch (err) {
      alert('Failed to archive equipment');
    }
  };

  const handleRestore = async (id: number) => {
    if (!window.confirm("Restore this equipment to Operational status?")) return;
    try {
      await equipmentApi.updateStatus(id, 'OPERATIONAL');
      fetchEquipment();
    } catch (err) {
      alert('Failed to restore equipment');
    }
  };

  const openCreate = () => {
    setSelectedEquipment(null);
    setModalOpen(true);
  };

  const openEdit = (e: Equipment) => {
    setSelectedEquipment(e);
    setModalOpen(true);
  };

  const openHistory = (id: number) => {
    setHistoryEquipmentId(id);
    setHistoryOpen(true);
  };

  const openDocuments = (id: number) => {
    setDocumentEquipmentId(id);
    setDocumentOpen(true);
  };

  const getStatusVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case 'OPERATIONAL': return 'success';
      case 'UNDER_REPAIR': return 'default';
      case 'ARCHIVED': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Equipment Inventory</h2>
          <p className="text-muted-foreground mt-1 text-sm">Manage clinical assets, track history, and monitor status.</p>
        </div>
        {(user?.roleName === 'ADMIN' || user?.roleName === 'MANAGER') && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => setCategoryManagerOpen(true)} className="shadow-sm">
              <Layers className="w-4 h-4 mr-2" />
              Manage Categories
            </Button>
            <Button variant="outline" onClick={() => setModelManagerOpen(true)} className="shadow-sm">
              <Boxes className="w-4 h-4 mr-2" />
              Manage Models
            </Button>
            <Button onClick={openCreate} className="shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Equipment
            </Button>
          </div>
        )}
      </div>

      <Card className="shadow-sm border-border/60 bg-card overflow-hidden">
        <div className="p-4 border-b border-border/50 flex flex-wrap items-center gap-4 bg-muted/30">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <Input 
              placeholder="Search by name, serial, or location..." 
              className="pl-9 h-9 bg-background border-border/50 focus-visible:ring-primary/20" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select 
            className="h-9 rounded-md border border-border/50 bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="OPERATIONAL">Operational</option>
            <option value="UNDER_REPAIR">Under Repair</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          
          <select 
            className="h-9 rounded-md border border-border/50 bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
                <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Equipment Details</th>
                <th className="px-6 py-4 font-bold tracking-wider">Location</th>
                <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                <th className="px-6 py-4 text-right font-bold tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 bg-card relative">
              {loading && equipment.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto opacity-40" /></td></tr>
              ) : equipment.length === 0 ? (
                <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-muted-foreground bg-muted/10">
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                <Package className="w-6 h-6 text-muted-foreground/40" />
                            </div>
                            <p className="font-semibold text-foreground italic">No equipment found</p>
                            <p className="text-xs max-w-[200px] mx-auto mt-1">Start by adding your first clinical asset to the system.</p>
                        </div>
                    </td>
                </tr>
              ) : (
                equipment.map((e) => (
                  <tr key={e.equipmentId} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
                                <Package className="w-4.5 h-4.5" />
                            </div>
                            <div>
                                <div className="font-bold text-foreground">{e.name}</div>
                                <div className="text-muted-foreground text-xs flex items-center gap-1">
                                    <Hash className="w-3 h-3 opacity-50" />
                                    {e.serialNumber}
                                </div>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5 opacity-50" />
                            <span className="font-medium">{e.location}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusVariant(e.status)}>
                        {e.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-primary hover:bg-primary/10" onClick={() => openHistory(e.equipmentId)}>
                                <History className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-primary hover:bg-primary/10" onClick={() => openDocuments(e.equipmentId)}>
                                <FileText className="w-4 h-4" />
                            </Button>
                            {(user?.roleName === 'ADMIN' || user?.roleName === 'MANAGER') && (
                                <>
                                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-primary hover:bg-primary/10" onClick={() => openEdit(e)}>
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    {e.status === 'ARCHIVED' ? (
                                      <Button variant="ghost" size="icon" className="text-slate-500 hover:text-emerald-600 hover:bg-emerald-50" onClick={() => handleRestore(e.equipmentId)}>
                                        <RotateCcw className="w-4 h-4" />
                                      </Button>
                                    ) : (
                                      <Button variant="ghost" size="icon" className="text-slate-500 hover:text-destructive hover:bg-destructive/10" onClick={() => handleArchive(e.equipmentId)}>
                                        <Archive className="w-4 h-4" />
                                      </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <EquipmentModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={fetchEquipment} 
        equipment={selectedEquipment} 
        optionsVersion={optionsVersion}
      />

      <CategoryManagerModal
        isOpen={categoryManagerOpen}
        onClose={() => setCategoryManagerOpen(false)}
        onChange={() => setOptionsVersion((prev) => prev + 1)}
      />

      <ModelManagerModal
        isOpen={modelManagerOpen}
        onClose={() => setModelManagerOpen(false)}
        onChange={() => setOptionsVersion((prev) => prev + 1)}
      />

      {historyEquipmentId && (
        <HistoryModal
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
          equipmentId={historyEquipmentId}
        />
      )}

      {documentEquipmentId && (
        <DocumentModal
          isOpen={documentOpen}
          onClose={() => setDocumentOpen(false)}
          equipmentId={documentEquipmentId}
        />
      )}
    </div>
  );
}
